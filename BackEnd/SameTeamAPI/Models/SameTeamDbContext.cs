﻿using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SameTeamAPI.Models;

public partial class SameTeamDbContext : DbContext
{
    public SameTeamDbContext()
    {
    }

    public SameTeamDbContext(DbContextOptions<SameTeamDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chore> Chores { get; set; }

    public virtual DbSet<CompletedChore> CompletedChores { get; set; }

    public virtual DbSet<RedeemedReward> RedeemedRewards { get; set; }

    public virtual DbSet<Reward> Rewards { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=SameTeamDB;Trusted_Connection=True;Encrypt=False;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chore>(entity =>
        {
            entity.HasKey(e => e.ChoreId).HasName("PK__Chores__F0F94F541BF30DFC");

            entity.Property(e => e.ChoreId).HasColumnName("ChoreID");
            entity.Property(e => e.ChoreText).HasMaxLength(255);
            entity.Property(e => e.Points).HasDefaultValue(5);

            entity.HasOne(d => d.AssignedToNavigation).WithMany(p => p.Chores)
                .HasForeignKey(d => d.AssignedTo)
                .HasConstraintName("FK__Chores__Assigned__4222D4EF");
        });

        modelBuilder.Entity<CompletedChore>(entity =>
        {
            entity.HasKey(e => e.CompletedId).HasName("PK__Complete__48D815987A0EB99D");

            entity.Property(e => e.CompletedId).HasColumnName("CompletedID");
            entity.Property(e => e.ChoreId).HasColumnName("ChoreID");
            entity.Property(e => e.ChoreText).HasMaxLength(255);

            entity.HasOne(d => d.AssignedToNavigation).WithMany(p => p.CompletedChores).HasForeignKey(d => d.AssignedTo);
        });

        modelBuilder.Entity<RedeemedReward>(entity =>
        {
            entity.HasKey(e => e.RedemptionId).HasName("PK__Redeemed__410680D1B1B14DD7");

            entity.Property(e => e.RedemptionId).HasColumnName("RedemptionID");
            entity.Property(e => e.DateRedeemed)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RewardId).HasColumnName("RewardID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Reward).WithMany(p => p.RedeemedRewards)
                .HasForeignKey(d => d.RewardId)
                .HasConstraintName("FK__RedeemedR__Rewar__48CFD27E");

            entity.HasOne(d => d.User).WithMany(p => p.RedeemedRewards)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__RedeemedR__UserI__47DBAE45");
        });

        modelBuilder.Entity<Reward>(entity =>
        {
            entity.HasKey(e => e.RewardId).HasName("PK__Rewards__8250159985E8A3D3");

            entity.Property(e => e.RewardId).HasColumnName("RewardID");
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.TeamId).HasName("PK__Teams__123AE7B9E1383135");

            entity.HasIndex(e => e.TeamName, "UQ__Teams__4E21CAAC3E9B4368").IsUnique();

            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.TeamName).HasMaxLength(100);
            entity.Property(e => e.TeamPassword)
                .HasMaxLength(100)
                .HasDefaultValue("");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC7D4C9C38");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053451E43D5C").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Points).HasDefaultValue(0);
            entity.Property(e => e.Role).HasMaxLength(10);
            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.TotalPoints).HasDefaultValue(0);
            entity.Property(e => e.Username).HasMaxLength(50);

            entity.HasOne(d => d.Team).WithMany(p => p.Users)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__Users__TeamID__3E52440B");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
