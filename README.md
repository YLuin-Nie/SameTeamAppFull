# SameTeamAppFull – Family Chore and Reward Management System

**SameTeamAppFull** is a full-stack web application that helps families collaborate by assigning chores, tracking progress, and rewarding children. It features team management, user authentication, role-based dashboards, a point system, and chore/reward tracking.

This upgraded version replaces localStorage with a secure and scalable architecture using an **ASP.NET Core API** hosted on **Azure App Service**, and an **Azure SQL Database** for persistent data storage. The React.js frontend communicates with the cloud-hosted backend through secure RESTful endpoints.

---

## 🛠 Technologies Used

### Frontend
- React.js (deployed on Vercel)
- React Router
- Axios
- FontAwesome
- CSS / Custom Components

### Backend
- ASP.NET Core Web API (hosted on Azure App Service)
- Entity Framework Core
- Azure SQL Database
- JWT Authentication
- Swagger for API Testing

---

## 🔑 Key Features

### 🧑‍🤝‍🧑 User & Team Management
- Role-based Sign Up: Parent or Child
- JWT-based Login/Logout
- Create or Join a Team (with secure password verification)
- Add/Remove users from a team (by parent)

### 🧹 Chore Management
- Parents assign chores with points and due dates
- View upcoming chores or filter by date
- Children see and complete their own chores
- Undo completed chores and subtract points

### 🎁 Reward System
- Parents define rewards with point costs
- Children redeem rewards using earned points
- Track reward redemption history

### 📅 Dashboards
- **Parent Dashboard:**
  - Calendar integration for assigning/viewing chores
  - View all children on the same team and their level
  - Visual point-based level system

- **Child Dashboard:**
  - Calendar + upcoming chore list
  - See level, team name, and current point balance

### 🌗 Extras
- Dark mode toggle on homepage
- Fully responsive layout
- Persistent login via localStorage
- RESTful API with full CRUD
- Backend includes CORS and Swagger

---

## 🔐 API Endpoints (Backend)

### Authentication
- `POST /api/Auth/login`
- `POST /api/Auth/register`

### Users
- `GET /api/Users`
- `POST /api/Users`
- `PUT /api/Users/{id}`
- `PUT /api/Users/{id}/points`
- `POST /api/Users/createTeam`
- `POST /api/Users/joinTeam`
- `POST /api/Users/addUserToTeam`
- `POST /api/Users/removeFromTeam/{id}`

### Chores
- `GET /api/Chores`
- `POST /api/Chores`
- `PUT /api/Chores/{id}`
- `POST /api/Chores/complete/{id}`
- `POST /api/Chores/undoComplete/{id}`
- `GET /api/Chores/completed`
- `DELETE /api/Chores/{id}`

### Rewards
- `GET /api/Rewards`
- `POST /api/Rewards`
- `PUT /api/Rewards/{id}`
- `DELETE /api/Rewards/{id}`

### Redeemed Rewards
- `GET /api/RedeemedRewards`
- `GET /api/RedeemedRewards/{userId}`
- `POST /api/RedeemedRewards`

---

### Backend Setup
```bash
cd BackEnd/SameTeamAPI
dotnet build
dotnet ef database update
dotnet run
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet tool install --global dotnet-ef
dotnet ef dbcontext scaffold "Server=localhost;Database=SameTeamDB;Trusted_Connection=True;Encrypt=False;" Microsoft.EntityFrameworkCore.SqlServer -o Models --force
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
```

---

### Frontend Setup
```bash
cd FrontEnd
npm install
npm start
```