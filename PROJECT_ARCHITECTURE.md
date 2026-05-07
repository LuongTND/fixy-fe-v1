# 📐 Project Architecture & Standards

## 🎯 Quy Chuẩn Thiết Kế

Dự án này sử dụng **Feature-Based Architecture** (hay gọi là Vertical Slice Architecture)

### Nguyên Lý Chính
- ✅ **Tổ chức theo tính năng (feature)** - không theo loại file (component, service, util)
- ✅ **Mỗi feature tự chứa** - component, API, constant, util của nó
- ✅ **Dễ scale** - thêm feature mới không ảnh hưởng code cũ
- ✅ **Dễ bảo trì** - tất cả liên quan đến 1 feature ở cùng 1 chỗ
- ✅ **Dễ test** - mỗi feature độc lập

---

## 📁 Cấu Trúc Thư Mục

```
fixy-fe-v1/
├── src/
│   ├── apis/                          # 🔌 API Calls (Axios services)
│   │   ├── auth.api.js                # API cho authentication
│   │   ├── dashboard.api.js           # API cho dashboard
│   │   └── user.api.js
│   │
│   ├── app/                           # 📄 Next.js Pages & Routes
│   │   ├── (auth)/                    # Route group - Auth pages
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   ├── register/
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── (main)/                    # Route group - Main pages
│   │   │   ├── dashboard/
│   │   │   │   └── page.jsx
│   │   │   ├── profile/
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── api/                       # Next.js Server API Routes (optional)
│   │   ├── layout.jsx                 # Root layout
│   │   └── globals.css
│   │
│   ├── base/                          # ⚙️ Configuration
│   │   └── axios.js                   # Axios instance with interceptors
│   │
│   ├── components/                    # 🎨 UI Components
│   │   ├── common/                    # Dùng lại được (Button, Card, Modal...)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   ├── feature/                   # Feature-specific components (không dùng lại)
│   │   │   ├── DashboardChart.jsx     # Chỉ dùng cho dashboard
│   │   │   ├── UserProfile.jsx        # Chỉ dùng cho profile page
│   │   │   └── OrderList.jsx          # Chỉ dùng cho order page
│   │   │
│   │   └── layout/                    # Layout components (Header, Footer, Sidebar)
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── constants/                     # 📋 Constants & Enums
│   │   ├── api-endpoints.js           # API URLs
│   │   ├── messages.js                # Error/Success messages
│   │   ├── validation.js              # Validation rules
│   │   └── roles.js                   # User roles
│   │
│   ├── hooks/                         # 🎣 Custom Hooks
│   │   ├── useApi.js                  # Generic API hook
│   │   ├── useAuth.js                 # Authentication hook
│   │   ├── useFetch.js                # Fetch data hook
│   │   └── usePagination.js           # Pagination hook
│   │
│   ├── interfaces/                    # 📘 TypeScript Interfaces/Shapes
│   │   ├── api.interface.js           # API response types
│   │   ├── user.interface.js          # User type
│   │   ├── dashboard.interface.js     # Dashboard data types
│   │   └── index.js                   # Export all
│   │
│   ├── providers/                     # 🔗 Context Providers
│   │   ├── AuthProvider.jsx           # Auth context & provider
│   │   └── ThemeProvider.jsx          # Theme context & provider
│   │
│   ├── utils/                         # 🛠️ Utility Functions
│   │   ├── format.js                  # Format date, currency, etc.
│   │   ├── validate.js                # Validation functions
│   │   ├── api-helper.js              # API helper functions
│   │   └── string.js                  # String utilities
│   │
│   └── middleware.js                  # Next.js middleware
│
├── public/                            # 📦 Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment variables (git ignored)
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔍 Kiểm Tra & Xác Minh Cấu Trúc

### Checklist Folder Structure

- [ ] `src/apis/` - API service files
- [ ] `src/app/(auth)/` - Authentication routes
- [ ] `src/app/(main)/` - Main application routes
- [ ] `src/base/axios.js` - Axios configuration
- [ ] `src/components/common/` - Reusable components
- [ ] `src/components/feature/` - Feature-specific components
- [ ] `src/components/layout/` - Layout components
- [ ] `src/constants/` - All constants
- [ ] `src/hooks/` - Custom React hooks
- [ ] `src/interfaces/` - Data shapes/types
- [ ] `src/providers/` - Context providers
- [ ] `src/utils/` - Utility functions
- [ ] `src/middleware.js` - Next.js middleware
- [ ] `.env.example` - Environment template

### Convention Checks

```javascript
// ✅ File Naming
api-endpoints.js          // kebab-case for files
DashboardChart.jsx        // PascalCase for components
useAuth.js                // camelCase for hooks
user.api.js               // feature.type.js pattern

