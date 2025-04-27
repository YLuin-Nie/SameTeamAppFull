using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SameTeamAPI.Models;

namespace SameTeamAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompletedChoresController : ControllerBase
{
    private readonly SameTeamDbContext _context;

    public CompletedChoresController(SameTeamDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompletedChore>>> GetCompletedChores()
    {
        return await _context.CompletedChores.ToListAsync();
    }

    [HttpPost("undo/{completedChoreId}")]
    public async Task<IActionResult> UndoCompletedChore([FromRoute] int completedChoreId)
    {
        var completedChore = await _context.CompletedChores.FindAsync(completedChoreId);
        if (completedChore == null)
        {
            return NotFound();
        }

        // Recreate Chore from CompletedChore
        var chore = new Chore
        {
            ChoreText = completedChore.ChoreText,
            Points = completedChore.Points,
            AssignedTo = completedChore.AssignedTo,
            DateAssigned = completedChore.DateAssigned,
            Completed = false
        };

        _context.Chores.Add(chore);
        _context.CompletedChores.Remove(completedChore);
        await _context.SaveChangesAsync();

        return Ok(chore);
    }

}

