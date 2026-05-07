# 🧑‍💻 Development Guide

**Quick reference for developers working on Fixy Frontend**

---

## 📚 Documentation Map

| Need | Document |
|------|----------|
| **First time setup** | [QUICK_START.md](./QUICK_START.md) |
| **Architecture details** | [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) |
| **Code standards** | [VERIFICATION.md](./VERIFICATION.md) |
| **Development** | This file (DEVELOPMENT.md) |

---

## ⚡ Quick Setup

```bash
# 1. Clone & Install
git clone <repo>
cd fixy-fe-v1
npm install

# 2. Environment Setup
cp .env.example .env.local
# Edit .env.local with API URL

# 3. Start Dev Server
npm run dev
# Open http://localhost:3000
```

---

## 📁 Folder Structure

```
src/
├── apis/              # API call functions
├── app/               # Next.js pages
│   ├── (auth)/       # Login, register pages
│   └── (main)/       # Dashboard, main pages
├── base/              # Axios config
├── components/        # UI components
│   ├── common/       # Reusable (Button, Card)
│   ├── feature/      # Feature-specific
│   └── layout/       # Header, Footer, Sidebar
├── constants/         # Constants & messages
├── hooks/             # Custom React hooks
├── interfaces/        # Data shape definitions
├── providers/         # Context providers
├── utils/             # Helper functions
└── middleware.js      # Next.js middleware
```

---

## 🚀 Common Workflows

### 1️⃣ Create a Dashboard Page

#### Step 1: Create API Service
**File:** `src/apis/dashboard.api.js`

```javascript
import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const getDashboardData = async (filters) => {
  const response = await axios.get(
    API_ENDPOINTS.DASHBOARD.GET_DATA,
    { params: filters }
  );
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await axios.get(
    API_ENDPOINTS.DASHBOARD.GET_STATS
  );
  return response.data;
};
```

#### Step 2: Create Custom Hook
**File:** `src/hooks/useDashboard.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/apis/dashboard.api';

export function useDashboard(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData(filters);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.startDate, filters.endDate]);

  return { data, loading, error };
}
```

#### Step 3: Create Feature Components
**File:** `src/components/feature/DashboardStats.jsx`

```jsx
'use client';

import { StatCard } from '@/components/common/StatCard';
import { formatCurrency } from '@/utils/format';

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats?.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={formatCurrency(stat.value)}
          change={stat.change}
        />
      ))}
    </div>
  );
}
```

**File:** `src/components/feature/DashboardContent.jsx`

```jsx
'use client';

import { DashboardStats } from './DashboardStats';
import { useDashboard } from '@/hooks/useDashboard';

export function DashboardContent({ filters }) {
  const { data, loading, error } = useDashboard(filters);

  if (error) return <div className="text-red-500">Error loading data</div>;
  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {data && <DashboardStats stats={data.stats} />}
    </div>
  );
}
```

#### Step 4: Create Page
**File:** `src/app/(main)/dashboard/page.jsx`

```jsx
'use client';

import { useState } from 'react';
import { DashboardContent } from '@/components/feature/DashboardContent';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent filters={filters} />
    </div>
  );
}
```

---

### 2️⃣ Create Authentication System

#### Step 1: Add API Endpoints
**File:** `src/constants/api-endpoints.js`

```javascript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  // ... other endpoints
};
```

#### Step 2: Create Auth Provider
**File:** `src/providers/AuthProvider.jsx`

```jsx
'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Call API
    // const response = await authApi.login(email, password);
    // setUser(response.user);
    // localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be inside AuthProvider');
  }
  return context;
}
```

#### Step 3: Create Login Page
**File:** `src/app/(auth)/login/page.jsx`

Already created with template. Just update the API call.

---

## 🎯 Code Patterns

### API Service Pattern

```javascript
// ✅ Good
import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const getUsers = async (page = 1) => {
  const response = await axios.get(
    API_ENDPOINTS.USER.LIST,
    { params: { page } }
  );
  return response.data;
};

// ❌ Bad
const response = await fetch('/api/users');
// Too much code repetition
```

### Component Pattern

```jsx
'use client'; // ← Add this for hooks

import { useState } from 'react';

export function MyComponent({ title, onClose }) {
  const [count, setCount] = useState(0);

  // Handlers
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // Render
  return (
    <div className="p-4">
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>
        Increment
      </button>
    </div>
  );
}
```

### Hook Pattern

```javascript
'use client';

import { useState, useEffect } from 'react';

export function useCustomHook(params) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch logic
        setState(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]); // Dependencies

  return { state, loading, error };
}
```

---

## 🧪 Testing Your Code

### Before Committing

```bash
# 1. Check for linting errors
npm run lint

# 2. Build to check for errors
npm run build

# 3. Manual testing
npm run dev
# Test in browser: http://localhost:3000
```

### Checklist

- [ ] No console.logs
- [ ] No unused imports
- [ ] Error handling included
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] Follows naming conventions
- [ ] Linter passes
- [ ] Build succeeds

---

## 🐛 Debugging

### Check API Connection

```javascript
// In src/base/axios.js
axios.interceptors.request.use((config) => {
  console.log('Request:', config);
  return config;
});

axios.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});
```

### Debug Components

```jsx
// Add logging to understand flow
useEffect(() => {
  console.log('Component mounted');
  console.log('Props:', { title, onClose });
  
  return () => {
    console.log('Component unmounted');
  };
}, []);
```

### Use Browser DevTools

- React DevTools Extension
- Network tab (API calls)
- Console (errors)

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Set in production environment:
```env
NEXT_PUBLIC_API_URL=https://api.production.com
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Axios Docs](https://axios-http.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 💬 Questions?

1. Check [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)
2. Check [QUICK_START.md](./QUICK_START.md)
3. Ask in team chat

---

**Happy coding! 🚀**
