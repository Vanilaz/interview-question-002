using Example.Auth.Api.Entities;

namespace Example.Auth.Api.Services.interfaces
{
    public interface ITokenService
    {
        public (string Token, DateTime ExpiresAtUtc) GenerateJwtToken(User user);
    }
}
