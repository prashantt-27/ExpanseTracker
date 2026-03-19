using ExpenseTracker.API.DTOs;

namespace ExpenseTracker.API.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(Guid userId, CancellationToken ct);
    Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryRequest request, CancellationToken ct);
    Task DeleteAsync(Guid userId, Guid categoryId, CancellationToken ct);
}

