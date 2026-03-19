using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken ct)
    {
        var userId = UserClaims.GetUserId(User);
        var rows = await categories.GetAllAsync(userId, ct);
        return Ok(rows);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var userId = UserClaims.GetUserId(User);
            var created = await categories.CreateAsync(userId, request, ct);
            return Ok(created);
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
        await categories.DeleteAsync(userId, id, ct);
        return NoContent();
    }
}

