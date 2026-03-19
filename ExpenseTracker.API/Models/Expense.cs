using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models;

public class Expense
{
    public Guid Id { get; set; }

    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateOnly Date { get; set; }

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [MaxLength(1200)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

