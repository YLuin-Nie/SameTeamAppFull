using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using SameTeamAPI.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SameTeamAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly SameTeamDbContext _context;

        public UsersController(SameTeamDbContext context)
        {
            _context = context;
        }

        [HttpGet("secure")]
        [Authorize]
        public IActionResult SecureEndpoint()
        {
            return Ok("You are authenticated!");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.UserId) return BadRequest();

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("team/{teamId}")]
        public async Task<IActionResult> GetTeam(int teamId)
        {
            var team = await _context.Teams.FindAsync(teamId);
            if (team == null)
            {
                return NotFound("Team not found");
            }
            return Ok(team);
        }

        [HttpPost("addUserToTeam")]
        public async Task<IActionResult> AddUserToTeam([FromBody] AddUserToTeamRequest model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            user.TeamId = model.TeamId;
            await _context.SaveChangesAsync();

            return Ok(user);
        }



        [HttpPost("joinTeam")]
        public async Task<IActionResult> JoinTeam([FromBody] JoinTeamRequest model)
        {
            var user = await _context.Users.FindAsync(model.UserId);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.TeamName.ToLower() == model.TeamName.ToLower());

            if (team == null)
            {
                return BadRequest("Team not found.");
            }

            var hasher = new PasswordHasher<Team>();
            var result = hasher.VerifyHashedPassword(team, team.TeamPassword, model.TeamPassword);

            if (result == PasswordVerificationResult.Failed)
            {
                return BadRequest("Password incorrect.");
            }

            user.TeamId = team.TeamId;
            await _context.SaveChangesAsync();

            // ✅ Return simplified team data to avoid circular JSON
            return Ok(new TeamDto
            {
                TeamId = team.TeamId,
                TeamName = team.TeamName
            });
        }


        [HttpPost("createTeam")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest model)
        {
            var hasher = new PasswordHasher<Team>();

            var newTeam = new Team
            {
                TeamName = model.TeamName
            };
            newTeam.TeamPassword = hasher.HashPassword(newTeam, model.TeamPassword);

            _context.Teams.Add(newTeam);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(model.UserId);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            user.TeamId = newTeam.TeamId;
            await _context.SaveChangesAsync();

            // ✅ Return only simplified data to avoid circular error
            return Ok(new TeamDto
            {
                TeamId = newTeam.TeamId,
                TeamName = newTeam.TeamName
            });
        }



        // DTOs
        public class JoinTeamRequest
        {
            public int UserId { get; set; }
            public string TeamName { get; set; } = null!;
            public string TeamPassword { get; set; } = null!;
        }

        public class CreateTeamRequest
        {
            public int UserId { get; set; }
            public string TeamName { get; set; } = null!;
            public string TeamPassword { get; set; } = null!;
        }

        public class AddUserToTeamRequest
        {
            public string Email { get; set; }
            public int TeamId { get; set; }
        }

        // ✅ NEW DTO for clean response
        public class TeamDto
        {
            public int TeamId { get; set; }
            public string TeamName { get; set; } = null!;
        }
    }
}
