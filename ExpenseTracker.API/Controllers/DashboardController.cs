using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController(IDashboardService dashboard) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken ct)
    {
        var userId = UserClaims.GetUserId(User);
        var dto = await dashboard.GetSummaryAsync(userId, ct);
        return Ok(dto);
    }

    [HttpGet("category-breakdown")]
    public async Task<ActionResult<IReadOnlyList<CategoryBreakdownDto>>> CategoryBreakdown(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        var userId = UserClaims.GetUserId(User);
        var dto = await dashboard.GetCategoryBreakdownAsync(userId, from, to, ct);
        return Ok(dto);
    }

    [HttpGet("monthly-expenses")]
    public async Task<ActionResult<IReadOnlyList<MonthlyExpensesPointDto>>> MonthlyExpenses(
        [FromQuery] int monthsBack = 12,
        CancellationToken ct = default)
    {
        var userId = UserClaims.GetUserId(User);
        var dto = await dashboard.GetMonthlyExpensesAsync(userId, monthsBack, ct);
        return Ok(dto);
    }
}

