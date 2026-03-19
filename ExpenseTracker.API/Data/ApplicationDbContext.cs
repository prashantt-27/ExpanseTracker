using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Name).IsRequired();
            b.Property(x => x.Email).IsRequired();
            b.Property(x => x.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.Property(x => x.Name).IsRequired();
            b.HasIndex(x => new { x.UserId, x.Name }).IsUnique();

            b.HasOne(x => x.User)
                .WithMany(x => x.Categories)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(b =>
        {
            b.Property(x => x.Title).IsRequired();
            b.Property(x => x.Amount).HasPrecision(12, 2);

            b.HasOne(x => x.User)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Category)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.UserId, x.Date });
            b.HasIndex(x => new { x.UserId, x.CategoryId });
        });
    }
}

