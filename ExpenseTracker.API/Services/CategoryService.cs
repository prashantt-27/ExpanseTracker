using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Interfaces;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Services;

public class CategoryService(ICategoryRepository categories) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(Guid userId, CancellationToken ct)
    {
        var rows = await categories.GetAllAsync(userId, ct);
        return rows.Select(x => new CategoryDto(x.Id, x.Name)).ToList();
    }

    public async Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (name.Length == 0)
            throw new InvalidOperationException("Category name is required.");

        if (await categories.ExistsByNameAsync(userId, name, ct))
            throw new InvalidOperationException("Category name already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name
        };

        await categories.AddAsync(category, ct);
        await categories.SaveChangesAsync(ct);

        return new CategoryDto(category.Id, category.Name);
    }

    public async Task DeleteAsync(Guid userId, Guid categoryId, CancellationToken ct)
    {
        var category = await categories.GetByIdAsync(userId, categoryId, ct);
        if (category is null)
            return;

        await categories.DeleteAsync(category, ct);
        await categories.SaveChangesAsync(ct);
    }
}

