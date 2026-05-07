# 📁 Project Structure Guide

## Folder Organization

### `/src/components`
Tất cả UI components của dự án

- **`common/`** - Reusable components (Button, Card, Modal, Input, etc.)
- **`layout/`** - Layout components (Header, Footer, Sidebar)
- **`features/`** - Feature-specific components (không dùng lại được)

### `/src/services`
API calls using Axios - Một service = một tài nguyên BE

```typescript
// Example: src/services/user.service.ts
import apiClient from './api-client';

class UserService {
  async getProfile() { ... }
  async updateProfile(data) { ... }
}

export const userService = new UserService();
```

**Import sử dụng:**
```typescript
import { userService } from '@/services/user.service';

// Trong component
const { data } = await userService.getProfile();
```

### `/src/hooks`
Custom React hooks (useApi, useAuth, useFetch, v.v.)

```typescript
// Example: src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  // logic here
  return { user, login, logout };
}
```

### `/src/lib`
Utility functions và helpers

- **`constants.ts`** - App constants, API endpoints
- **`utils.ts`** - Common functions (format, debounce, etc.)
- **`seo.ts`** - SEO utilities for meta tags

### `/src/types`
TypeScript interfaces và types

```typescript
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

**Import:**
```typescript
import type { User } from '@/types/user.types';
// hoặc
import type { User } from '@/types';
```

### `/src/config`
Application configuration

```typescript
// src/config/env.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
};
```

## 🚀 Best Practices

### 1. **API Calls**
```typescript
// ✅ Good - Tách service riêng
import { userService } from '@/services/user.service';

export default function Profile() {
  const { data: user } = userService.getProfile();
  return <div>{user?.name}</div>;
}

// ❌ Bad - API call trực tiếp trong component
export default function Profile() {
  useEffect(() => {
    fetch('/api/user').then(...)
  }, []);
}
```

### 2. **Types**
```typescript
// ✅ Good
import type { User } from '@/types';

interface Props {
  user: User;
}

// ❌ Bad - Inline types
interface Props {
  user: { id: string; email: string };
}
```

### 3. **Constants**
```typescript
// ✅ Good - Centralized
import { API_ENDPOINTS } from '@/lib/constants';
const url = API_ENDPOINTS.USER.PROFILE;

// ❌ Bad - Magic strings
const url = '/api/user/profile';
```

### 4. **Path Aliases**
```typescript
// ✅ Good
import { Button } from '@/components/common/Button';
import { userService } from '@/services/user.service';
import type { User } from '@/types';

// ❌ Bad
import { Button } from '../../../components/common/Button';
import { userService } from '../../../services/user.service';
```

## 📋 Checklist cho mỗi feature mới

- [ ] Tạo types trong `/src/types/`
- [ ] Tạo service trong `/src/services/` (nếu cần API)
- [ ] Tạo components trong `/src/components/features/`
- [ ] Tạo hook tuỳ chỉnh trong `/src/hooks/` (nếu cần)
- [ ] Thêm constants vào `/src/lib/constants.ts` (nếu cần)
- [ ] Cập nhật `/src/types/index.ts` để export types mới

## 🔗 Environment Variables

```env
# .env.local (chỉ local, không push lên git)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Fixy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Copy `.env.example` → `.env.local` để dev**

## 📦 Installation

```bash
npm install
# Khi thêm dependencies: npm install axios (nếu chưa có)
```

## 🏃 Run

```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run linter
```

---

**Tóm tắt:** Cấu trúc này giúp code dễ tìm, dễ scale, dễ maintain. Mỗi file có một trách nhiệm rõ ràng.
