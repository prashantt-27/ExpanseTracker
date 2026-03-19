using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models;

public class User
{
    public Guid Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Category> Categories { get; set; } = new();
    public List<Expense> Expenses { get; set; } = new();
}

