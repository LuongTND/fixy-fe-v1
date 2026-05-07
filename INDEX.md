# 📚 Documentation Index

**Hướng dẫn đầy đủ cho dự án Fixy Frontend**

---

## 🚀 Bắt Đầu Nhanh (Choose Your Path)

### 👨‍💻 Tôi là Developer Mới / Intern

1. **[QUICK_START.md](./QUICK_START.md)** (15 min)
   - Cài đặt project
   - Chạy dev server
   - Hiểu folder structure
   - Các task phổ biến

2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** (30 min)
   - Code patterns
   - Workflow chi tiết
   - Debugging tips

3. **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** (khi cần)
   - Architecture chi tiết
   - Full workflow example
   - Best practices

---

### 🏗️ Tôi là Tech Lead / Architect

1. **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** (Priority)
   - Architecture pattern
   - Quy chuẩn thiết kế
   - Workflow guidelines
   - Checklist

2. **[VERIFICATION.md](./VERIFICATION.md)**
   - Code standards
   - Naming conventions
   - Quality checks

3. **[QUICK_START.md](./QUICK_START.md)**
   - Team onboarding

---

### ✅ Tôi là Code Reviewer

1. **[VERIFICATION.md](./VERIFICATION.md)** (Main checklist)
   - Standards check
   - Code quality
   - Architecture compliance

2. **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)**
   - Reference patterns

3. **[DEVELOPMENT.md](./DEVELOPMENT.md)**
   - Code examples

---

## 📋 Documentation Guide

### 1. **QUICK_START.md** ⚡
   - **Dành cho:** Mọi người lần đầu tiên
   - **Thời gian:** 15 phút
   - **Nội dung:**
     - Installation
     - Environment setup
     - Running dev server
     - Common tasks
     - Debugging tips
     - Learning path

### 2. **PROJECT_ARCHITECTURE.md** 📐
   - **Dành cho:** Architect, Senior Dev, Tech Lead
   - **Thời gian:** 45 phút
   - **Nội dung:**
     - Design pattern (Feature-Based)
     - Full folder structure
     - File naming convention
     - Complete workflow: "Build Dashboard"
     - Step-by-step task checklist
     - Best practices
     - Common workflows
     - Development checklist

### 3. **VERIFICATION.md** ✅
   - **Dành cho:** Code Reviewer, QA
   - **Thời gian:** 30 phút
   - **Nội dung:**
     - Architecture verification
     - Folder structure checklist
     - Naming convention examples
     - Code pattern verification
     - Quality checklist
     - Deployment checklist

### 4. **DEVELOPMENT.md** 🧑‍💻
   - **Dành cho:** Developers (daily reference)
   - **Thời gian:** 20 phút
   - **Nội dung:**
     - Quick setup
     - Common workflows
     - Code patterns
     - Debugging tips
     - Testing
     - Deployment

---

## 🎯 By Task / Scenario

### "Tôi vừa clone project, phải làm gì?"
→ **[QUICK_START.md](./QUICK_START.md)** - Section "Installation"

### "Phải code cái gì đó về Dashboard"
→ **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - Section "Workflow: Call API Dashboard"
→ **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Section "Common Workflows > Create Dashboard"

### "Không biết code cái gì theo architecture này"
→ **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - Section "Folder Structure"
→ **[VERIFICATION.md](./VERIFICATION.md)** - Section "Code Quality Verification"

### "Code review task của intern"
→ **[VERIFICATION.md](./VERIFICATION.md)** - Section "Code Quality Verification"

### "Deploy lên production"
→ **[QUICK_START.md](./QUICK_START.md)** - Section "Deployment"
→ **[VERIFICATION.md](./VERIFICATION.md)** - Section "Deployment Checklist"

### "Debug API call không hoạt động"
→ **[QUICK_START.md](./QUICK_START.md)** - Section "Debugging Tips"
→ **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Section "Debugging"

### "Hiểu cấu trúc project"
→ **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - Section "Folder Structure"

