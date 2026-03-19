using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public class DashboardService(ApplicationDbContext db) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct)
    {
        var totalExpenses = await db.Expenses
            .Where(x => x.UserId == userId)
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;

        var now = DateTime.UtcNow;
        var monthStart = new DateOnly(now.Year, now.Month, 1);
        var nextMonthStart = monthStart.AddMonths(1);

        var monthTotal = await db.Expenses
            .Where(x => x.UserId == userId && x.Date >= monthStart && x.Date < nextMonthStart)
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;

        var categories = await db.Categories.CountAsync(x => x.UserId == userId, ct);

        return new DashboardSummaryDto(totalExpenses, monthTotal, categories);
    }

    public async Task<IReadOnlyList<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId, DateOnly? from, DateOnly? to, CancellationToken ct)
    {
        var query = db.Expenses
            .AsNoTracking()
            .Where(x => x.UserId == userId);

        if (from is not null) query = query.Where(x => x.Date >= from);
        if (to is not null) query = query.Where(x => x.Date <= to);

        var rows = await query
            .Select(x => new
            {
                x.CategoryId,
                CategoryName = x.Category!.Name,
                x.Amount
            })
            .ToListAsync(ct);

        var data = rows
            .GroupBy(x => new { x.CategoryId, x.CategoryName })
            .Select(g => new CategoryBreakdownDto(g.Key.CategoryId, g.Key.CategoryName, g.Sum(x => x.Amount)))
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        return data;
    }

    public async Task<IReadOnlyList<MonthlyExpensesPointDto>> GetMonthlyExpensesAsync(Guid userId, int monthsBack, CancellationToken ct)
    {
        monthsBack = Math.Clamp(monthsBack, 1, 36);

        var now = DateTime.UtcNow;
        var start = new DateOnly(now.Year, now.Month, 1).AddMonths(-(monthsBack - 1));
        var endExclusive = new DateOnly(now.Year, now.Month, 1).AddMonths(1);

        var raw = await db.Expenses
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.Date >= start && x.Date < endExclusive)
            .GroupBy(x => new { x.Date.Year, x.Date.Month })
            .Select(g => new MonthlyExpensesPointDto(g.Key.Year, g.Key.Month, g.Sum(x => x.Amount)))
            .ToListAsync(ct);

        var map = raw.ToDictionary(x => (x.Year, x.Month), x => x.TotalAmount);
        var points = new List<MonthlyExpensesPointDto>();

        var cursor = start;
        while (cursor < endExclusive)
        {
            map.TryGetValue((cursor.Year, cursor.Month), out var total);
            points.Add(new MonthlyExpensesPointDto(cursor.Year, cursor.Month, total));
            cursor = cursor.AddMonths(1);
        }

        return points;
    }
}

