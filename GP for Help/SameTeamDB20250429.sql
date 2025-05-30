USE [SameTeamDB]
GO
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [CK__Users__Role__3B75D760]
GO
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [FK__Users__TeamID__3E52440B]
GO
ALTER TABLE [dbo].[RedeemedRewards] DROP CONSTRAINT [FK__RedeemedR__UserI__0A9D95DB]
GO
ALTER TABLE [dbo].[RedeemedRewards] DROP CONSTRAINT [FK__RedeemedR__Rewar__0B91BA14]
GO
ALTER TABLE [dbo].[CompletedChores] DROP CONSTRAINT [FK_CompletedChores_Users_AssignedTo]
GO
ALTER TABLE [dbo].[Chores] DROP CONSTRAINT [FK__Chores__Assigned__4222D4EF]
GO
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [DF__Users__TotalPoin__3D5E1FD2]
GO
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [DF__Users__Points__3C69FB99]
GO
ALTER TABLE [dbo].[Teams] DROP CONSTRAINT [DF__Teams__TeamPassw__5AEE82B9]
GO
ALTER TABLE [dbo].[Chores] DROP CONSTRAINT [DF_Chores_Completed]
GO
ALTER TABLE [dbo].[Chores] DROP CONSTRAINT [DF__Chores__Points__412EB0B6]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
DROP TABLE [dbo].[Users]
GO
/****** Object:  Table [dbo].[Teams]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Teams]') AND type in (N'U'))
DROP TABLE [dbo].[Teams]
GO
/****** Object:  Table [dbo].[Rewards]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rewards]') AND type in (N'U'))
DROP TABLE [dbo].[Rewards]
GO
/****** Object:  Table [dbo].[RedeemedRewards]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RedeemedRewards]') AND type in (N'U'))
DROP TABLE [dbo].[RedeemedRewards]
GO
/****** Object:  Table [dbo].[CompletedChores]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompletedChores]') AND type in (N'U'))
DROP TABLE [dbo].[CompletedChores]
GO
/****** Object:  Table [dbo].[Chores]    Script Date: 4/29/2025 4:50:36 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Chores]') AND type in (N'U'))
DROP TABLE [dbo].[Chores]
GO
USE [master]
GO
/****** Object:  Database [SameTeamDB]    Script Date: 4/29/2025 4:50:36 PM ******/
DROP DATABASE [SameTeamDB]
GO
/****** Object:  Database [SameTeamDB]    Script Date: 4/29/2025 4:50:36 PM ******/
CREATE DATABASE [SameTeamDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'SameTeamDB', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\SameTeamDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'SameTeamDB_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\SameTeamDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [SameTeamDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [SameTeamDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [SameTeamDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [SameTeamDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [SameTeamDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [SameTeamDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [SameTeamDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [SameTeamDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [SameTeamDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [SameTeamDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [SameTeamDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [SameTeamDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [SameTeamDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [SameTeamDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [SameTeamDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [SameTeamDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [SameTeamDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [SameTeamDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [SameTeamDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [SameTeamDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [SameTeamDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [SameTeamDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [SameTeamDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [SameTeamDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [SameTeamDB] SET RECOVERY FULL 
GO
ALTER DATABASE [SameTeamDB] SET  MULTI_USER 
GO
ALTER DATABASE [SameTeamDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [SameTeamDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [SameTeamDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [SameTeamDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [SameTeamDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [SameTeamDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'SameTeamDB', N'ON'
GO
ALTER DATABASE [SameTeamDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [SameTeamDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [SameTeamDB]
GO
/****** Object:  Table [dbo].[Chores]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Chores](
	[ChoreID] [int] IDENTITY(1,1) NOT NULL,
	[ChoreText] [nvarchar](255) NOT NULL,
	[Points] [int] NOT NULL,
	[AssignedTo] [int] NULL,
	[DateAssigned] [date] NOT NULL,
	[Completed] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ChoreID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CompletedChores]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompletedChores](
	[CompletedID] [int] IDENTITY(1,1) NOT NULL,
	[ChoreID] [int] NOT NULL,
	[ChoreText] [nvarchar](255) NOT NULL,
	[Points] [int] NOT NULL,
	[AssignedTo] [int] NULL,
	[DateAssigned] [date] NOT NULL,
	[CompletionDate] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CompletedID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RedeemedRewards]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RedeemedRewards](
	[RedemptionID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[RewardID] [int] NULL,
	[PointsSpent] [int] NOT NULL,
	[DateRedeemed] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RedemptionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rewards]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rewards](
	[RewardID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Cost] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RewardID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Teams]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Teams](
	[TeamID] [int] IDENTITY(1,1) NOT NULL,
	[TeamName] [nvarchar](100) NOT NULL,
	[TeamPassword] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TeamID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[TeamName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 4/29/2025 4:50:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](50) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[Role] [nvarchar](10) NOT NULL,
	[Points] [int] NULL,
	[TotalPoints] [int] NULL,
	[TeamID] [int] NULL,
	[ParentId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Chores] ADD  DEFAULT ((5)) FOR [Points]
GO
ALTER TABLE [dbo].[Chores] ADD  CONSTRAINT [DF_Chores_Completed]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Teams] ADD  DEFAULT ('') FOR [TeamPassword]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [Points]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [TotalPoints]
GO
ALTER TABLE [dbo].[Chores]  WITH CHECK ADD FOREIGN KEY([AssignedTo])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[CompletedChores]  WITH CHECK ADD  CONSTRAINT [FK_CompletedChores_Users_AssignedTo] FOREIGN KEY([AssignedTo])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[CompletedChores] CHECK CONSTRAINT [FK_CompletedChores_Users_AssignedTo]
GO
ALTER TABLE [dbo].[RedeemedRewards]  WITH CHECK ADD FOREIGN KEY([RewardID])
REFERENCES [dbo].[Rewards] ([RewardID])
GO
ALTER TABLE [dbo].[RedeemedRewards]  WITH CHECK ADD FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([TeamID])
REFERENCES [dbo].[Teams] ([TeamID])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([Role]='Child' OR [Role]='Parent'))
GO
USE [master]
GO
ALTER DATABASE [SameTeamDB] SET  READ_WRITE 
GO