### "Dùng Ant Design components"
→ **[ANTD_GUIDE.md](./ANTD_GUIDE.md)** - Full Ant Design guide
→ **[src/components/common/AntdExample.jsx](./src/components/common/AntdExample.jsx)** - Example component

---

## 🗂️ File Structure Visualization

```
fixy-fe-v1/
├── 📄 README.md               ← Project overview
├── 📄 QUICK_START.md          ← START HERE (5 min)
├── 📄 DEVELOPMENT.md          ← Daily reference
├── 📄 PROJECT_ARCHITECTURE.md ← Full guide
├── 📄 VERIFICATION.md         ← Standards & checklist
├── 📄 ANTD_GUIDE.md           ← Ant Design guide
├── 📄 INDEX.md                ← YOU ARE HERE
│
├── src/
│   ├── apis/                  # API services
│   ├── app/                   # Next.js pages
│   ├── base/                  # Config (Axios)
│   ├── components/            # React components
│   ├── constants/             # Constants
│   ├── hooks/                 # Custom hooks
│   ├── interfaces/            # Data shapes
│   ├── providers/             # Context
│   └── utils/                 # Utilities
│
├── public/                    # Static files
├── .env.example               # Env template
├── next.config.js
├── tsconfig.json
├── package.json
└── node_modules/
```

---

## 📊 Documentation Flowchart

```
START
  │
  ├─→ First time? → QUICK_START.md → DEVELOPMENT.md → PROJECT_ARCHITECTURE.md
  │
  ├─→ Code review? → VERIFICATION.md → PROJECT_ARCHITECTURE.md
  │
  ├─→ Architecture questions? → PROJECT_ARCHITECTURE.md
  │
  ├─→ Bug fix? → DEVELOPMENT.md → QUICK_START.md (Debugging)
  │
  └─→ Deploy? → VERIFICATION.md (Checklist) → DEVELOPMENT.md (Deploy section)
```

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Read [QUICK_START.md](./QUICK_START.md)
- [ ] Run `npm run dev`
- [ ] Understand folder structure
- [ ] Complete "Hello World" example

### Week 2: API Integration
- [ ] Read [DEVELOPMENT.md](./DEVELOPMENT.md)
- [ ] Create API service
- [ ] Create custom hook
- [ ] Display data in page

### Week 3: Forms & Components
- [ ] Create reusable components
- [ ] Form handling
- [ ] Validation
- [ ] Error handling

### Week 4: Advanced
- [ ] Read [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)
- [ ] Context & Providers
- [ ] Authentication
- [ ] Advanced patterns

---

## 🆘 Quick Help

| Question | Answer Document |
|----------|-----------------|
| How to start? | [QUICK_START.md](./QUICK_START.md) |
| How to add dashboard? | [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) - Workflow |
| What are standards? | [VERIFICATION.md](./VERIFICATION.md) |
| How to code something? | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| What's the architecture? | [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) - Overview |
| How to deploy? | [QUICK_START.md](./QUICK_START.md) - Deployment |
| Debug API? | [DEVELOPMENT.md](./DEVELOPMENT.md) - Debugging |

---

## 📞 Support

**If stuck, check:**

1. Relevant section in docs above
2. [QUICK_START.md - Common Issues](./QUICK_START.md#-common-issues)
3. [DEVELOPMENT.md - Debugging](./DEVELOPMENT.md#-debugging)
4. Ask in team chat

---

## ✨ Key Points to Remember

1. **Feature-Based Architecture** - Code organized by features, not file types
2. **Path Aliases** - Use `@/` instead of relative paths
3. **Naming Convention** - kebab-case for files, PascalCase for components
4. **API Patterns** - Service → Hook → Component pattern
5. **Error Handling** - Always handle errors and show loading states
6. **Code Standards** - Follow [VERIFICATION.md](./VERIFICATION.md) checklist

---

## 📈 Version Info

- **Next.js:** 16.2.5
- **React:** 19.2.4
- **JavaScript:** ES6+
- **Created:** 2026-05-07
- **Pattern:** Feature-Based Architecture

---

**Ready? Start with [QUICK_START.md](./QUICK_START.md)! 🚀**
