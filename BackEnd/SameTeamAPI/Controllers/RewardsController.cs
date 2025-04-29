using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SameTeamAPI.Models;

namespace SameTeamAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RewardsController : ControllerBase
{
    private readonly SameTeamDbContext _context;

    public RewardsController(SameTeamDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reward>>> GetRewards()
    {
        return await _context.Rewards.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Reward>> GetReward(int id)
    {
        var reward = await _context.Rewards.FindAsync(id);
        if (reward == null) return NotFound();
        return reward;
    }

    [HttpPost]
    public async Task<ActionResult<Reward>> CreateReward(Reward reward)
    {
        if (reward.Cost <= 0 || reward.Cost > 500)
        {
            return BadRequest("Reward cost must be between 1 and 500 points.");
        }

        _context.Rewards.Add(reward);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReward), new { id = reward.RewardId }, reward);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReward(int id, Reward reward)
    {
        if (id != reward.RewardId) return BadRequest();

        _context.Entry(reward).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReward(int id)
    {
        var reward = await _context.Rewards.FindAsync(id);
        if (reward == null) return NotFound();

        _context.Rewards.Remove(reward);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
