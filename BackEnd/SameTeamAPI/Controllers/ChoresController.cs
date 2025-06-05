// File Name: ChoresController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SameTeamAPI.Models;

namespace SameTeamAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChoresController : ControllerBase
{
    private readonly SameTeamDbContext _context;

    public ChoresController(SameTeamDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Chore>>> GetChores()
    {
        return await _context.Chores.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Chore>> GetChore([FromRoute] int id)
    {
        var chore = await _context.Chores.FindAsync(id);
        if (chore == null)
            return NotFound();
        return chore;
    }

    [HttpPost]
    public async Task<ActionResult<Chore>> CreateChore([FromBody] Chore chore)
    {
        if (chore.Points <= 0 || chore.Points > 500)
            return BadRequest("Chore points must be between 1 and 500.");

        _context.Chores.Add(chore);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetChore), new { id = chore.ChoreId }, chore);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateChore([FromRoute] int id, [FromBody] Chore chore)
    {
        if (id != chore.ChoreId)
            return BadRequest();

        _context.Entry(chore).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChore([FromRoute] int id)
    {
        var chore = await _context.Chores.FindAsync(id);
        if (chore == null)
            return NotFound();

        _context.Chores.Remove(chore);
        await _context.SaveChangesAsync();
        return NoContent();
    }

public class CompleteChoreRequest
{
    public DateOnly CompletionDate { get; set; }
}

[HttpPost("complete/{choreId}")]
public async Task<IActionResult> CompleteChore([FromRoute] int choreId, [FromBody] CompleteChoreRequest request)

    {
        var chore = await _context.Chores.FindAsync(choreId);
        if (chore == null)
            return NotFound();

        var user = await _context.Users.FindAsync(chore.AssignedTo);
        if (user == null)
            return BadRequest("Assigned user not found.");

        var completedChore = new CompletedChore
        {
            ChoreId = chore.ChoreId,
            ChoreText = chore.ChoreText,
            Points = chore.Points,
            AssignedTo = chore.AssignedTo,
            DateAssigned = chore.DateAssigned,
            CompletionDate = request.CompletionDate

        };

        _context.CompletedChores.Add(completedChore);
        _context.Chores.Remove(chore);

        user.Points = (user.Points ?? 0) + chore.Points;
        user.TotalPoints = (user.TotalPoints ?? 0) + chore.Points;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            completedChore.CompletedId,
            completedChore.ChoreId,
            completedChore.ChoreText,
            completedChore.Points,
            completedChore.AssignedTo,
            completedChore.DateAssigned,
            completedChore.CompletionDate
        });
    }

    [HttpPost("undoComplete/{completedChoreId}")]
    public async Task<IActionResult> UndoComplete([FromRoute] int completedChoreId)
    {
        var completedChore = await _context.CompletedChores.FindAsync(completedChoreId);
        if (completedChore == null)
            return NotFound("Completed chore not found.");

        var user = await _context.Users.FindAsync(completedChore.AssignedTo);
        if (user == null)
            return NotFound("User not found.");

        user.Points = Math.Max(0, (user.Points ?? 0) - completedChore.Points);
        user.TotalPoints = Math.Max(0, (user.TotalPoints ?? 0) - completedChore.Points);

        var restoredChore = new Chore
        {
            ChoreText = completedChore.ChoreText,
            Points = completedChore.Points,
            AssignedTo = completedChore.AssignedTo,
            DateAssigned = completedChore.DateAssigned,
            Completed = false
        };
        _context.Chores.Add(restoredChore);
        _context.CompletedChores.Remove(completedChore);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Chore undone and points updated.",
            restoredChore.ChoreId,
            restoredChore.ChoreText
        });
    }

    [HttpGet("completed")]
    public async Task<ActionResult<IEnumerable<CompletedChore>>> GetCompletedChores()
    {
        return await _context.CompletedChores.ToListAsync();
    }
}

