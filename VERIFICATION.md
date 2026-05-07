# ✅ Project Verification Checklist

## 🎯 Architecture Standard: Feature-Based Architecture

**Quy chuẩn:** Tổ chức code theo tính năng (feature), không theo loại file.

### ✔️ Folder Structure Verification

Kiểm tra các folder sau tồn tại:

```
src/
├── ✅ apis/                 # API services (Axios)
├── ✅ app/                  # Next.js pages & routes
│   ├── (auth)/             # Auth routes group
│   ├── (main)/             # Main routes group
│   └── api/                # Server API routes
├── ✅ base/                 # Configuration (Axios setup)
├── ✅ components/           # UI components
│   ├── common/             # Reusable components
│   ├── feature/            # Feature-specific components
│   ├── layout/             # Layout components
│   └── styles/             # Component styles
├── ✅ constants/            # App constants
├── ✅ hooks/                # Custom React hooks
├── ✅ interfaces/           # Data shape definitions
├── ✅ providers/            # Context providers
├── ✅ utils/                # Utility functions
└── ✅ middleware.js         # Next.js middleware
```

Run verification:
```bash
# Linux/Mac
find src -type d | sort

# Windows PowerShell
Get-ChildItem src -Recurse -Directory | Sort-Object
```

---

## 📄 File Naming Convention Verification

### ✔️ JavaScript Files

- [ ] API services: `src/apis/*.api.js` (kebab-case)
  - Example: `dashboard.api.js`, `user.api.js`
  
- [ ] Constants: `src/constants/*.js` (kebab-case)
  - Example: `api-endpoints.js`, `validation.js`
  
- [ ] Utilities: `src/utils/*.js` (kebab-case)
  - Example: `format.js`, `validate.js`, `helpers.js`
  
- [ ] Hooks: `src/hooks/use*.js` (use prefix)
  - Example: `useApi.js`, `useAuth.js`, `useFetch.js`
  
- [ ] Interfaces: `src/interfaces/*.js` (kebab-case)
  - Example: `dashboard.interface.js`, `api.interface.js`

### ✔️ JSX/React Components

- [ ] PascalCase for component names
  - Example: `Button.jsx`, `DashboardStats.jsx`, `Header.jsx`
  
- [ ] Feature components: `src/components/feature/*.jsx`
  - Example: `src/components/feature/DashboardChart.jsx`
  
- [ ] Common components: `src/components/common/*.jsx`
  - Example: `src/components/common/Button.jsx`, `src/components/common/Card.jsx`
  
- [ ] Layout components: `src/components/layout/*.jsx`
  - Example: `src/components/layout/Header.jsx`, `src/components/layout/Footer.jsx`

### ✔️ Pages

- [ ] Next.js pages: `src/app/*/page.jsx` (lowercase)
  - Example: `src/app/(main)/dashboard/page.jsx`
  
- [ ] Layouts: `**/layout.jsx` (lowercase)
  - Example: `src/app/(main)/layout.jsx`

---

## 📝 Import Path Verification

### ✔️ Using Path Aliases

Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/apis/*": ["./src/apis/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/interfaces/*": ["./src/interfaces/*"],
      "@/providers/*": ["./src/providers/*"]
    }
  }
}
```

### ✔️ Correct Import Examples

```javascript
// ✅ GOOD - Using @ path alias
import { getDashboardData } from '@/apis/dashboard.api';
import { DashboardStats } from '@/components/feature/DashboardStats';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/format';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

// ❌ BAD - Relative paths
import { getDashboardData } from '../../../apis/dashboard.api';
import { DashboardStats } from '../../../components/feature/DashboardStats';
```

---

## 🔍 Code Quality Verification

### ✔️ API Service Pattern

File: `src/apis/[feature].api.js`

```javascript
// ✅ Pattern
import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const getFeatureData = async (params) => {
  const response = await axios.get(API_ENDPOINTS.FEATURE.GET, { params });
  return response.data;
};

// ✅ Usage in components
import { getFeatureData } from '@/apis/feature.api';

const data = await getFeatureData({ page: 1 });
```

### ✔️ Custom Hook Pattern

File: `src/hooks/use[Feature].js`

```javascript
// ✅ Pattern
'use client';

import { useState, useEffect } from 'react';
import { getFeatureData } from '@/apis/feature.api';

export function useFeature(params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFeatureData(params);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  return { data, loading, error };
}
```

### ✔️ Component Pattern

File: `src/components/feature/[Feature].jsx` or `src/components/common/[Component].jsx`

```jsx
// ✅ Pattern - Feature Component
'use client';

import { useFeature } from '@/hooks/useFeature';
import { SubComponent } from '@/components/common/SubComponent';

export function DashboardStats({ filters }) {
  const { data, loading, error } = useFeature(filters);

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map((item) => (
        <SubComponent key={item.id} data={item} />
      ))}
    </div>
  );
}

// ✅ Pattern - Common Component (Reusable)
export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}
```

### ✔️ Utility Function Pattern

File: `src/utils/[utility].js`

```javascript
// ✅ Pattern
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// ✅ Usage
import { formatDate, formatCurrency } from '@/utils/format';

const date = formatDate(new Date());
const price = formatCurrency(50000);
```

---

## 🧪 Testing Verification

### ✔️ Test Checklist Before Commit

- [ ] No `console.log` statements (hoặc comment out)
- [ ] No TypeScript type errors
- [ ] No unused imports or variables
- [ ] All components render without error
- [ ] API calls handled with error states
- [ ] Loading states displayed
- [ ] Mobile responsive (if applicable)

```bash
# Run linter
npm run lint

# Check for TypeScript errors
npx tsc --noEmit

# Build to check for errors
npm run build
```

---

## 📊 Architecture Benefits

### ✔️ Advantages of Feature-Based Architecture

| Benefit | Description |
|---------|-------------|
| **Easy to Find** | All related files in one feature folder |
| **Easy to Scale** | Add new features without touching existing code |
| **Easy to Test** | Each feature is independently testable |
| **Easy to Maintain** | Changes localized to feature folder |
| **Team Friendly** | Multiple team members work on different features |
| **Performance** | Code splitting easier with feature-based structure |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] API endpoints point to production server
- [ ] All console.logs removed
- [ ] Error boundaries added
- [ ] Loading states work properly
- [ ] Error states handled
- [ ] Performance optimized (lazy loading, etc.)
- [ ] SEO tags configured
- [ ] Security headers set

---

## 📚 Documentation Links

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) - Detailed architecture guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [.env.example](./.env.example) - Environment variables

---

## ✅ Final Verification

Run this command to verify folder structure:

```bash
# Windows PowerShell
Get-ChildItem src -Recurse | Select-Object @{Name='Path';Expression={$_.FullName.Replace((Get-Location),'').TrimStart('\')}}, PSIsContainer | Format-Table -AutoSize

# Linux/Mac
find src -type f -o -type d | sort
```

**✔️ All checks passed? You're ready to start developing!** 🚀
