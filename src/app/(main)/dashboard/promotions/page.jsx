'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Pagination, Select, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import '../admin-dashboard.css';
import { voucherApi } from '@/apis/voucher.api';
import { serviceCategoryApi } from '@/apis/service-category.api';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';

const VOUCHER_TYPE = {
  PERCENT: 0,
  FIXED: 1,
};

const VOUCHER_STATUS = {
  ACTIVE: 0,
  INACTIVE: 1,
  EXPIRED: 2,
};

const normalizePaged = (payload) => ({
  items: Array.isArray(payload) ? payload : payload?.items || [],
  totalCount: Array.isArray(payload) ? payload.length : payload?.totalCount || 0,
  pageNumber: payload?.pageNumber || 1,
  pageSize: payload?.pageSize || 10,
});

const getVoucherTypeKey = (type) => {
  if (typeof type === 'number') return type;
  const text = String(type || '').toLowerCase();
  if (text.includes('fixed') || text.includes('amount')) return VOUCHER_TYPE.FIXED;
  return VOUCHER_TYPE.PERCENT;
};

const getVoucherStatusKey = (status, expiresAt) => {
  if (expiresAt && dayjs(expiresAt).isBefore(dayjs())) return 'expired';
  if (typeof status === 'number') {
    if (status === VOUCHER_STATUS.ACTIVE) return 'active';
    if (status === VOUCHER_STATUS.EXPIRED) return 'expired';
    return 'inactive';
  }
  const text = String(status || 'active').toLowerCase();
  if (text.includes('expire')) return 'expired';
  if (text.includes('inactive') || text.includes('disable')) return 'inactive';
  return 'active';
};

const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const statusMap = {
  active: { label: 'Đang chạy', className: 'admin-promo-status-active' },
  inactive: { label: 'Tạm tắt', className: 'admin-promo-status-expired' },
  expired: { label: 'Hết hạn', className: 'admin-promo-status-expired' },
};

function formatVoucherValue(record) {
  const type = getVoucherTypeKey(record.type);
  if (type === VOUCHER_TYPE.FIXED) return formatCurrency(record.value);
  return `${Number(record.value || 0)}%`;
}

function toPayload(values, includeCode = true) {
  const payload = {
    type: values.type,
    value: Number(values.value || 0),
    minOrderValue: Number(values.minOrderValue || 0),
    maxDiscount: Number(values.maxDiscount || 0),
    categoryId: values.categoryId || null,
    maxUsage: Number(values.maxUsage || 0),
    maxUsagePerUser: Number(values.maxUsagePerUser || 0),
    startsAt: values.dateRange?.[0]?.toISOString(),
    expiresAt: values.dateRange?.[1]?.toISOString(),
    description: values.description || '',
  };

  if (includeCode) payload.code = values.code?.trim();
  return payload;
}

