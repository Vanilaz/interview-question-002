using System.Security.Claims;
using Example.Auth.Api.Models;
using Example.Auth.Api.Security;
using Example.Auth.Api.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Example.Auth.Api.Controllers
{
    /// <summary>
    /// คอนโทรลเลอร์สำหรับบริหารจัดการระบบยืนยันตัวตน (Authentication & Authorization)
    /// รองรับข้อกำหนดแบบฟอร์ม IT 02-1, IT 02-2, และ IT 02-3
    /// ออกแบบตามหลักการ Clean Architecture, RESTful Standards และ Bank-grade Security
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService, ILogger<AuthController> logger, IOptions<JwtSettings> options) : ControllerBase
    {
        private readonly JwtSettings _jwtSettings = options.Value;

        /// <summary>
        /// สมัครสมาชิก (Form IT 02-2)
        /// รับข้อมูล User, Password, Confirm Password และจัดเก็บรหัสผ่านที่ผ่านการเข้ารหัส BCrypt ลงฐานข้อมูล SQLite
        /// </summary>
        /// <param name="request">ข้อมูลการสมัครสมาชิก</param>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>HTTP 201 Created เมื่อสำเร็จ หรือ HTTP 400/409 เมื่อเกิดข้อผิดพลาด</returns>
        [AllowAnonymous]
        [HttpPost("register")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var (success, errorMessage, user) = await authService.RegisterAsync(request, cancellationToken);
                if (!success)
                {
                    if (errorMessage != null && errorMessage.Contains("มีอยู่ในระบบแล้ว"))
                    {
                        return Conflict(new { detail = errorMessage });
                    }
                    return BadRequest(new { detail = errorMessage });
                }

                return StatusCode(StatusCodes.Status201Created, user);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "เกิดข้อผิดพลาดในการลงทะเบียน");
                return StatusCode(500, new { message = "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง" });
            }
        }

        /// <summary>
        /// ลงชื่อเข้าใช้งาน (Form IT 02-1)
        /// ตรวจสอบ Credential และบันทึก JWT Token ลงใน HttpOnly Cookie (ป้องกัน XSS 100%)
        /// </summary>
        /// <param name="request">ข้อมูล User และ Password</param>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>HTTP 200 OK พร้อม Cookie เมื่อสำเร็จ หรือ HTTP 401 เมื่อเข้าสู่ระบบไม่ผ่าน</returns>
        [AllowAnonymous]
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var (success, errorMessage, authResponse) = await authService.LoginAsync(request, cancellationToken);
                if (!success || authResponse is null)
                {
                    return Unauthorized(new { message = errorMessage });
                }

                // ตรวจสอบ Origin ของคำขอ เพื่อตั้งค่า Cookie ให้รองรับทั้ง HTTPS Cross-Site และ HTTP Same-Origin
                var origin = Request.Headers.Origin.ToString();
                var isHttpsOrigin = Request.IsHttps || origin.StartsWith("https");

                // บันทึก JWT ลงใน HttpOnly Cookie
                Response.Cookies.Append(_jwtSettings.CookieName, authResponse.Token, new CookieOptions
                {
                    HttpOnly = true,                                                 // ป้องกัน JavaScript เข้าถึง Cookie (XSS Immunity)
                    Secure = isHttpsOrigin || _jwtSettings.CookieSecure,             // บังคับส่งผ่าน Secure Channel เมื่อใช้งาน HTTPS
                    SameSite = isHttpsOrigin ? SameSiteMode.None : SameSiteMode.Lax, // รองรับ Cross-Scheme localhost บน Chromium
                    Expires = authResponse.ExpiresInMinutes,                         // กำหนดอายุคุกกี้ตามอายุของ JWT Token
                    Path = "/"
                });

                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
                return StatusCode(500, new { message = "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง" });
            }
        }

        /// <summary>
        /// ออกจากระบบ
        /// ล้าง HttpOnly Cookie ออกจากเบราว์เซอร์ของผู้ใช้งาน
        /// </summary>
        /// <returns>HTTP 200 OK แจ้งเตือนออกจากระบบสำเร็จ</returns>
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Logout()
        {
            var origin = Request.Headers.Origin.ToString();
            var isHttpsOrigin = Request.IsHttps || origin.StartsWith("https");

            Response.Cookies.Delete(_jwtSettings.CookieName, new CookieOptions
            {
                Secure = isHttpsOrigin || _jwtSettings.CookieSecure,
                SameSite = isHttpsOrigin ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/"
            });
            return Ok(new { message = "ออกจากระบบสำเร็จ" });
        }

        /// <summary>
        /// ตรวจสอบ JWT Token (Form IT 02-3)
        /// ตรวจสอบความถูกต้องและอายุของ JWT Token ผ่าน Cookie เพื่อยืนยันตัวตนผู้ใช้
        /// </summary>
        /// <returns>HTTP 200 OK พร้อมข้อมูล Username และสถานะ Validated</returns>
        [Authorize]
        [HttpGet("validate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult ValidateToken()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Ok(new
            {
                isValid = true,
                username,
                validatedAtUtc = DateTime.UtcNow
            });
        }

        /// <summary>
        /// ดึงข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน (RESTful Endpoint Alias)
        /// </summary>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>ข้อมูลโปรไฟล์ผู้ใช้งาน</returns>
        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized();
            }

            var user = await authService.GetProfileAsync(username);
            if (user is null)
            {
                return NotFound(new { message = "ไม่พบข้อมูลผู้ใช้งาน" });
            }

            return Ok(user);
        }
    }
}
