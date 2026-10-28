using Example.Auth.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Example.Auth.Api.Data
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
    }
}
