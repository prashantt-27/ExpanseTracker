using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.DTOs;

public record RegisterRequest(
    [Required, MaxLength(120)] string Name,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(6), MaxLength(128)] string Password
);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(6), MaxLength(128)] string Password
);

public record AuthResponse(string Token, DateTime ExpiresAtUtc, UserDto User);

public record UserDto(Guid Id, string Name, string Email, DateTime CreatedAt);

