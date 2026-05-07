# 🚀 Quick Start Guide

## 📦 Installation

```bash
# Install dependencies
npm install

# Hoặc dùng yarn
yarn install
```

## 🌍 Environment Setup

1. **Copy `.env.example` → `.env.local`**

```bash
cp .env.example .env.local
```

2. **Cấu hình environment variables**

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Fixy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Note:** File `.env.local` được git ignore - không push lên repository

## 🏃 Running Development Server

```bash
npm run dev
# hoặc
yarn dev
```

Mở browser: [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎨 Ant Design Setup

**Ant Design v5** đã được cài đặt và cấu hình sẵn!

### Quick Example

```jsx
'use client';

import { Button, Card, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function MyComponent() {
  return (
    <Card title="My Card">
      <Space>
        <Button type="primary">Primary</Button>
        <Button icon={<PlusOutlined />}>Add</Button>
      </Space>
    </Card>
  );
}
```

### Resources

- 📘 [Ant Design Guide](./ANTD_GUIDE.md) - Full guide
- 🎨 [Component Examples](./src/components/common/AntdExample.jsx) - Example component
- 📚 [Official Docs](https://ant.design/)

## 📁 Project Structure

Xem đầy đủ tại: [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)

**Quick Reference:**

```
src/
├── apis/              # API service files (axios)
├── app/               # Next.js pages & routes
├── base/              # Axios configuration
├── components/        # React components
├── constants/         # App constants
├── hooks/             # Custom React hooks
├── interfaces/        # Data shape definitions
├── providers/         # Context providers
└── utils/             # Utility functions
```

## 🎯 Quick Tasks

### Task: Tạo trang Dashboard

1. **Tạo API service:** `src/apis/dashboard.api.js`

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
```

2. **Tạo Custom Hook:** `src/hooks/useDashboard.js`

```javascript
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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return { data, loading, error };
}
```

3. **Tạo Feature Component:** `src/components/feature/DashboardStats.jsx`

```jsx
'use client';

import { StatCard } from '@/components/common/StatCard';
import { formatCurrency } from '@/utils/format';

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
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

4. **Tạo Page:** `src/app/(main)/dashboard/page.jsx`

```jsx
'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStats } from '@/components/feature/DashboardStats';

export default function DashboardPage() {
  const { data, loading, error } = useDashboard({});

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {data && <DashboardStats stats={data.stats} />}
    </div>
  );
}
```

> Xem chi tiết tại: [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md#-workflow-nhận-task-call-api-dashboard)

### Task: Thêm Authentication

1. **Tạo API:** `src/apis/auth.api.js`
2. **Tạo Hook:** `src/hooks/useAuth.js`
3. **Tạo Provider:** `src/providers/AuthProvider.jsx`
4. **Tạo Page:** `src/app/(auth)/login/page.jsx`
5. **Wrap App:** Bọc `<AuthProvider>` vào layout

### Task: Thêm Validation

1. Thêm rules vào: `src/constants/validation.js`
2. Dùng utils: `src/utils/validate.js`
3. Hiển thị error trong component

---

## 🛠️ Debugging Tips

### 1. Check API Connection

```javascript
// src/base/axios.js - Thêm logging
axios.interceptors.request.use((config) => {
  console.log('API Request:', config);
  return config;
});
```

### 2. Debug Components

```javascript
'use client';

import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    console.log('Component mounted');
  }, []);
  
  return <div>Component</div>;
}
```

### 3. Use React DevTools

- Chrome Extension: [React Developer Tools](https://chrome.google.com/webstore)
- Check component tree, props, hooks

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ❓ Common Issues

### Issue: Module not found

**Solution:** Kiểm tra path alias trong `tsconfig.json`

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"]
  }
}
```

### Issue: API call fails

**Solution:** Kiểm tra `.env.local` và `src/base/axios.js` configuration

```bash
# Check if API server is running
curl http://localhost:3001/api/health
```

### Issue: Component not rendering

**Solution:** Kiểm tra xem component có `'use client'` directive không

```jsx
'use client'; // ← Cần thêm nếu dùng hooks

export function MyComponent() {
  // ...
}
```

---

## 🎓 Learning Path (Cho Intern)

### Week 1: Setup & Basics
- [ ] Hiểu folder structure
- [ ] Tạo simple page
- [ ] Dùng components

### Week 2: API Integration
- [ ] Tạo API service
- [ ] Tạo custom hook
- [ ] Hiển thị data

### Week 3: Forms & Validation
- [ ] Tạo form
- [ ] Thêm validation
- [ ] Error handling

### Week 4: Advanced
- [ ] Context & Providers
- [ ] Authentication
- [ ] Routing guards

---

**🎉 Ready to start? Run `npm run dev` and open [http://localhost:3000](http://localhost:3000)!**
