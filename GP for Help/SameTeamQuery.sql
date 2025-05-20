select * from Users;

select * from Chores;
select * from CompletedChores;
select * from Teams;
select * from Rewards;
select * from RedeemedRewards;

UPDATE Users
SET TeamID = 7
WHERE Email = 'Bob2@example.com';

-- Drop the table if it exists
IF OBJECT_ID('dbo.RedeemedRewards', 'U') IS NOT NULL
    DROP TABLE dbo.RedeemedRewards;

-- Recreate the table with DateRedeemed as DATE type
CREATE TABLE dbo.RedeemedRewards (
    RedemptionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL FOREIGN KEY REFERENCES Users(UserID),
    RewardID INT NULL FOREIGN KEY REFERENCES Rewards(RewardID),
    PointsSpent INT NOT NULL,
    DateRedeemed DATE NOT NULL
);
