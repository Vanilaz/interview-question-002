namespace Example.Auth.Api.Security
{
    public sealed class JwtSettings
    {
        public string Secret { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpirationMinutes { get; set; } = 15;
        public string CookieName { get; set; } = "__Host-access_token";
        public bool CookieSecure { get; set; } = false;
    }
}
