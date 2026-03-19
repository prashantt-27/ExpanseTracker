using ExpenseTracker.API.DTOs;

namespace ExpenseTracker.API.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct);
    Task<IReadOnlyList<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId, DateOnly? from, DateOnly? to, CancellationToken ct);
    Task<IReadOnlyList<MonthlyExpensesPointDto>> GetMonthlyExpensesAsync(Guid userId, int monthsBack, CancellationToken ct);
}

