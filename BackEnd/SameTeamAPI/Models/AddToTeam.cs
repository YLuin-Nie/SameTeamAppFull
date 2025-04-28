namespace SameTeamAPI.Models
{
    public class AddUserToTeamRequest
    {
        public string Email { get; set; }
        public int TeamId { get; set; } // <-- real TeamId
        
    }
}
