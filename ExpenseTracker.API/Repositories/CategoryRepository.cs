using ExpenseTracker.API.Data;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Repositories;

public class CategoryRepository(ApplicationDbContext db) : ICategoryRepository
{
    public Task<List<Category>> GetAllAsync(Guid userId, CancellationToken ct) =>
        db.Categories
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

    public Task<Category?> GetByIdAsync(Guid userId, Guid id, CancellationToken ct) =>
        db.Categories.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == id, ct);

    public async Task AddAsync(Category category, CancellationToken ct) =>
        await db.Categories.AddAsync(category, ct);

    public Task DeleteAsync(Category category, CancellationToken ct)
    {
        db.Categories.Remove(category);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsByNameAsync(Guid userId, string name, CancellationToken ct)
    {
        var normalized = name.Trim().ToLowerInvariant();
        return db.Categories.AnyAsync(x => x.UserId == userId && x.Name.ToLower() == normalized, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}

