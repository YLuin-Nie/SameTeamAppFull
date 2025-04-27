using System;
using System.Collections.Generic;

namespace SameTeamAPI.Models;

public partial class CompletedChore
{
    public int CompletedId { get; set; }

    public int ChoreId { get; set; }

    public string ChoreText { get; set; } = null!;

    public int Points { get; set; }

    public int? AssignedTo { get; set; }

    public DateOnly DateAssigned { get; set; }

    public DateOnly CompletionDate { get; set; }

    public virtual User? AssignedToNavigation { get; set; }
}
