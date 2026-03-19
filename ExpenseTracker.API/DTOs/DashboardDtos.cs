namespace ExpenseTracker.API.DTOs;

public record DashboardSummaryDto(decimal TotalExpenses, decimal CurrentMonthExpenses, int TotalCategories);

public record CategoryBreakdownDto(Guid CategoryId, string CategoryName, decimal TotalAmount);

public record MonthlyExpensesPointDto(int Year, int Month, decimal TotalAmount);

