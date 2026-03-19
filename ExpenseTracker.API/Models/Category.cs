using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models;

public class Category
{
    public Guid Id { get; set; }

    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public List<Expense> Expenses { get; set; } = new();
}

