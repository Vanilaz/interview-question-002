namespace Example.Auth.Api.Services
{
    public class TokenService(IOptions<JwtSettings> jwtOptions) : ITokenService
    {
        private readonly JwtSettings _jwtSettings = jwtOptions.Value;
        public (string Token, DateTime ExpiresAtUtc) GenerateJwtToken(User user)
        {
            var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var claims = new List<Claim>()
            {
                new(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new(ClaimTypes.Name,user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };


            //กำหนดสิทธิ์และเวลาหมด
            var now = DateTime.UtcNow;
            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = cred,
                NotBefore = now,
                IssuedAt = now,
                Expires = expiresAtUtc
            };


            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(securityToken);

            return (tokenString, expiresAtUtc);
        }
    }
}
