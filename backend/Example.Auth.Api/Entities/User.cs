namespace Example.Auth.Api.Entities
{
    public sealed class User
    {
        public Guid Id { get; init; } = Guid.NewGuid();
        public required string Username { get; set; } = string.Empty;
        public required string Password { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
    }
}
