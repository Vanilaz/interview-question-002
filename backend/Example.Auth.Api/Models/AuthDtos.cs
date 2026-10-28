using System.ComponentModel.DataAnnotations;

namespace Example.Auth.Api.Models
{
    public record RegisterRequest
    {
        [Required(ErrorMessage = "กรุณาระบุ Username")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username ต้องมีความยาว 3 ถึง 50 ตัวอักษร")]
        public string Username { get; init; } = string.Empty;

        [Required(ErrorMessage = "กรุณาระบุ Password")]
        [StringLength(72, MinimumLength = 4, ErrorMessage = "Password ต้องมีอย่างน้อย 4 ตัวอักษร")]
        public string Password { get; init; } = string.Empty;

        [Required(ErrorMessage = "กรุณาระบุ Confirm Password")]
        [Compare(nameof(Password), ErrorMessage = "Password และ Confirm Password จะต้องเหมือนกัน")]
        public string ConfirmPassword { get; init; } = string.Empty;
    }

    public record LoginRequest
    {
        [Required(ErrorMessage = "กรุณาระบุ Username")]
        public string Username { get; init; } = string.Empty;

        [Required(ErrorMessage = "กรุณาระบุ Password")]
        public string Password { get; init; } = string.Empty;
    }

    public record AuthResponse(
        string Token,
        string Username,
        DateTime ExpiresInMinutes
    );

    public record UserResponse(
    Guid Id,
    string Username,
    DateTime CreatedAtUtc
);
}
