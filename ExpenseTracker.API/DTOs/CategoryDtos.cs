using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.DTOs;

public record CategoryDto(Guid Id, string Name);

public record CreateCategoryRequest([Required, MaxLength(80)] string Name);

