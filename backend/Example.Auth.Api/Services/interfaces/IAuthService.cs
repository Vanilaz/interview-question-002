using Example.Auth.Api.Models;

namespace Example.Auth.Api.Services.interfaces;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage, UserResponse? User)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<(bool Success, string? ErrorMessage, AuthResponse? Data)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse?> GetProfileAsync(string username, CancellationToken cancellationToken = default);
}
