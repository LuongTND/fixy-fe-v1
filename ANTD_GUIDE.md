# 🎨 Ant Design Integration Guide

**Ant Design v5** đã được cài đặt và cấu hình sẵn cho dự án.

---

## 📦 Cài Đặt

Ant Design đã được thêm vào `package.json`. Bạn chỉ cần chạy:

```bash
npm install
```

---

## 🛠️ Cấu Trúc

### Files đã cấu hình:

1. **`src/providers/AntdProvider.jsx`** - Ant Design config
2. **`app/layout-client.jsx`** - Client wrapper để dùng providers
3. **`app/layout.jsx`** - Updated root layout
4. **`app/globals.css`** - Ant Design CSS import
5. **`tailwind.config.js`** - Tailwind + Ant Design config
6. **`src/components/common/AntdExample.jsx`** - Example component

---

## 📚 Cách Sử Dụng

### 1️⃣ Basic Import & Usage

```jsx
'use client';

import { Button, Card, Space, Tag } from 'antd';
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

### 2️⃣ Icons

Ant Design có icon library tích hợp sẵn:

```jsx
import { 
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

// Sử dụng
<Button icon={<PlusOutlined />}>Add</Button>
```

👉 [Full icon list](https://ant.design/components/icon/)

### 3️⃣ Components Populer

#### Button
```jsx
<Button type="primary">Primary</Button>
<Button type="default">Default</Button>
<Button type="dashed">Dashed</Button>
<Button danger>Danger</Button>
<Button disabled>Disabled</Button>

// Với icon
<Button icon={<SearchOutlined />}>Search</Button>

// Size
<Button size="large">Large</Button>
<Button size="middle">Middle</Button>
<Button size="small">Small</Button>
```

#### Input
```jsx
import { Input } from 'antd';

<Input placeholder="Enter text" />
<Input.TextArea placeholder="Enter text" rows={4} />
<Input type="password" placeholder="Password" />
```

#### Form
```jsx
import { Form, Input, Button } from 'antd';

<Form layout="vertical">
  <Form.Item label="Username" name="username">
    <Input placeholder="username" />
  </Form.Item>
  
  <Form.Item label="Password" name="password">
    <Input type="password" placeholder="password" />
  </Form.Item>
  
  <Form.Item>
    <Button type="primary" htmlType="submit">
      Login
    </Button>
  </Form.Item>
</Form>
```

#### Table
```jsx
import { Table } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
];

const data = [
  { key: 1, name: 'John', email: 'john@example.com' },
  { key: 2, name: 'Jane', email: 'jane@example.com' },
];

<Table columns={columns} dataSource={data} />
```

#### Modal
```jsx
import { Modal, Button } from 'antd';
import { useState } from 'react';

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      
      <Modal
        title="Confirm"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <p>Are you sure?</p>
      </Modal>
    </>
  );
}
```

#### Card
```jsx
import { Card } from 'antd';

<Card title="Card Title" bordered={false}>
  <p>Content here</p>
</Card>
```

#### Tag
```jsx
import { Tag } from 'antd';

<Tag color="blue">Success</Tag>
<Tag color="orange">Processing</Tag>
<Tag color="red">Error</Tag>
```

#### Space
```jsx
import { Space, Button } from 'antd';

<Space>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
  <Button>Button 3</Button>
</Space>

// Vertical spacing
<Space direction="vertical">
  <div>Item 1</div>
  <div>Item 2</div>
</Space>
```

---

## 🎨 Theming

### Customize Colors

Chỉnh sửa `src/providers/AntdProvider.jsx`:

```jsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',  // Primary color
      borderRadius: 6,          // Border radius
      fontSize: 14,             // Font size
    },
  }}
>
```

### Dark Mode

```jsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
    },
    algorithm: require('antd/theme/dark'),  // Dark theme
  }}
>
```

---

## 📱 Responsive Design

Ant Design Components đã responsive. Combine với Tailwind Grid:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

---

## 🌐 Locale (Tiếng Việt)

Ant Design đã cấu hình tiếng Việt (`viVN`) trong `AntdProvider.jsx`:

```jsx
import viVN from 'antd/locale/vi_VN';

<ConfigProvider locale={viVN}>
```

Messages sẽ tự động hiển thị bằng tiếng Việt (ví dụ: "Ok", "Cancel" → "OK", "Hủy").

---

## ✅ Common Patterns

### Form with Validation

```jsx
'use client';

import { Form, Input, Button, message } from 'antd';

export function LoginForm() {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      console.log('Login:', values);
      message.success('Login successful!');
    } catch (err) {
      message.error('Login failed!');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Invalid email' },
        ]}
      >
        <Input placeholder="email@example.com" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: 'Password is required' },
          { min: 6, message: 'Min 6 characters' },
        ]}
      >
        <Input type="password" placeholder="password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Loading Button

```jsx
import { Button } from 'antd';
import { useState } from 'react';

export function ActionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Do something
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="primary" 
      loading={loading}
      onClick={handleClick}
    >
      {loading ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### Modal with Form

```jsx
'use client';

import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';

export function AddUserModal() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Add user:', values);
      setOpen(false);
      form.resetFields();
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Add User
      </Button>

      <Modal
        title="Add User"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="User name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

---

## 🚀 Performance Tips

1. **Lazy load** components khi chỉ hiển thị một số:
```jsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Loading...</div>,
});
```

2. **Memoize** components:
```jsx
import { memo } from 'react';

export const Card = memo(function Card({ data }) {
  return <div>{data}</div>;
});
```

3. **Use virtualized list** cho large data:
```jsx
import { Table } from 'antd';

<Table
  columns={columns}
  dataSource={data}
  pagination={{ pageSize: 50 }}
  virtual  // Enable virtual scrolling
/>
```

---

## 📚 Resources

- [Ant Design Docs](https://ant.design/)
- [Component API](https://ant.design/components/overview/)
- [Icons](https://ant.design/components/icon/)
- [Theming](https://ant.design/docs/react/customize-theme)
- [Examples](https://ant.design/docs/react/use-in-typescript)

---

## 🎯 Example Component

Check out `src/components/common/AntdExample.jsx` for a complete example with buttons, cards, tags, and more.

---

## ❓ Troubleshooting

### Issue: Styles not working

**Solution:** Make sure `AntdProvider` wraps your components in `app/layout-client.jsx`.

### Issue: Icons not showing

**Solution:** Import from `@ant-design/icons`:
```jsx
import { PlusOutlined } from '@ant-design/icons';
```

### Issue: Locale not working

**Solution:** Check `src/providers/AntdProvider.jsx` has:
```jsx
import viVN from 'antd/locale/vi_VN';

<ConfigProvider locale={viVN}>
```

---

**🎨 Ready to use Ant Design! Happy building! 🚀**
