
namespace Example.Auth.Api.Services
{
    public class AuthService(AppDbContext context, ITokenService tokenService, ILogger<AuthService> logger, IOptions<JwtSettings> jwtOptions) : IAuthService
    {
        private readonly JwtSettings _jwtSettings = jwtOptions.Value;

        public async Task<UserResponse?> GetProfileAsync(string username, CancellationToken cancellationToken = default)
        {
            var user = await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower(), cancellationToken);

            return user is null ? null : new UserResponse(user.Id, user.Username, user.CreateAt);
        }

        public async Task<(bool Success, string? ErrorMessage, AuthResponse? Data)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var username = request.Username.Trim();

                var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower(), cancellationToken);

                if (user is null) return (false, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", null);

                var isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.Password);

                if (!isPasswordValid) return (false, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", null);


                var (token, expiresAt) = tokenService.GenerateJwtToken(user);


                var response = new AuthResponse(token, user.Username, expiresAt);

                return (true, null, response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "เกิดข้อผิดพลาดในการเข้าสู่ระบบสำหรับผู้ใช้ {User}", request.Username);
                return (false, "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง", null);
            }

        }

        public async Task<(bool Success, string? ErrorMessage, UserResponse? User)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var username = request.Username.Trim();

                if (request.Password != request.ConfirmPassword)
                {
                    return (false, "Password และ Confirm Password จะต้องเหมือนกัน", null);
                }


                //ตรวจสอบชื่อผู้ใช้งานที่เคยลงทะเบียนแล้ว
                var exists = await context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower(), cancellationToken);
                if (exists)
                {
                    return (false, $"User '{username}' มีอยู่ในระบบแล้ว", null);
                }


                var passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password);

                // เตรียมข้อมูลผู้ใช้
                var user = new User()
                {
                    Username = username,
                    Password = passwordHash,
                };


                //บันทึกลงฐานข้อมูล
                await context.Users.AddAsync(user, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);

                return (true, null, new UserResponse(user.Id, user.Username, user.CreateAt));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "เกิดข้อผิดพลาดในการลงทะเบียนสำหรับผู้ใช้ {User}", request.Username);
                return (false, "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง", null);
            }

        }
    }
}