export default function AdminPromotionsPage() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadVouchers = useCallback(async (pageNumber = meta.pageNumber, pageSize = meta.pageSize) => {
    setLoading(true);
    try {
      const response = await voucherApi.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: 'CreatedDate',
        SortDescending: true,
      });
      const paged = normalizePaged(response);
      setVouchers(paged.items);
      setMeta({ pageNumber: paged.pageNumber, pageSize: paged.pageSize, totalCount: paged.totalCount });
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  }, [message, meta.pageNumber, meta.pageSize]);

  useEffect(() => {
    loadVouchers(1, 10);
    serviceCategoryApi.getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : data?.items || []))
      .catch(() => setCategories([]));
  }, []);

  const activeCount = vouchers.filter((item) => getVoucherStatusKey(item.status, item.expiresAt) === 'active').length;
  const totalUsage = vouchers.reduce((sum, item) => sum + Number(item.usedCount || item.usageCount || item.used || 0), 0);
  const summaryCards = useMemo(() => [
    { icon: 'campaign', label: 'Khuyến mãi đang chạy', value: activeCount, meta: 'Theo trang hiện tại', tone: 'orange' },
    { icon: 'confirmation_number', label: 'Voucher đã sử dụng', value: totalUsage.toLocaleString('vi-VN'), meta: 'Tổng lượt sử dụng', tone: 'default' },
    { icon: 'payments', label: 'Tổng voucher', value: meta.totalCount, meta: 'Tất cả chương trình', tone: 'green' },
  ], [activeCount, meta.totalCount, totalUsage]);

  const openCreateModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({
      type: VOUCHER_TYPE.PERCENT,
      value: 10,
      minOrderValue: 0,
      maxDiscount: 0,
      maxUsage: 100,
      maxUsagePerUser: 1,
      dateRange: [dayjs(), dayjs().add(30, 'day')],
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      type: getVoucherTypeKey(record.type),
      value: record.value,
      minOrderValue: record.minOrderValue,
      maxDiscount: record.maxDiscount,
      categoryId: record.categoryId,
      maxUsage: record.maxUsage,
      maxUsagePerUser: record.maxUsagePerUser,
      dateRange: [
        record.startsAt ? dayjs(record.startsAt) : null,
        record.expiresAt ? dayjs(record.expiresAt) : null,
      ],
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingVoucher) {
        await voucherApi.update(editingVoucher.id, toPayload(values, false));
        message.success('Đã cập nhật voucher.');
      } else {
        await voucherApi.create(toPayload(values, true));
        message.success('Đã tạo voucher mới.');
      }
      setModalOpen(false);
      await loadVouchers(1, meta.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể lưu voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (record, status) => {
    try {
      await voucherApi.updateStatus(record.id, status);
      message.success('Đã cập nhật trạng thái voucher.');
      await loadVouchers();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = (record) => {
    modal.confirm({
      title: 'Xóa voucher?',
      content: `Voucher ${record.code} sẽ bị xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        await voucherApi.delete(record.id);
        message.success('Đã xóa voucher.');
        await loadVouchers();
      },
    });
  };

  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      width: 180,
      render: (_, record) => {
        const status = getVoucherStatusKey(record.status, record.expiresAt);
        return (
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${status === 'active' ? 'bg-[#FFF0E6] text-[#FF8228]' : 'bg-[#DDDDDD] text-[#555555]'}`}>
              <SymbolIcon>local_offer</SymbolIcon>
            </span>
            <div>
              <span className="block text-sm font-bold text-[#383838]">{record.code}</span>
              {record.description && <span className="block max-w-[220px] truncate text-xs text-[#818A91]">{record.description}</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 130,
      render: (value) => <span className="text-sm text-[#4A4A4A]">{getVoucherTypeKey(value) === VOUCHER_TYPE.FIXED ? 'Số tiền' : 'Phần trăm'}</span>,
    },
    {
      title: 'Giá trị',
      width: 120,
      render: (_, record) => <span className="text-sm font-bold text-[#FF8228]">{formatVoucherValue(record)}</span>,
    },
    {
      title: 'Sử dụng',
      width: 132,
      render: (_, record) => `${record.usedCount || record.usageCount || 0} / ${record.maxUsage || '∞'}`,
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      width: 130,
      render: (value) => value ? dayjs(value).format('DD/MM/YYYY') : 'Không giới hạn',
    },
    {
      title: 'Trạng thái',
      align: 'center',
      width: 116,
      render: (_, record) => {
        const status = statusMap[getVoucherStatusKey(record.status, record.expiresAt)] || statusMap.active;
        return <Tag className={`admin-promo-status ${status.className}`}>{status.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      align: 'right',
      width: 230,
      render: (_, record) => {
        const status = getVoucherStatusKey(record.status, record.expiresAt);
        return (
          <div className="flex justify-end gap-2">
            <Button size="small" onClick={() => openEditModal(record)}>Sửa</Button>
            <Button size="small" onClick={() => handleStatus(record, status === 'active' ? VOUCHER_STATUS.INACTIVE : VOUCHER_STATUS.ACTIVE)}>
              {status === 'active' ? 'Tắt' : 'Bật'}
            </Button>
            <Button size="small" danger onClick={() => handleDelete(record)}>Xóa</Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminShell activeKey="promotions">
      <section className="admin-page-heading">
        <div>
          <h2>Khuyến Mãi & Voucher</h2>
          <p>Thiết kế và quản lý chương trình ưu đãi, voucher và phần thưởng khách hàng.</p>
        </div>
        <Button type="primary" className="admin-primary-pill-button" icon={<SymbolIcon>add_circle</SymbolIcon>} onClick={openCreateModal}>
          Tạo voucher mới
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryCards.map((item) => (
          <Card key={item.label} className="admin-finance-summary-card">
            <SymbolIcon className="admin-finance-summary-watermark">{item.icon}</SymbolIcon>
            <p className="m-0 text-xs font-bold uppercase text-[#555555]">{item.label}</p>
            <h3 className={`m-0 mt-2 text-3xl font-bold ${item.tone === 'orange' ? 'text-[#FF8228]' : item.tone === 'green' ? 'text-[#39B54A]' : 'text-[#383838]'}`}>{item.value}</h3>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#555555]">{item.meta}</div>
          </Card>
        ))}
      </section>

      <Card className="admin-panel admin-promo-table-card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDDDD] pb-4">
          <h3 className="m-0 text-lg font-bold text-[#383838]">Danh Sách Voucher</h3>
          <Button onClick={() => loadVouchers(meta.pageNumber, meta.pageSize)}>Làm mới</Button>
        </div>
        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={vouchers}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={false}
          rowClassName={(record) => (getVoucherStatusKey(record.status, record.expiresAt) === 'expired' ? 'admin-promo-row-expired' : '')}
          scroll={{ x: 1040 }}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">Tổng {meta.totalCount} voucher</p>
          <Pagination
            className="admin-tech-pagination"
            current={meta.pageNumber}
            pageSize={meta.pageSize}
            total={meta.totalCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={loadVouchers}
          />
        </div>
      </Card>

      <Modal
        title={editingVoucher ? 'Cập nhật voucher' : 'Tạo voucher'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Mã voucher" name="code" rules={[{ required: !editingVoucher, message: 'Nhập mã voucher' }]}>
            <Input disabled={Boolean(editingVoucher)} placeholder="VD: FIXY20" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="Loại giảm giá" name="type" rules={[{ required: true }]}>
              <Select options={[
                { value: VOUCHER_TYPE.PERCENT, label: 'Phần trăm (%)' },
                { value: VOUCHER_TYPE.FIXED, label: 'Số tiền cố định' },
              ]} />
            </Form.Item>
            <Form.Item label="Giá trị" name="value" rules={[{ required: true, message: 'Nhập giá trị' }]}>
              <InputNumber className="!w-full" min={1} />
            </Form.Item>
            <Form.Item label="Đơn tối thiểu" name="minOrderValue">
              <InputNumber className="!w-full" min={0} addonAfter="đ" />
            </Form.Item>
            <Form.Item label="Giảm tối đa" name="maxDiscount">
              <InputNumber className="!w-full" min={0} addonAfter="đ" />
            </Form.Item>
            <Form.Item label="Lượt dùng tối đa" name="maxUsage">
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
            <Form.Item label="Lượt dùng / người" name="maxUsagePerUser">
              <InputNumber className="!w-full" min={0} />
            </Form.Item>
          </div>
          <Form.Item label="Dịch vụ áp dụng" name="categoryId">
            <Select
              allowClear
              showSearch
              placeholder="Tất cả dịch vụ"
              optionFilterProp="label"
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
            />
          </Form.Item>
          <Form.Item label="Thời gian hiệu lực" name="dateRange" rules={[{ required: true, message: 'Chọn thời gian hiệu lực' }]}>
            <DatePicker.RangePicker className="!w-full" showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn cho voucher" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block className="admin-promo-submit-button">
            {editingVoucher ? 'Lưu thay đổi' : 'Phát hành voucher'}
          </Button>
        </Form>
      </Modal>
    </AdminShell>
  );
}
