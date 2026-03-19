using System.Security.Claims;

namespace ExpenseTracker.API.Services;

public static class UserClaims
{
    public static Guid GetUserId(ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return value is null ? throw new UnauthorizedAccessException("Missing user id claim.") : Guid.Parse(value);
    }
}

