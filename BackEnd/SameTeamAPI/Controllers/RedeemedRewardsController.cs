using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SameTeamAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SameTeamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RedeemedRewardsController : ControllerBase
    {
        private readonly SameTeamDbContext _context;

        public RedeemedRewardsController(SameTeamDbContext context)
        {
            _context = context;
        }

        // GET: api/RedeemedRewards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RedeemedReward>>> GetAllRedeemedRewards()
        {
            return await _context.RedeemedRewards
                .Include(r => r.User)
                .Include(r => r.Reward)
                .ToListAsync();
        }

        // GET: api/RedeemedRewards/{userId}
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<RedeemedReward>>> GetRedeemedRewardsByUser(int userId)
        {
            var userRewards = await _context.RedeemedRewards
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.DateRedeemed)
                .ToListAsync();

            return userRewards;
        }

        // POST: api/RedeemedRewards
        [HttpPost]
        public async Task<ActionResult<RedeemedReward>> PostRedeemedReward(RedeemedReward redeemedReward)
        {
            // ✅ Auto-set today if no date provided
            if (redeemedReward.DateRedeemed == default)
            {
                redeemedReward.DateRedeemed = DateOnly.FromDateTime(DateTime.UtcNow);
            }

            _context.RedeemedRewards.Add(redeemedReward);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRedeemedRewardsByUser), new { userId = redeemedReward.UserId }, redeemedReward);
        }
    }
}
