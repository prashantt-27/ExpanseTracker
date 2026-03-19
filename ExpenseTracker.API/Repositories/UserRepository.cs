using ExpenseTracker.API.Data;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Repositories;

public class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(User user, CancellationToken ct) =>
        await db.Users.AddAsync(user, ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct) =>
        db.Users.AnyAsync(x => x.Email == email, ct);

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}