// ✅ Import Paths
import { Button } from '@/components/common/Button';
import { dashboardApi } from '@/apis/dashboard.api';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// ✅ Export Pattern
export const functionName = () => {};
export function ComponentName() {}
export default LayoutComponent;
```

---

## 🚀 Workflow: Nhận Task "Call API Dashboard"

### 📋 Yêu Cầu
**"Tạo trang admin Dashboard. Lấy dữ liệu từ API, hiển thị 3 card thống kê + 1 biểu đồ. Có filter theo ngày"**

---

### ✅ Step 1: Tạo Page Route

Tạo file: `src/app/(main)/dashboard/page.jsx`

```jsx
'use client';

import { useEffect, useState } from 'react';
import { DashboardContent } from '@/components/feature/DashboardContent';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent filters={filters} setFilters={setFilters} />
    </div>
  );
}
```

---

### ✅ Step 2: Tạo API Service

Tạo file: `src/apis/dashboard.api.js`

```javascript
import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

/**
 * Lấy dữ liệu dashboard
 * @param {Object} filters - { startDate, endDate }
 */
export const getDashboardData = async (filters) => {
  const response = await axios.get(API_ENDPOINTS.DASHBOARD.GET_DATA, {
    params: {
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
    },
  });
  return response.data;
};

export const getDashboardChart = async (type, filters) => {
  const response = await axios.get(API_ENDPOINTS.DASHBOARD.GET_CHART, {
    params: {
      type,
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
  });
  return response.data;
};
```

---

### ✅ Step 3: Thêm API Endpoints

Cập nhật file: `src/constants/api-endpoints.js`

```javascript
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  DASHBOARD: {
    GET_DATA: '/dashboard/data',
    GET_CHART: '/dashboard/chart',
    GET_STATS: '/dashboard/stats',
  },
};
```

---

### ✅ Step 4: Tạo Interfaces/Types

Tạo file: `src/interfaces/dashboard.interface.js`

```javascript
/**
 * Dashboard Statistics Card
 * @typedef {Object} StatCard
 * @property {string} title - "Total Revenue"
 * @property {number} value - 45000
 * @property {string} unit - "VND"
 * @property {number} change - 12.5 (% change)
 */
export const StatCardShape = {
  title: String,
  value: Number,
  unit: String,
  change: Number,
};

/**
 * Dashboard Data Response
 * @typedef {Object} DashboardData
 * @property {StatCard[]} stats
 * @property {Object} chart
 */
export const DashboardDataShape = {
  stats: Array,
  chart: Object,
  summary: Object,
};

// Validation shape
export const validateDashboardData = (data) => {
  return (
    data &&
    Array.isArray(data.stats) &&
    data.stats.length > 0 &&
    data.chart
  );
};
```

---

### ✅ Step 5: Tạo Custom Hook

Tạo file: `src/hooks/useDashboard.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { getDashboardData, getDashboardChart } from '@/apis/dashboard.api';

export function useDashboard(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData(filters);
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard');
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

---

### ✅ Step 6: Tạo Feature Components

Tạo file: `src/components/feature/DashboardContent.jsx`

```jsx
'use client';

import { DashboardStats } from './DashboardStats';
import { DashboardChart } from './DashboardChart';
import { DateFilter } from './DateFilter';
import { useDashboard } from '@/hooks/useDashboard';

export function DashboardContent({ filters, setFilters }) {
  const { data, loading, error } = useDashboard(filters);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <DateFilter filters={filters} setFilters={setFilters} />

      {/* Loading State */}
      {loading && <div className="text-gray-500">Loading...</div>}

      {/* Stats Cards */}
      {data && <DashboardStats stats={data.stats} />}

      {/* Chart Section */}
      {data && <DashboardChart data={data.chart} />}
    </div>
  );
}
```

Tạo file: `src/components/feature/DashboardStats.jsx`

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
          unit={stat.unit}
        />
      ))}
    </div>
  );
}
```

Tạo file: `src/components/feature/DashboardChart.jsx`

```jsx
'use client';

