'use client';

import { Avatar, Button, Card, Pagination, Segmented, Table, Tag } from 'antd';
import '../admin-dashboard.css';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';

const statCards = [
  { icon: 'group', label: 'Tổng khách hàng', value: '12,482', meta: '+12%', tone: 'orange' },
  { icon: 'how_to_reg', label: 'Đang hoạt động', value: '12,234', meta: '98%', tone: 'green' },
  { icon: 'lock_person', label: 'Tài khoản khóa', value: '248', meta: '2%', tone: 'error' },
];

const customers = [
  {
    key: 'VT-10293',
    name: 'Nguyễn Văn Phúc',
    initials: 'NP',
    id: 'VT-10293',
    phone: '090 123 4567',
    email: 'phuc.nv@email.com',
    joinedAt: '12/10/2023',
    orders: 14,
    status: 'active',
  },
  {
    key: 'VT-10542',
    name: 'Trần Thị Lan',
    id: 'VT-10542',
    phone: '091 876 5432',
    email: 'lan.tran@web.vn',
    joinedAt: '05/01/2024',
    orders: 3,
    status: 'locked',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfaluuDnWHsClY3F-sObP9e-DDPMbK19vmn4478wOCMf6u498sIUNmSGp7pmG02LyCmJcpZHpsy6rPnW8oMvFS-nlsCck11ckSLg-jxj6GEywx1rd8zsZwT36H0IEgDbSvXznw4WGaz1co3BQzbG9izUtrz2aDXlzv6a-RZAzU0aLJkyq7LqpbyF0JNtQJjvt2zO_ndoqzVCjo_OXqMpiZa81xKV6UYPk3tpFenTZEN6AMkv7eFYvyJ2kzK_5MnT-Hu11ZDP86WKA',
  },
  {
    key: 'VT-10887',
    name: 'Lê Minh Hoàng',
    initials: 'LH',
    id: 'VT-10887',
    phone: '098 555 9999',
    email: 'hoang.lm@gmail.com',
    joinedAt: '28/02/2024',
    orders: 27,
    status: 'active',
  },
];

const statusLabels = {
  active: { label: 'Hoạt động', className: 'admin-customer-status-active' },
  locked: { label: 'Đã khóa', className: 'admin-customer-status-locked' },
};

const columns = [
  {
    title: 'Khách hàng',
    dataIndex: 'name',
    key: 'name',
    render: (_, record) => (
      <div className="flex items-center gap-3">
        {record.avatar ? (
          <Avatar size={40} src={record.avatar} />
        ) : (
          <Avatar size={40} className="!bg-[#FFF0E6] !font-bold !text-[#FF8228]">
            {record.initials}
          </Avatar>
        )}
        <div>
          <p className="m-0 text-sm font-bold text-[#383838]">{record.name}</p>
          <p className="m-0 text-xs text-[#555555]">ID: {record.id}</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Liên hệ',
    key: 'contact',
    render: (_, record) => (
      <div className="space-y-1 text-sm text-[#4A4A4A]">
        <span className="flex items-center gap-1">
          <SymbolIcon className="!text-[16px] !text-[#555555]">call</SymbolIcon>
          {record.phone}
        </span>
        <span className="flex items-center gap-1">
          <SymbolIcon className="!text-[16px] !text-[#555555]">mail</SymbolIcon>
          {record.email}
        </span>
      </div>
    ),
  },
  {
    title: 'Ngày tham gia',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    render: (value) => <span className="text-sm text-[#4A4A4A]">{value}</span>,
  },
  {
    title: 'Đơn hàng',
    dataIndex: 'orders',
    key: 'orders',
    render: (value) => (
      <Tag className="!m-0 !rounded-full !border-[#DDDDDD] !px-3 !py-1 !text-xs !font-semibold !text-[#4A4A4A]">
        {value} đơn
      </Tag>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (value) => (
      <Tag className={`admin-customer-status ${statusLabels[value].className}`}>
        <span />
        {statusLabels[value].label}
      </Tag>
    ),
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'right',
    width: 144,
    render: (_, record) => (
      <div className="admin-customer-actions">
        <Button
          className="admin-tech-icon-action"
          title="Lịch sử"
          icon={<SymbolIcon className="!text-[18px]">history</SymbolIcon>}
        />
        <Button
          className={`admin-tech-icon-action ${record.status === 'locked' ? 'admin-customer-lock-active' : ''}`}
          title={record.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          icon={<SymbolIcon className="!text-[18px]">{record.status === 'locked' ? 'lock' : 'lock_open'}</SymbolIcon>}
        />
      </div>
    ),
  },
];

export default function AdminCustomersPage() {
  return (
    <AdminShell activeKey="customers">
      <section className="admin-page-heading">
        <div>
          <h2>Quản Lý Khách Hàng</h2>
          <p>Theo dõi hồ sơ, trạng thái tài khoản và mức độ sử dụng dịch vụ.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="admin-tech-stat-card">
            <div className="flex items-start justify-between gap-4">
              <span className={`admin-tech-stat-icon admin-tech-stat-${stat.tone}`}>
                <SymbolIcon>{stat.icon}</SymbolIcon>
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${stat.tone === 'error' ? 'text-[#EA4335]' : 'text-[#2C9901]'}`}>
                <SymbolIcon className="!text-[16px]">{stat.tone === 'error' ? 'warning' : 'trending_up'}</SymbolIcon>
                {stat.meta}
              </span>
            </div>
            <p className="m-0 mt-4 text-xs font-semibold uppercase text-[#555555]">{stat.label}</p>
            <h3 className="m-0 text-2xl font-bold text-[#383838]">{stat.value}</h3>
          </Card>
        ))}
      </section>

      <Card className="admin-panel !mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDDDD] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase text-[#555555]">Trạng thái</span>
            <Segmented
              defaultValue="all"
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Hoạt động', value: 'active' },
                { label: 'Đã khóa', value: 'locked' },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="admin-toolbar-button" icon={<SymbolIcon>filter_list</SymbolIcon>}>Bộ lọc nâng cao</Button>
            <Button className="admin-toolbar-button" icon={<SymbolIcon>download</SymbolIcon>}>Xuất CSV</Button>
          </div>
        </div>

        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={customers}
          pagination={false}
          scroll={{ x: 960 }}
          rowClassName={(record) => (record.status === 'locked' ? 'admin-customer-row-locked' : '')}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">Hiển thị 1-10 trong 12,482 khách hàng</p>
          <Pagination
            className="admin-tech-pagination"
            defaultCurrent={1}
            defaultPageSize={10}
            total={12482}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </Card>
    </AdminShell>
  );
}
