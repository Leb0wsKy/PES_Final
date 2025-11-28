# Authentication Setup Instructions

## MongoDB Installation (Required)

### Option 1: Install MongoDB Community Server
1. Download from: https://www.mongodb.com/try/download/community
2. Install and run MongoDB:
   ```powershell
   # After installation, start MongoDB
   net start MongoDB
   ```

### Option 2: Run MongoDB in Docker
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 3: Use MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pes_dashboard
   ```

## Start the Application

### 1. Start Backend (Port 3001)
```powershell
cd C:\Users\Admin\Desktop\PES_Final\Dashboard\backend
node server.js
```

### 2. Start Frontend (Port 3000)
```powershell
cd C:\Users\Admin\Desktop\PES_Final\Dashboard\frontend
npm start
```

### 3. Start PV API (Port 5002)
```powershell
cd C:\Users\Admin\Desktop\PES_Final\Dashboard\flask_api_pv
python app.py
```

## Access the Application

1. Open browser to: `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click "Sign Up" to create an account
4. After signup, you'll be automatically logged in

## Features

- **Signup**: Create new account with name, email, password
- **Login**: Authenticate with email and password
- **Protected Routes**: Dashboard requires authentication
- **JWT Tokens**: Secure token-based authentication (30-day expiry)
- **Password Security**: Bcrypt hashing with salt
- **User Menu**: Display user name, logout option

## Default Users

No default users. Create your first account via signup page.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Dashboard (Protected)
- `GET /api/health` - Health check
- `POST /api/nilm/predict` - NILM prediction
- `POST /api/pv/batch-predict` - PV fault detection
- All require `Authorization: Bearer <token>` header

## Environment Variables

Backend `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pes_dashboard
JWT_SECRET=pes-dashboard-secret-key-change-in-production-2025
NODE_ENV=development
```

## Troubleshooting

### "Not authorized to access this route"
- Token expired or invalid
- Logout and login again

### "User already exists"
- Email is already registered
- Use different email or login

### "MongoDB Connection Error"
- Ensure MongoDB is running on port 27017
- Check MONGODB_URI in `.env` file
- Application will continue without DB (won't be able to login)

### Port Already in Use
```powershell
# Find process using port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
# Kill the process
Stop-Process -Id <ProcessID> -Force
```
