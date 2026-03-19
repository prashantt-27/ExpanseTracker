using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.DTOs;

public record ExpenseDto(
    Guid Id,
    string Title,
    decimal Amount,
    DateOnly Date,
    Guid CategoryId,
    string CategoryName,
    string? Notes,
    DateTime CreatedAt
);

public record CreateExpenseRequest(
    [Required, MaxLength(160)] string Title,
    [Range(0.01, 999999999)] decimal Amount,
    [Required] DateOnly Date,
    [Required] Guid CategoryId,
    [MaxLength(1200)] string? Notes
);

public record UpdateExpenseRequest(
    [Required, MaxLength(160)] string Title,
    [Range(0.01, 999999999)] decimal Amount,
    [Required] DateOnly Date,
    [Required] Guid CategoryId,
    [MaxLength(1200)] string? Notes
);

