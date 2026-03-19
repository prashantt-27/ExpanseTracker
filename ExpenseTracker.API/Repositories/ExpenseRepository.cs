using ExpenseTracker.API.Data;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Repositories;

public class ExpenseRepository(ApplicationDbContext db) : IExpenseRepository
{
    public Task<List<Expense>> GetAllAsync(Guid userId, CancellationToken ct) =>
        db.Expenses
            .Include(x => x.Category)
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public Task<Expense?> GetByIdAsync(Guid userId, Guid id, CancellationToken ct) =>
        db.Expenses
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == id, ct);

    public async Task AddAsync(Expense expense, CancellationToken ct) =>
        await db.Expenses.AddAsync(expense, ct);

    public Task DeleteAsync(Expense expense, CancellationToken ct)
    {
        db.Expenses.Remove(expense);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) =>
        db.SaveChangesAsync(ct);
}