// Dùng chart library của bạn (recharts, chart.js, v.v.)
export function DashboardChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
      {/* Chart component here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

Tạo file: `src/components/feature/DateFilter.jsx`

```jsx
'use client';

import { Button } from '@/components/common/Button';

export function DateFilter({ filters, setFilters }) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <input
        type="date"
        value={filters.startDate.toISOString().split('T')[0]}
        onChange={(e) =>
          setFilters({
            ...filters,
            startDate: new Date(e.target.value),
          })
        }
      />
      <input
        type="date"
        value={filters.endDate.toISOString().split('T')[0]}
        onChange={(e) =>
          setFilters({
            ...filters,
            endDate: new Date(e.target.value),
          })
        }
      />
      <Button variant="primary">Apply Filter</Button>
    </div>
  );
}
```

---

### ✅ Step 7: Tạo Reusable Components (Common)

Tạo file: `src/components/common/StatCard.jsx`

```jsx
'use client';

export function StatCard({ title, value, unit, change }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{unit}</div>
      <div
        className={`text-sm mt-3 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? '↑' : '↓'} {Math.abs(change)}% từ hôm qua
      </div>
    </div>
  );
}
```

---

### ✅ Step 8: Thêm Utilities

Cập nhật file: `src/utils/format.js`

```javascript
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
```

---

## 📋 Checklist: Task Dashboard Complete

### Before Development
- [ ] Tạo `src/apis/dashboard.api.js`
- [ ] Thêm API endpoints vào `src/constants/api-endpoints.js`
- [ ] Tạo `src/interfaces/dashboard.interface.js`
- [ ] Tạo `src/hooks/useDashboard.js`

### Page & Layout
- [ ] Tạo `src/app/(main)/dashboard/page.jsx`
- [ ] Cấu hình route nếu cần (middleware, guards)

### Components
- [ ] Tạo `src/components/feature/DashboardContent.jsx`
- [ ] Tạo `src/components/feature/DashboardStats.jsx`
- [ ] Tạo `src/components/feature/DashboardChart.jsx`
- [ ] Tạo `src/components/feature/DateFilter.jsx`
- [ ] Tạo `src/components/common/StatCard.jsx` (nếu dùng lại)

### Utilities
- [ ] Thêm format functions vào `src/utils/format.js`

### Testing
- [ ] Test page route `/dashboard`
- [ ] Test API call (mock hoặc real API)
- [ ] Test filter by date
- [ ] Test loading & error states

---

## 🎓 Quy Tắc Đặt Tên (Naming Conventions)

```javascript
// 📁 Folders
src/                      // lowercase
components/               // plural
feature/                  // singular nếu là business logic
dashboard/                // feature name

// 📄 Files
api-endpoints.js          // kebab-case
DashboardStats.jsx        // PascalCase (React component)
useDashboard.js           // camelCase + use prefix (hooks)
dashboard.api.js          // feature.type.js
dashboard.interface.js    // feature.interface.js

// 📝 Variables & Functions
const dashboardData = {}; // camelCase
function getDashboardData() {} // verb + noun
const StatCard = () => {};    // PascalCase for components
const formatCurrency = () => {}; // camelCase
```

---

## 🔗 Import Best Practices

```javascript
// ✅ Good - Sử dụng @ path alias
import { getDashboardData } from '@/apis/dashboard.api';
import { DashboardStats } from '@/components/feature/DashboardStats';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/format';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// ❌ Bad - Relative paths
import { getDashboardData } from '../../../apis/dashboard.api';
import { DashboardStats } from '../../../components/feature/DashboardStats';
```

---

## 📊 Quick Reference: Common Task Workflows

### Task: Thêm Authentication
```
1. src/apis/auth.api.js         → login(), logout(), register()
2. src/hooks/useAuth.js         → Wrapper hook
3. src/providers/AuthProvider   → Context provider
4. src/app/(auth)/login/page.jsx → Page
5. Wrap app vào AuthProvider
```

### Task: Tạo CRUD Module
```
1. src/apis/[feature].api.js    → getAll(), getById(), create(), update(), delete()
2. src/hooks/use[Feature].js    → Data management hook
3. src/components/feature/[Feature]List.jsx
4. src/components/feature/[Feature]Form.jsx
5. src/app/(main)/[feature]/page.jsx
```

### Task: Thêm Validation
```
1. src/utils/validate.js        → Validation functions
2. src/constants/validation.js  → Validation rules & messages
3. src/interfaces/[feature].js  → Shape validation
```

---

## 🛠️ Development Checklist

Trước khi commit code:

- [ ] Tất cả file đúng vị trí (đúng folder)
- [ ] Đặt tên theo convention (kebab-case, PascalCase, camelCase)
- [ ] Import dùng `@/` path alias
- [ ] Không có console.log (hoặc debug statement)
- [ ] Error handling đầy đủ (try-catch, fallback UI)
- [ ] Loading states được hiển thị
- [ ] Component được tái sử dụng nếu có thể

---

**Bắt đầu dự án với structure này sẽ giúp team dễ dàng collaborate, scale code, và maintain trong tương lai! 🚀**
