using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Authorize]
[Route("api/expenses")]
public class ExpensesController(IExpenseService expenses) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExpenseDto>>> GetAll(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var userId = UserClaims.GetUserId(User);
        var rows = await expenses.GetAllAsync(userId, from, to, categoryId, search, ct);
        return Ok(rows);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExpenseDto>> GetById([FromRoute] Guid id, CancellationToken ct)
    {
        try
        {
            var userId = UserClaims.GetUserId(User);
            var row = await expenses.GetByIdAsync(userId, id, ct);
            return Ok(row);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create([FromBody] CreateExpenseRequest request, CancellationToken ct)
    {
        try
        {
            var userId = UserClaims.GetUserId(User);
            var created = await expenses.CreateAsync(userId, request, ct);
            return Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExpenseDto>> Update([FromRoute] Guid id, [FromBody] UpdateExpenseRequest request, CancellationToken ct)
    {
        try
        {
            var userId = UserClaims.GetUserId(User);
            var updated = await expenses.UpdateAsync(userId, id, request, ct);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken ct)
    {
        var userId = UserClaims.GetUserId(User);
        await expenses.DeleteAsync(userId, id, ct);
        return NoContent();
    }
}

