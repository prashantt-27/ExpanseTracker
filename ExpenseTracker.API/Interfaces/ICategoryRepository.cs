using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(Guid userId, CancellationToken ct);
    Task<Category?> GetByIdAsync(Guid userId, Guid id, CancellationToken ct);
    Task AddAsync(Category category, CancellationToken ct);
    Task DeleteAsync(Category category, CancellationToken ct);
    Task<bool> ExistsByNameAsync(Guid userId, string name, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

