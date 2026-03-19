using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Services;

public class ExpenseService(IExpenseRepository expenses, ICategoryRepository categories) : IExpenseService
{
    public async Task<IReadOnlyList<ExpenseDto>> GetAllAsync(
        Guid userId,
        DateOnly? from,
        DateOnly? to,
        Guid? categoryId,
        string? search,
        CancellationToken ct)
    {
        var rows = await expenses.GetAllAsync(userId, ct);
        IEnumerable<Expense> query = rows;

        if (from is not null) query = query.Where(x => x.Date >= from);
        if (to is not null) query = query.Where(x => x.Date <= to);
        if (categoryId is not null) query = query.Where(x => x.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.Title.ToLower().Contains(s) ||
                (x.Notes != null && x.Notes.ToLower().Contains(s)) ||
                (x.Category != null && x.Category.Name.ToLower().Contains(s)));
        }

        return query
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.CreatedAt)
            .Select(ToDto)
            .ToList();
    }

    public async Task<ExpenseDto> GetByIdAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var row = await expenses.GetByIdAsync(userId, id, ct);
        if (row is null)
            throw new KeyNotFoundException("Expense not found.");

        return ToDto(row);
    }

    public async Task<ExpenseDto> CreateAsync(Guid userId, CreateExpenseRequest request, CancellationToken ct)
    {
        var category = await categories.GetByIdAsync(userId, request.CategoryId, ct);
        if (category is null)
            throw new InvalidOperationException("Invalid category.");

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Amount = request.Amount,
            Date = request.Date,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await expenses.AddAsync(expense, ct);
        await expenses.SaveChangesAsync(ct);

        // Reload with Category included (repo GetAll has Include, but Add doesn't)
        var created = await expenses.GetByIdAsync(userId, expense.Id, ct) ?? expense;
        created.Category ??= category;

        return ToDto(created);
    }

    public async Task<ExpenseDto> UpdateAsync(Guid userId, Guid id, UpdateExpenseRequest request, CancellationToken ct)
    {
        var expense = await expenses.GetByIdAsync(userId, id, ct);
        if (expense is null)
            throw new KeyNotFoundException("Expense not found.");

        var category = await categories.GetByIdAsync(userId, request.CategoryId, ct);
        if (category is null)
            throw new InvalidOperationException("Invalid category.");

        expense.Title = request.Title.Trim();
        expense.Amount = request.Amount;
        expense.Date = request.Date;
        expense.CategoryId = request.CategoryId;
        expense.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await expenses.SaveChangesAsync(ct);

        expense.Category = category;
        return ToDto(expense);
    }

    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var expense = await expenses.GetByIdAsync(userId, id, ct);
        if (expense is null)
            return;

        await expenses.DeleteAsync(expense, ct);
        await expenses.SaveChangesAsync(ct);
    }

    private static ExpenseDto ToDto(Expense x) =>
        new(
            x.Id,
            x.Title,
            x.Amount,
            x.Date,
            x.CategoryId,
            x.Category?.Name ?? "",
            x.Notes,
            x.CreatedAt
        );
}

