using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Interfaces;

public interface IExpenseRepository
{
    Task<List<Expense>> GetAllAsync(Guid userId, CancellationToken ct);
    Task<Expense?> GetByIdAsync(Guid userId, Guid id, CancellationToken ct);
    Task AddAsync(Expense expense, CancellationToken ct);
    Task DeleteAsync(Expense expense, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

