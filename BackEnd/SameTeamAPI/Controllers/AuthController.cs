using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SameTeamAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace SameTeamAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SameTeamDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(SameTeamDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

[HttpPost("login")]
public IActionResult Login([FromBody] LoginModel login)
{
    try
    {
        var user = _context.Users
            .FirstOrDefault(u => u.Email.ToLower() == login.Email.ToLower());

        if (user == null)
            return Unauthorized("User not found");

        var passwordHasher = new PasswordHasher<User>();
        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);

        if (result != PasswordVerificationResult.Success)
            return Unauthorized("Invalid password");

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.Role,
                user.Points,
                user.TeamId
            }
        });
    }
    catch (Exception ex)
    {
        // 👇 This reveals the actual internal error
        return StatusCode(500, $"INTERNAL ERROR: {ex.Message}");
    }
}


        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel model)
        {
            if (_context.Users.Any(u => u.Email.ToLower() == model.Email.ToLower()))
            {
                return Conflict("Email already exists.");
            }

            var passwordHasher = new PasswordHasher<User>();
            var hashedPassword = passwordHasher.HashPassword(null, model.Password);

            // Handle team logic
            Team team = null;
            if (!string.IsNullOrEmpty(model.Team))
            {
                team = _context.Teams.FirstOrDefault(t => t.TeamName.ToLower() == model.Team.ToLower());
                if (team == null)
                {
                    if (string.IsNullOrEmpty(model.TeamPassword))
                    {
                        return BadRequest("Team password is required.");
                    }

                    // Hash the team password
                    var teamPasswordHasher = new PasswordHasher<Team>();
                    var hashedTeamPassword = teamPasswordHasher.HashPassword(null, model.TeamPassword);

                    // Create a new team with the hashed password
                    team = new Team
                    {
                        TeamName = model.Team,
                        TeamPassword = hashedTeamPassword // Set the hashed team password
                    };
                    _context.Teams.Add(team);
                    _context.SaveChanges();
                }
                else
                {
                    // Verify the team password if the team already exists
                    var teamPasswordHasher = new PasswordHasher<Team>();
                    var passwordVerificationResult = teamPasswordHasher.VerifyHashedPassword(team, team.TeamPassword, model.TeamPassword);

                    if (passwordVerificationResult != PasswordVerificationResult.Success)
                    {
                        return Unauthorized("Invalid team password.");
                    }
                }
            }

            var user = new User
            {
                Username = model.Username,
                Email = model.Email.ToLower(),
                PasswordHash = hashedPassword,
                Role = model.Role ?? "Child", // Default to "Child" if no role is provided
                Points = 0,
                TotalPoints = 0,
                TeamId = team?.TeamId // Set the TeamId if a team is specified
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("User registered successfully!");
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.UserId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Role { get; set; }
        public string? Team { get; set; }
        public string? TeamPassword { get; set; } // New property for team password
    }
}
