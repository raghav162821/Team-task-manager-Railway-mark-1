# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

Built with: **React** (frontend) + **Node.js/Express** (backend) + **MongoDB** (database)

---

## Features

- **Authentication** – Signup/login with JWT tokens, passwords hashed with bcrypt
- **Two Roles** – Admin can manage everything; Members can view and update their own tasks
- **Projects** – Admin creates projects and assigns team members
- **Tasks** – Admin creates tasks with due dates; Members can update task status
- **Dashboard** – Overview of total, completed, pending, and overdue tasks

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   └── Tasks.js
    │   ├── components/
    │   │   └── Layout.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## Running Locally

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free) OR local MongoDB

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

Your `backend/.env` should look like:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=some_random_secret_string_here
NODE_ENV=development
```

### 3. Seed Demo Data (optional)
```bash
cd backend
node seed.js
```

### 4. Start Backend
```bash
cd backend
npm run dev   # uses nodemon for hot reload
# or
npm start
```

Backend runs at: http://localhost:5000

### 5. Setup Frontend
```bash
cd frontend
npm install

cp .env.example .env
# .env content:
# REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start Frontend
```bash
cd frontend
npm start
```

Frontend runs at: http://localhost:3000

---

## Demo Accounts

After running `node seed.js`:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@demo.com | password123 | Admin |
| Demo Member | member@demo.com | password123 | Member |
| Alice Johnson | alice@demo.com | password123 | Member |
| Bob Smith | bob@demo.com | password123 | Member |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login user |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/projects | All users |
| POST | /api/projects | Admin only |
| PUT | /api/projects/:id | Admin only |
| DELETE | /api/projects/:id | Admin only |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/tasks | All users (filtered by role) |
| POST | /api/tasks | Admin only |
| PUT | /api/tasks/:id | Admin (all fields), Member (status only) |
| DELETE | /api/tasks/:id | Admin only |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/users | Admin only |
| GET | /api/users/me | All users |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Stats (role-aware) |

---

## Deploying on Railway

### Prerequisites
- [Railway account](https://railway.app) (free tier available)
- GitHub account

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/team-task-manager.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) and click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository
4. Click **Add Service** → select your repo again for backend
5. Set the **Root Directory** to `backend`
6. Railway will auto-detect Node.js and run `npm start`
7. Go to **Variables** tab and add:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a random secret string
   - `NODE_ENV` = production
8. Go to **Settings** → **Networking** → click **Generate Domain**
9. Copy the generated URL (e.g., `https://your-backend.up.railway.app`)

### Step 3: Deploy Frontend on Railway
1. Click **New Service** in same project
2. Select the same repo, set Root Directory to `frontend`
3. Set build command: `npm run build`
4. Set start command: `npx serve -s build`
5. Add variable:
   - `REACT_APP_API_URL` = `https://your-backend.up.railway.app/api`
6. Generate domain for frontend too

### Step 4: Done!
Your app is live. Share the frontend URL with your team.

---

## Notes

- Passwords are hashed using bcrypt (never stored as plain text)
- JWT tokens expire after 7 days
- CORS is enabled for all origins (tighten in production if needed)
- The seed script will delete all existing data — use only for initial setup

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express, express-validator
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT + bcryptjs
- **Deployment**: Railway
