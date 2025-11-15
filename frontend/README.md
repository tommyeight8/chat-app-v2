# Frontend - Authentication System

React + Vite frontend for the chat app authentication system.

## 🚀 Quick Start

### From Project Root

```bash
# Install all dependencies (backend + frontend)
npm run build

# Start backend (in one terminal)
npm start

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### From Frontend Folder

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Access the App

- **Development:** http://localhost:3000
- **Backend API:** http://localhost:5000

## ✨ Features

- ✅ User Registration (Signup)
- ✅ User Login
- ✅ Profile Management
- ✅ Avatar Upload with Preview
- ✅ Password Update
- ✅ Protected Routes
- ✅ JWT Authentication (HTTP-only cookies)
- ✅ Responsive Design
- ✅ Form Validation
- ✅ Error Handling

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route guard
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login form
│   │   ├── Signup.jsx            # Registration
│   │   └── Profile.jsx           # User profile
│   ├── services/
│   │   └── api.js                # API client
│   ├── App.jsx                   # Main app + routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html                     # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind config
└── package.json                  # Frontend dependencies
```

## 🔌 API Integration

The frontend connects to your backend at `http://localhost:5000/api`

### Required Backend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| PUT | `/api/auth/update-profile` | Update profile |

## 🎨 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

## 🔐 Authentication Flow

1. User logs in or signs up
2. Backend sends JWT in HTTP-only cookie
3. User data stored in localStorage
4. Protected routes check authentication
5. All API requests include cookie automatically

## 🛠️ Development

### Environment Variables (Optional)

Create a `.env` file if you need custom configuration:

```bash
cp .env.example .env
```

By default, Vite proxies `/api` requests to `http://localhost:5000`.

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready to be served by your backend.

## 📦 Monorepo Integration

This frontend is designed to work within your monorepo structure:

```
project-root/
├── backend/          # Your backend code
├── frontend/         # This React app
└── package.json      # Root scripts
```

### Root Scripts

From the project root, you can run:

```bash
# Build everything
npm run build

# Start backend (serves the built frontend)
npm start
```

## 🎯 Using the Auth System

### In Your Components

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.fullname}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making API Calls

```jsx
import api from '../services/api';

// Cookies are automatically included
const response = await api.get('/some-endpoint');
```

## 🔧 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Update Backend URL

Edit `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://your-backend-url',
    changeOrigin: true,
  }
}
```

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend allows credentials from `http://localhost:3000`
- Backend CORS config should include: `credentials: true`

### Cookie Not Working
- Verify `withCredentials: true` in `src/services/api.js`
- Check backend sets proper cookie attributes

### Avatar Upload Fails
- Maximum file size: 5MB
- Only image files are allowed
- Ensure backend has multipart/form-data handling

### Protected Routes Not Working
- Check localStorage for user data
- Verify JWT cookie is being sent
- Check backend authentication middleware

## 📚 Available Routes

| Route | Component | Protected | Purpose |
|-------|-----------|-----------|---------|
| `/` | Home | No | Landing page |
| `/login` | Login | No | User login |
| `/signup` | Signup | No | Registration |
| `/profile` | Profile | Yes | User profile |

Protected routes automatically redirect to `/login` if not authenticated.

## 🎨 UI Components

### Forms
- Clean, accessible inputs
- Real-time validation
- Error messages
- Loading states
- Success notifications

### Profile Page
- Avatar upload with preview
- Update personal info
- Change password
- Logout functionality

### Protected Routes
- Automatic authentication check
- Loading spinner during check
- Redirect to login if needed
- Preserve intended destination

## 🚀 Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains static files

3. Serve from your backend or upload to CDN

4. Update API proxy settings for production

## 📝 Notes

- JWT tokens are stored in HTTP-only cookies (secure!)
- User data is cached in localStorage (fast access)
- Avatar uploads handled via multipart/form-data
- All forms have client-side validation
- Error messages are user-friendly
- Mobile-responsive design

## 🔒 Security Features

- HTTP-only cookies (prevents XSS)
- CSRF protection via SameSite
- Password confirmation required
- File type/size validation
- Client-side input sanitization
- Secure password handling

---

**Need help?** Check the code comments or reach out!
