'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, Avatar, Button, Card, Input, Pagination, Segmented, Table, Tag } from 'antd';
import '../admin-dashboard.css';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';
import { useUsers } from '@/hooks/useUsers';
import { parseBackendDate, formatFullDateTime } from '@/utils/format';
import { formatGenderLabel, getInitials, extractCollectionPayload as extractUsersPayload } from '@/utils/helpers';

const CUSTOMER_ROLE = 'CUSTOMER';

const statusLabels = {
  active: { label: 'Hoạt động', className: 'admin-customer-status-active' },
  locked: { label: 'Đã khóa', className: 'admin-customer-status-locked' },
};

function getUserId(record) {
  return record?.id || record?.userId || record?.accountId || record?.customerId || record?.email;
}

function getUserName(record) {
  return record?.fullName || record?.name || record?.displayName || record?.email || 'Khách hàng';
}

function getUserStatus(record) {
  if (typeof record?.isActive === 'boolean') return record.isActive ? 'active' : 'locked';

  const status = String(record?.status || '').toLowerCase();
  if (status.includes('inactive') || status.includes('locked') || status.includes('block') || status.includes('deactivate')) {
    return 'locked';
  }

  return 'active';
}


export default function AdminCustomersPage() {
  const { message, modal } = App.useApp();
  const { getUsers, activateUser, deactivateUser, loading } = useUsers();
  const lastCustomersRequestKeyRef = useRef('');
  const statsLoadedRef = useRef(false);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0 });
  const [filters, setFilters] = useState({
    PageNumber: 1,
    PageSize: 10,
    SearchTerm: '',
    Status: 'all',
  });

  const getQueryParams = useCallback((overrides = {}) => {
    const searchTerm = overrides.SearchTerm ?? filters.SearchTerm;
    const status = overrides.Status ?? filters.Status;
    const params = {
      Role: CUSTOMER_ROLE,
      PageNumber: overrides.PageNumber ?? filters.PageNumber,
      PageSize: overrides.PageSize ?? filters.PageSize,
      Search: searchTerm || undefined,
      SearchTerm: searchTerm || undefined,
      SortBy: 'CreatedDate',
      SortDescending: true,
    };

    if (status === 'active') params.IsActive = true;
    if (status === 'locked') params.IsActive = false;

    return params;
  }, [filters]);

  const loadCustomers = useCallback(async ({ force = false } = {}) => {
    const params = getQueryParams();
    const requestKey = JSON.stringify(params);
    if (!force && lastCustomersRequestKeyRef.current === requestKey) return;
    lastCustomersRequestKeyRef.current = requestKey;

    try {
      const payload = await getUsers(params, { dedupe: !force });
      const next = extractUsersPayload(payload);
      setCustomers(next.items);
      setTotal(next.totalCount);
    } catch (error) {
      lastCustomersRequestKeyRef.current = '';
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách khách hàng');
      setCustomers([]);
      setTotal(0);
    }
  }, [getQueryParams, getUsers, message]);

  const loadStats = useCallback(async ({ force = false } = {}) => {
    if (!force && statsLoadedRef.current) return;
    statsLoadedRef.current = true;

    try {
      const [allPayload, activePayload, lockedPayload] = await Promise.all([
        getUsers({ Role: CUSTOMER_ROLE, PageNumber: 1, PageSize: 1 }, { dedupe: !force }),
        getUsers({ Role: CUSTOMER_ROLE, IsActive: true, PageNumber: 1, PageSize: 1 }, { dedupe: !force }),
        getUsers({ Role: CUSTOMER_ROLE, IsActive: false, PageNumber: 1, PageSize: 1 }, { dedupe: !force }),
      ]);

      setStats({
        total: extractUsersPayload(allPayload).totalCount,
        active: extractUsersPayload(activePayload).totalCount,
        locked: extractUsersPayload(lockedPayload).totalCount,
      });
    } catch {
      statsLoadedRef.current = false;
    }
  }, [getUsers]);

  useEffect(() => {
    queueMicrotask(loadCustomers);
  }, [loadCustomers]);

  useEffect(() => {
    queueMicrotask(loadStats);
  }, [loadStats]);

  const statCards = useMemo(() => ([
    { icon: 'group', label: 'Tổng khách hàng', value: stats.total, meta: 'Tất cả tài khoản', tone: 'orange' },
    { icon: 'how_to_reg', label: 'Đang hoạt động', value: stats.active, meta: 'Có thể đặt dịch vụ', tone: 'green' },
    { icon: 'lock_person', label: 'Tài khoản khóa', value: stats.locked, meta: 'Tạm ngưng sử dụng', tone: 'error' },
  ]), [stats]);

  const handleToggleStatus = (record) => {
    const status = getUserStatus(record);
    const userId = getUserId(record);
    if (!userId) return;

    const isLocking = status === 'active';
    modal.confirm({
      title: isLocking ? 'Khóa tài khoản khách hàng?' : 'Mở khóa tài khoản khách hàng?',
      content: isLocking
        ? 'Khách hàng sẽ tạm thời không thể sử dụng tài khoản.'
        : 'Khách hàng sẽ có thể sử dụng tài khoản trở lại.',
      okText: isLocking ? 'Khóa tài khoản' : 'Mở khóa',
      cancelText: 'Hủy',
      okButtonProps: isLocking ? { danger: true } : {},
      async onOk() {
        if (isLocking) {
          await deactivateUser(userId);
          message.success('Đã khóa tài khoản khách hàng');
        } else {
          await activateUser(userId);
          message.success('Đã mở khóa tài khoản khách hàng');
        }

        await Promise.all([loadCustomers({ force: true }), loadStats({ force: true })]);
      },
    });
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => {
        const name = getUserName(record);
        return (
          <div className="flex items-center gap-3">
            {record.avatarUrl ? (
              <Avatar size={40} src={record.avatarUrl} />
            ) : (
              <Avatar size={40} className="!inline-flex !items-center !justify-center !bg-[#FFF0E6] !font-bold !text-[#FF8228]">
                {getInitials(name, 'KH')}
              </Avatar>
            )}
            <div>
              <p className="m-0 text-sm font-bold text-[#383838]">{name}</p>
              <p className="m-0 text-xs text-[#555555]">{record.email || 'Chưa có email'}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1 text-sm text-[#4A4A4A]">
          <span className="flex items-center gap-1">
            <SymbolIcon className="!text-[16px] !text-[#555555]">call</SymbolIcon>
            {record.phone || 'Chưa cập nhật'}
          </span>
          <span className="flex items-center gap-1">
            <SymbolIcon className="!text-[16px] !text-[#555555]">mail</SymbolIcon>
            {record.email || 'Chưa cập nhật'}
          </span>
        </div>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (_, record) => (
        <span className="text-sm text-[#4A4A4A]">{formatFullDateTime(record.createdDate || record.createdAt)}</span>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (value) => <span className="text-sm text-[#4A4A4A]">{formatGenderLabel(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_, record) => {
        const status = getUserStatus(record);
        return (
          <Tag className={`admin-customer-status ${statusLabels[status].className}`}>
            <span />
            {statusLabels[status].label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 96,
      render: (_, record) => {
        const status = getUserStatus(record);
        return (
          <Button
            className={`admin-tech-icon-action ${status === 'locked' ? 'admin-customer-lock-active' : ''}`}
            title={status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            icon={<SymbolIcon className="!text-[18px]">{status === 'locked' ? 'lock_open' : 'lock'}</SymbolIcon>}
            onClick={() => handleToggleStatus(record)}
          />
        );
      },
    },
  ];

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
            <h3 className="m-0 text-2xl font-bold text-[#383838]">{Number(stat.value || 0).toLocaleString('vi-VN')}</h3>
          </Card>
        ))}
      </section>

      <Card className="admin-panel !mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDDDD] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={filters.Status}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Hoạt động', value: 'active' },
                { label: 'Đã khóa', value: 'locked' },
              ]}
              onChange={(value) => setFilters((current) => ({ ...current, Status: value, PageNumber: 1 }))}
            />
            <Input.Search
              allowClear
              className="admin-tech-search"
              placeholder="Tìm tên, email hoặc số điện thoại"
              onSearch={(value) => setFilters((current) => ({ ...current, SearchTerm: value, PageNumber: 1 }))}
            />
          </div>
          <Button className="admin-toolbar-button" icon={<SymbolIcon>refresh</SymbolIcon>} onClick={() => loadCustomers({ force: true })}>
            Làm mới
          </Button>
        </div>

        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={customers}
          loading={loading}
          pagination={false}
          rowKey={(record) => getUserId(record)}
          scroll={{ x: 960 }}
          rowClassName={(record) => (getUserStatus(record) === 'locked' ? 'admin-customer-row-locked' : '')}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">
            Hiển thị {customers.length} / {total.toLocaleString('vi-VN')} khách hàng
          </p>
          <Pagination
            className="admin-tech-pagination"
            current={filters.PageNumber}
            pageSize={filters.PageSize}
            total={total}
            onChange={(page, pageSize) => setFilters((current) => ({ ...current, PageNumber: page, PageSize: pageSize }))}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </Card>
    </AdminShell>
  );
}
