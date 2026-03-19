using ExpenseTracker.API.DTOs;

namespace ExpenseTracker.API.Interfaces;

public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseDto>> GetAllAsync(
        Guid userId,
        DateOnly? from,
        DateOnly? to,
        Guid? categoryId,
        string? search,
        CancellationToken ct);

    Task<ExpenseDto> GetByIdAsync(Guid userId, Guid id, CancellationToken ct);
    Task<ExpenseDto> CreateAsync(Guid userId, CreateExpenseRequest request, CancellationToken ct);
    Task<ExpenseDto> UpdateAsync(Guid userId, Guid id, UpdateExpenseRequest request, CancellationToken ct);
    Task DeleteAsync(Guid userId, Guid id, CancellationToken ct);
}

