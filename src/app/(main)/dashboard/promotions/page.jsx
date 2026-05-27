'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Pagination, Select, Table, Tag, Progress, Switch, Tooltip, Radio, Space } from 'antd';
import dayjs from 'dayjs';
import '../admin-dashboard.css';
import { voucherApi } from '@/apis/voucher.api';
import { voucherCampaignApi } from '@/apis/voucher-campaign.api';
import { serviceCategoryApi } from '@/apis/service-category.api';
import { vietnamProvincesApi } from '@/apis/vietnam-provinces.api';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';
import { VOUCHER_TYPE, VOUCHER_STATUS, VOUCHER_CAMPAIGN_STATUS, VOUCHER_AUTO_TRIGGER_EVENT } from '@/constants/enums';
import { getVoucherTypeKey, getVoucherStatusKey, formatCurrency, formatVoucherValue, statusMap } from '@/utils';

const normalizePaged = (payload) => ({
  items: Array.isArray(payload) ? payload : payload?.items || [],
  totalCount: Array.isArray(payload) ? payload.length : payload?.totalCount || 0,
  pageNumber: payload?.pageNumber || 1,
  pageSize: payload?.pageSize || 10,
});

function toPayload(values, includeCode = true) {
  const payload = {
    type: values.type,
    value: Number(values.value || 0),
    minOrderValue: Number(values.minOrderValue || 0),
    maxDiscount: Number(values.maxDiscount || 0),
    categoryId: values.categoryId || null,
    maxUsage: Number(values.maxUsage || 0),
    maxUsagePerUser: Number(values.maxUsagePerUser || 0),
    startsAt: values.dateRange?.[0]?.format(),
    expiresAt: values.dateRange?.[1]?.format(),
    description: values.description || '',
    city: values.city || null,
    firstOrderOnly: Boolean(values.firstOrderOnly),
    campaignId: values.campaignId || null,
  };

  if (includeCode) payload.code = values.code?.trim();
  return payload;
}

const campaignStatusMap = {
  active: { label: 'Đang chạy', className: 'admin-promo-status-active' },
  draft: { label: 'Nháp', className: 'admin-promo-status-draft' },
  suspended: { label: 'Tạm dừng', className: 'admin-promo-status-suspended' },
  ended: { label: 'Đã kết thúc', className: 'admin-promo-status-ended' },
};

const campaignTriggerOptions = [
  { value: VOUCHER_AUTO_TRIGGER_EVENT.MANUAL, label: 'Thủ công' },
  { value: VOUCHER_AUTO_TRIGGER_EVENT.NEW_CUSTOMER, label: 'Khách hàng mới' },
  { value: VOUCHER_AUTO_TRIGGER_EVENT.FIRST_BOOKING, label: 'Đơn đầu tiên' },
  { value: VOUCHER_AUTO_TRIGGER_EVENT.REACTIVATION, label: 'Kích hoạt lại' },
];

const getCampaignStatusKey = (status, expiresAt) => {
  if (expiresAt && dayjs(expiresAt).isBefore(dayjs())) return 'ended';

  if (typeof status === 'number') {
    if (status === VOUCHER_CAMPAIGN_STATUS.ACTIVE) return 'active';
    if (status === VOUCHER_CAMPAIGN_STATUS.SUSPENDED) return 'suspended';
    if (status === VOUCHER_CAMPAIGN_STATUS.ENDED) return 'ended';
    return 'draft';
  }

  const text = String(status || 'draft').toLowerCase();
  if (text.includes('active')) return 'active';
  if (text.includes('suspend') || text.includes('disabled')) return 'suspended';
  if (text.includes('end') || text.includes('expire')) return 'ended';
  return 'draft';
};

const getTriggerLabel = (value) => {
  const option = campaignTriggerOptions.find((item) => item.value === Number(value || 0));
  return option?.label || 'Thủ công';
};

function toCampaignPayload(values, includeStatus = false) {
  const payload = {
    name: values.name?.trim(),
    description: values.description || '',
    startsAt: values.dateRange?.[0]?.format(),
    expiresAt: values.dateRange?.[1]?.format(),
    budgetLimit: Number(values.budgetLimit || 0),
    autoTriggerEvent: Number(values.autoTriggerEvent ?? VOUCHER_AUTO_TRIGGER_EVENT.MANUAL),
  };

  if (includeStatus) {
    payload.status = Number(values.status ?? VOUCHER_CAMPAIGN_STATUS.DRAFT);
  }

  return payload;
}

export default function AdminPromotionsPage() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [vouchers, setVouchers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [campaignMeta, setCampaignMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaignSubmitting, setCampaignSubmitting] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    SearchTerm: '',
    CategoryId: undefined,
    Type: undefined,
    Status: 'all',
  });
  const [campaignFilters, setCampaignFilters] = useState({
    SearchTerm: '',
    Status: 'all',
  });

  const loadVouchers = useCallback(async (
    pageNumber = meta.pageNumber,
    pageSize = meta.pageSize,
    currentFilters = filters
  ) => {
    setLoading(true);
    try {
      const response = await voucherApi.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: 'CreatedDate',
        SortDescending: true,
        SearchTerm: currentFilters.SearchTerm || undefined,
      });
      const paged = normalizePaged(response);
      setVouchers(paged.items);
      setMeta({ pageNumber: paged.pageNumber, pageSize: paged.pageSize, totalCount: paged.totalCount });
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  }, [message, meta.pageNumber, meta.pageSize, filters]);

  const loadCampaigns = useCallback(async (
    pageNumber = campaignMeta.pageNumber,
    pageSize = campaignMeta.pageSize
  ) => {
    setCampaignLoading(true);
    try {
      const response = await voucherCampaignApi.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: 'CreatedDate',
        SortDescending: true,
      });
      const paged = normalizePaged(response);
      setCampaigns(paged.items);
      setCampaignMeta({ pageNumber: paged.pageNumber, pageSize: paged.pageSize, totalCount: paged.totalCount });
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách chiến dịch.');
    } finally {
      setCampaignLoading(false);
    }
  }, [campaignMeta.pageNumber, campaignMeta.pageSize, message]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadVouchers(1, 10);
        loadCampaigns(1, 10);
      }
    });
    
    serviceCategoryApi.getAll()
      .then((data) => {
        if (active) setCategories(Array.isArray(data) ? data : data?.items || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
      
    vietnamProvincesApi.getProvinces()
      .then((data) => {
        if (active) setProvinces(data || []);
      })
      .catch(() => {
        if (active) setProvinces([]);
      });

    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = vouchers.filter((item) => getVoucherStatusKey(item.status, item.expiresAt) === 'active').length;
  const totalUsage = vouchers.reduce((sum, item) => sum + Number(item.usedCount || item.usageCount || item.used || 0), 0);
  
  const summaryCards = useMemo(() => [
    { 
      icon: 'campaign', 
      label: 'Khuyến mãi đang chạy', 
      value: activeCount, 
      meta: 'Theo trang hiện tại', 
      bgClass: 'from-[#FFF0E6] to-[#FFF9F5] border-[#FFD9C3]',
      iconClass: 'bg-[#FF8228] text-white',
      valueColor: 'text-[#FF8228]'
    },
    { 
      icon: 'confirmation_number', 
      label: 'Voucher đã sử dụng', 
      value: totalUsage.toLocaleString('vi-VN'), 
      meta: 'Tổng lượt sử dụng', 
      bgClass: 'from-[#EAF9F2] to-[#F5FCF9] border-[#C2F0DB]',
      iconClass: 'bg-[#39B54A] text-white',
      valueColor: 'text-[#39B54A]'
    },
    { 
      icon: 'payments', 
      label: 'Tổng voucher', 
      value: meta.totalCount, 
      meta: 'Tất cả chương trình', 
      bgClass: 'from-[#E8F8FE] to-[#F3FCFF] border-[#BBEAFF]',
      iconClass: 'bg-[#00A8E8] text-white',
      valueColor: 'text-[#00A8E8]'
    },
  ], [activeCount, meta.totalCount, totalUsage]);

  const campaignOptions = useMemo(() => campaigns.map((campaign) => {
    const statusKey = getCampaignStatusKey(campaign.status, campaign.expiresAt);
    const status = campaignStatusMap[statusKey] || campaignStatusMap.draft;
    return {
      value: campaign.id,
      label: `${campaign.name || 'Chiến dịch'} - ${status.label}`,
    };
  }), [campaigns]);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        type: VOUCHER_TYPE.PERCENT,
        value: 10,
        minOrderValue: 0,
        maxDiscount: 0,
        maxUsage: 100,
        maxUsagePerUser: 1,
        dateRange: [dayjs(), dayjs().add(30, 'day')],
        city: undefined,
        firstOrderOnly: false,
        campaignId: undefined,
      });
    }, 0);
  };

  const openEditModal = (record) => {
    setEditingVoucher(record);
    setModalOpen(true);
    setTimeout(() => {
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
        city: record.city || undefined,
        firstOrderOnly: Boolean(record.firstOrderOnly),
        campaignId: record.campaignId || undefined,
      });
    }, 0);
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

  const openCreateCampaignModal = () => {
    setEditingCampaign(null);
    setCampaignModalOpen(true);
    setTimeout(() => {
      campaignForm.resetFields();
      campaignForm.setFieldsValue({
        name: '',
        description: '',
        budgetLimit: 0,
        status: VOUCHER_CAMPAIGN_STATUS.DRAFT,
        autoTriggerEvent: VOUCHER_AUTO_TRIGGER_EVENT.MANUAL,
        dateRange: [dayjs(), dayjs().add(30, 'day')],
      });
    }, 0);
  };

  const openEditCampaignModal = (record) => {
    setEditingCampaign(record);
    setCampaignModalOpen(true);
    setTimeout(() => {
      campaignForm.setFieldsValue({
        name: record.name,
        description: record.description,
        budgetLimit: record.budgetLimit,
        status: Number(record.status ?? VOUCHER_CAMPAIGN_STATUS.DRAFT),
        autoTriggerEvent: Number(record.autoTriggerEvent ?? VOUCHER_AUTO_TRIGGER_EVENT.MANUAL),
        dateRange: [
          record.startsAt ? dayjs(record.startsAt) : null,
          record.expiresAt ? dayjs(record.expiresAt) : null,
        ],
      });
    }, 0);
  };

  const handleCampaignSubmit = async (values) => {
    setCampaignSubmitting(true);
    try {
      if (editingCampaign) {
        await voucherCampaignApi.update(editingCampaign.id, toCampaignPayload(values, false));
        message.success('Đã cập nhật chiến dịch.');
      } else {
        await voucherCampaignApi.create(toCampaignPayload(values, true));
        message.success('Đã tạo chiến dịch voucher.');
      }
      setCampaignModalOpen(false);
      await loadCampaigns(1, campaignMeta.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể lưu chiến dịch.');
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const handleCampaignStatus = async (record, status) => {
    try {
      await voucherCampaignApi.updateStatus(record.id, status);
      message.success('Đã cập nhật trạng thái chiến dịch.');
      await loadCampaigns();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái chiến dịch.');
    }
  };

  const handleCampaignDelete = (record) => {
    modal.confirm({
      title: 'Xóa chiến dịch?',
      content: `Chiến dịch ${record.name} sẽ bị xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        await voucherCampaignApi.delete(record.id);
        message.success('Đã xóa chiến dịch.');
        await loadCampaigns();
      },
    });
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((item) => {
      if (filters.CategoryId && item.categoryId !== filters.CategoryId) {
        return false;
      }
      if (filters.Type !== undefined && getVoucherTypeKey(item.type) !== filters.Type) {
        return false;
      }
      if (filters.Status && filters.Status !== 'all') {
        const itemStatus = getVoucherStatusKey(item.status, item.expiresAt);
        if (filters.Status === 'active' && itemStatus !== 'active') return false;
        if (filters.Status === 'inactive' && !['draft', 'disabled'].includes(itemStatus)) return false;
        if (filters.Status === 'expired' && itemStatus !== 'expired') return false;
      }
      return true;
    });
  }, [vouchers, filters]);

  const filteredCampaigns = useMemo(() => {
    const keyword = campaignFilters.SearchTerm.trim().toLowerCase();
    return campaigns.filter((item) => {
      if (keyword) {
        const searchableText = `${item.name || ''} ${item.description || ''}`.toLowerCase();
        if (!searchableText.includes(keyword)) return false;
      }

      if (campaignFilters.Status && campaignFilters.Status !== 'all') {
        const itemStatus = getCampaignStatusKey(item.status, item.expiresAt);
        if (campaignFilters.Status !== itemStatus) return false;
      }

      return true;
    });
  }, [campaignFilters, campaigns]);

  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      width: 220,
      render: (_, record) => {
        const status = getVoucherStatusKey(record.status, record.expiresAt);
        return (
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${status === 'active' ? 'bg-[#FFF0E6] text-[#FF8228]' : 'bg-[#F5F5F5] text-[#818A91]'}`}>
              <SymbolIcon className="!text-[20px]">local_offer</SymbolIcon>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#1b1c1c] tracking-wide">{record.code}</span>
                <Button 
                  type="text" 
                  size="small"
                  className="!p-0 !h-5 !w-5 !inline-flex !items-center !justify-center text-[#818A91] hover:text-[#FF8228] [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[14px] [&_.material-symbols-outlined]:!leading-none"
                  icon={<SymbolIcon className="!text-[14px]">content_copy</SymbolIcon>}
                  onClick={() => {
                    navigator.clipboard.writeText(record.code);
                    message.success(`Đã sao chép mã: ${record.code}`);
                  }}
                />
              </div>
              {record.description && <span className="block max-w-[200px] truncate text-xs text-[#818A91] mt-0.5">{record.description}</span>}
              {record.campaignId && (
                <Tag className="!m-0 !mt-1 !inline-flex !w-fit !items-center !gap-1 !rounded-full !border-0 !bg-[#FFF0E6] !px-2 !py-0.5 !text-[10px] !font-bold !text-[#FF8228]">
                  <SymbolIcon className="!text-[12px]">campaign</SymbolIcon>
                  {campaigns.find((campaign) => campaign.id === record.campaignId)?.name || 'Chiến dịch'}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Áp dụng cho',
      width: 200,
      render: (_, record) => {
        const cat = categories.find(c => c.id === record.categoryId);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4A4A4A]">
              {cat ? cat.name : 'Tất cả dịch vụ'}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {record.city && (
                <Tag className="!m-0 !inline-flex !items-center !gap-0.5 !rounded-full !border-0 !bg-[#E8F8FE] !px-2 !py-0.5 !text-[10px] !font-bold !text-[#00A8E8]">
                  <SymbolIcon className="!text-[12px]">location_on</SymbolIcon>
                  {record.city}
                </Tag>
              )}
              {record.firstOrderOnly && (
                <Tag className="!m-0 !inline-flex !items-center !gap-0.5 !rounded-full !border-0 !bg-[#EAF9F2] !px-2 !py-0.5 !text-[10px] !font-bold !text-[#39B54A]">
                  <SymbolIcon className="!text-[12px]">stars</SymbolIcon>
                  Đơn đầu
                </Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Giá trị giảm',
      width: 140,
      render: (_, record) => {
        const type = getVoucherTypeKey(record.type);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#FF8228]">{formatVoucherValue(record)}</span>
            <span className="text-[10px] text-[#818A91] mt-0.5">
              {type === VOUCHER_TYPE.FIXED ? 'Số tiền cố định' : 'Khấu trừ phần trăm'}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Điều kiện đơn',
      width: 160,
      render: (_, record) => {
        const hasMin = record.minOrderValue > 0;
        const hasMax = record.maxDiscount > 0;
        return (
          <div className="text-xs text-[#555555] space-y-0.5">
            <div>Đơn tối thiểu: <span className="font-bold text-[#1b1c1c]">{hasMin ? formatCurrency(record.minOrderValue) : '0đ'}</span></div>
            {getVoucherTypeKey(record.type) === VOUCHER_TYPE.PERCENT && (
              <div>Tối đa: <span className="font-bold text-[#1b1c1c]">{hasMax ? formatCurrency(record.maxDiscount) : 'Không giới hạn'}</span></div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Lượt sử dụng',
      width: 180,
      render: (_, record) => {
        const used = record.usedCount || record.usageCount || 0;
        const max = record.maxUsage || 0;
        const hasMax = max > 0;
        const percent = hasMax ? Math.round((used / max) * 100) : 0;
        
        return (
          <div className="w-[140px]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#555555] mb-1">
              <span>{used} / {hasMax ? max : '∞'}</span>
              {hasMax && <span>{percent}%</span>}
            </div>
            {hasMax ? (
              <Progress 
                percent={percent} 
                showInfo={false} 
                strokeColor={percent > 90 ? '#EA4335' : percent > 70 ? '#FF8228' : '#39B54A'} 
                trailColor="#F5F5F5"
                size={[140, 6]}
              />
            ) : (
              <div className="h-1.5 w-full bg-[#E8F8FE] rounded-full" />
            )}
          </div>
        );
      }
    },
    {
      title: 'Hạn dùng',
      width: 140,
      render: (_, record) => {
        const expires = record.expiresAt;
        const isNearExpiration = expires && dayjs(expires).isBefore(dayjs().add(2, 'day')) && dayjs(expires).isAfter(dayjs());
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#4A4A4A]">
              {expires ? dayjs(expires).format('DD/MM/YYYY') : 'Không giới hạn'}
            </span>
            <span className={`text-[10px] mt-0.5 ${isNearExpiration ? 'text-[#EA4335] font-bold' : 'text-[#818A91]'}`}>
              {expires ? dayjs(expires).format('HH:mm') : ''}
              {isNearExpiration ? ' (Sắp hết hạn)' : ''}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      width: 120,
      render: (_, record) => {
        const statusKey = getVoucherStatusKey(record.status, record.expiresAt);
        const status = statusMap[statusKey] || statusMap.active;
        
        return (
          <Tag 
            className={`!m-0 !rounded-full !px-2.5 !py-0.5 !text-xs !font-extrabold !border-0 ${
              statusKey === 'active' 
                ? '!bg-[#EAF9F2] !text-[#39B54A]' 
                : statusKey === 'expired' 
                  ? '!bg-[#FFF5F5] !text-[#EA4335]' 
                  : '!bg-[#EEEEEE] !text-[#818A91]'
            }`}
          >
            {status.label}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      align: 'right',
      width: 160,
      render: (_, record) => {
        const statusKey = getVoucherStatusKey(record.status, record.expiresAt);
        return (
          <div className="flex justify-end items-center gap-1">
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                shape="circle"
                className="!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 text-[#555555] hover:!text-[#FF8228] hover:!bg-[#FFF0E6] [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[18px] [&_.material-symbols-outlined]:!leading-none"
                icon={<SymbolIcon>edit</SymbolIcon>}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
            <Tooltip title={statusKey === 'expired' ? 'Voucher đã hết hạn' : (statusKey === 'active' ? 'Tạm dừng' : 'Kích hoạt')}>
              <Button 
                type="text" 
                shape="circle"
                disabled={statusKey === 'expired'}
                className={`!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 ${
                  statusKey === 'expired' 
                    ? 'text-[#CCCCCC] cursor-not-allowed' 
                    : (statusKey === 'active' 
                        ? 'text-[#818A91] hover:!text-[#FF8228] hover:!bg-[#FFF0E6]' 
                        : 'text-[#39B54A] hover:!text-[#2C9901] hover:!bg-[#EAF9F2]')
                } [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[18px] [&_.material-symbols-outlined]:!leading-none`}
                icon={<SymbolIcon>{statusKey === 'active' ? 'pause_circle' : 'play_circle'}</SymbolIcon>}
                onClick={() => handleStatus(record, statusKey === 'active' ? VOUCHER_STATUS.DISABLED : VOUCHER_STATUS.ACTIVE)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                shape="circle"
                danger
                className="!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 hover:!bg-[#FFF5F5] [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[18px] [&_.material-symbols-outlined]:!leading-none"
                icon={<SymbolIcon>delete</SymbolIcon>}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        );
      }
    }
  ];

  const campaignColumns = [
    {
      title: 'Chiến dịch',
      dataIndex: 'name',
      width: 260,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E6] text-[#FF8228]">
            <SymbolIcon className="!text-[20px]">campaign</SymbolIcon>
          </span>
          <div className="min-w-0">
            <span className="block text-sm font-extrabold text-[#1b1c1c]">{record.name}</span>
            {record.description && <span className="block max-w-[260px] truncate text-xs text-[#818A91]">{record.description}</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budgetLimit',
      width: 150,
      render: (value) => <span className="text-sm font-black text-[#FF8228]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Tự động',
      dataIndex: 'autoTriggerEvent',
      width: 160,
      render: (value) => (
        <Tag className="!m-0 !rounded-full !border-0 !bg-[#E8F8FE] !px-2.5 !py-0.5 !text-xs !font-bold !text-[#00A8E8]">
          {getTriggerLabel(value)}
        </Tag>
      ),
    },
    {
      title: 'Hiệu lực',
      width: 190,
      render: (_, record) => (
        <div className="text-xs font-semibold text-[#4A4A4A]">
          <div>{record.startsAt ? dayjs(record.startsAt).format('DD/MM/YYYY HH:mm') : 'Chưa có ngày bắt đầu'}</div>
          <div className="mt-0.5 text-[#818A91]">{record.expiresAt ? dayjs(record.expiresAt).format('DD/MM/YYYY HH:mm') : 'Không giới hạn'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      width: 120,
      render: (_, record) => {
        const statusKey = getCampaignStatusKey(record.status, record.expiresAt);
        const status = campaignStatusMap[statusKey] || campaignStatusMap.active;
        return <Tag className={`admin-promo-status ${status.className}`}>{status.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      align: 'right',
      width: 160,
      render: (_, record) => {
        const statusKey = getCampaignStatusKey(record.status, record.expiresAt);
        const isEnded = statusKey === 'ended';
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                className="!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 text-[#555555] hover:!bg-[#FFF0E6] hover:!text-[#FF8228]"
                icon={<SymbolIcon>edit</SymbolIcon>}
                onClick={() => openEditCampaignModal(record)}
              />
            </Tooltip>
            <Tooltip title={isEnded ? 'Chiến dịch đã kết thúc' : statusKey === 'active' ? 'Tạm dừng' : 'Kích hoạt'}>
              <Button
                type="text"
                shape="circle"
                className="!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 text-[#818A91] hover:!bg-[#FFF0E6] hover:!text-[#FF8228]"
                icon={<SymbolIcon>{statusKey === 'active' ? 'pause_circle' : 'play_circle'}</SymbolIcon>}
                disabled={isEnded}
                onClick={() => handleCampaignStatus(record, statusKey === 'active' ? VOUCHER_CAMPAIGN_STATUS.SUSPENDED : VOUCHER_CAMPAIGN_STATUS.ACTIVE)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                shape="circle"
                danger
                className="!inline-flex !h-8 !w-8 !items-center !justify-center !p-0 hover:!bg-[#FFF5F5]"
                icon={<SymbolIcon>delete</SymbolIcon>}
                onClick={() => handleCampaignDelete(record)}
              />
            </Tooltip>
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
        <Button 
          type="primary" 
          className="admin-primary-pill-button" 
          icon={<SymbolIcon>add_circle</SymbolIcon>} 
          onClick={openCreateModal}
        >
          Tạo voucher mới
        </Button>
      </section>

      {/* KPI statistics cards */}
      <section className="admin-promo-summary-grid grid grid-cols-1 gap-5 md:grid-cols-3">
        {summaryCards.map((item) => (
          <div 
            key={item.label} 
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm ${item.bgClass}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#777777]">{item.label}</p>
                <h3 className={`m-0 mt-2 text-3xl font-black ${item.valueColor}`}>{item.value}</h3>
              </div>
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${item.iconClass}`}>
                <SymbolIcon className="!text-[24px]">{item.icon}</SymbolIcon>
              </span>
            </div>
            <div className="mt-4 text-xs font-medium text-[#777777] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#818A91] opacity-50" />
              {item.meta}
            </div>
          </div>
        ))}
      </section>

      <Card className="admin-panel admin-promo-table-panel">
        {/* Table Title and Refresh */}
        <div className="admin-promo-panel-head">
          <div>
            <h3 className="m-0 text-lg font-black text-[#1b1c1c]">Danh Sách Voucher</h3>
            <p className="m-0 mt-1 text-xs text-[#818A91]">Tìm kiếm, theo dõi và quản lý hiệu lực của các mã giảm giá.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="admin-promo-refresh-button" 
              icon={<SymbolIcon className="!text-[16px]">refresh</SymbolIcon>}
              onClick={() => loadVouchers(meta.pageNumber, meta.pageSize)}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="admin-promo-toolbar space-y-4">
          {/* Row 1: Search Input */}
          <div>
            <Input.Search
              allowClear
              className="admin-tech-search"
              placeholder="Tìm kiếm mã hoặc mô tả..."
              onSearch={(value) => {
                const newFilters = { ...filters, SearchTerm: value };
                setFilters(newFilters);
                loadVouchers(1, meta.pageSize, newFilters);
              }}
            />
          </div>
          
          {/* Row 2: Dropdowns on left, Status on right */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                allowClear
                placeholder="Dịch vụ áp dụng"
                className="admin-tech-filter-select !w-[200px]"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(value) => {
                  setFilters(f => ({ ...f, CategoryId: value }));
                }}
              />
              <Select
                allowClear
                placeholder="Loại giảm giá"
                className="admin-tech-filter-select !w-[160px]"
                options={[
                  { value: VOUCHER_TYPE.PERCENT, label: 'Phần trăm (%)' },
                  { value: VOUCHER_TYPE.FIXED, label: 'Số tiền cố định' },
                ]}
                onChange={(value) => {
                  setFilters(f => ({ ...f, Type: value }));
                }}
              />
            </div>
            
            <div>
              <Radio.Group 
                value={filters.Status} 
                onChange={(e) => {
                  setFilters(f => ({ ...f, Status: e.target.value }));
                }}
                optionType="button"
                buttonStyle="solid"
                className="custom-radio-group [&_.ant-radio-button-wrapper-checked]:!bg-[#FF8228] [&_.ant-radio-button-wrapper-checked]:!border-[#FF8228] [&_.ant-radio-button-wrapper]:!text-xs [&_.ant-radio-button-wrapper]:!font-bold [&_.ant-radio-button-wrapper]:!h-10 [&_.ant-radio-button-wrapper]:!leading-[38px]"
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                <Radio.Button value="active">Đang chạy</Radio.Button>
                <Radio.Button value="inactive">Tạm tắt</Radio.Button>
                <Radio.Button value="expired">Hết hạn</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>
        {/* Vouchers Table */}
        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={filteredVouchers}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={false}
          rowClassName={(record) => (getVoucherStatusKey(record.status, record.expiresAt) === 'expired' ? 'admin-promo-row-expired' : '')}
          scroll={{ x: 1040 }}
        />

        <div className="admin-promo-table-footer">
          <p className="m-0 text-sm text-[#555555]">Hiển thị {filteredVouchers.length} / {meta.totalCount} voucher</p>
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

      <Card className="admin-panel admin-promo-table-panel">
        <div className="admin-promo-panel-head">
          <div>
            <h3 className="m-0 text-lg font-black text-[#1b1c1c]">Chiến dịch voucher</h3>
            <p className="m-0 mt-1 text-xs text-[#818A91]">Quản lý ngân sách, thời gian chạy và trigger tự động cho từng chiến dịch.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="admin-promo-refresh-button"
              icon={<SymbolIcon className="!text-[16px]">refresh</SymbolIcon>}
              onClick={() => loadCampaigns(campaignMeta.pageNumber, campaignMeta.pageSize)}
              loading={campaignLoading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              className="admin-primary-pill-button !h-9 !px-4 !text-xs"
              icon={<SymbolIcon>add_circle</SymbolIcon>}
              onClick={openCreateCampaignModal}
            >
              Tạo chiến dịch
            </Button>
          </div>
        </div>

        <div className="admin-promo-toolbar admin-promo-toolbar-row">
          <div className="admin-promo-toolbar-search">
            <Input.Search
              allowClear
              className="admin-tech-search"
              placeholder="Tìm kiếm chiến dịch..."
              onSearch={(value) => setCampaignFilters((current) => ({ ...current, SearchTerm: value }))}
            />
          </div>
          <div className="admin-promo-toolbar-filters">
            <Radio.Group
              value={campaignFilters.Status}
              onChange={(e) => setCampaignFilters((current) => ({ ...current, Status: e.target.value }))}
              optionType="button"
              buttonStyle="solid"
              className="custom-radio-group [&_.ant-radio-button-wrapper-checked]:!bg-[#FF8228] [&_.ant-radio-button-wrapper-checked]:!border-[#FF8228] [&_.ant-radio-button-wrapper]:!text-xs [&_.ant-radio-button-wrapper]:!font-bold [&_.ant-radio-button-wrapper]:!h-10 [&_.ant-radio-button-wrapper]:!leading-[38px]"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>
              <Radio.Button value="draft">Nháp</Radio.Button>
              <Radio.Button value="active">Đang chạy</Radio.Button>
              <Radio.Button value="suspended">Tạm dừng</Radio.Button>
              <Radio.Button value="ended">Kết thúc</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <Table
          className="admin-tech-table"
          columns={campaignColumns}
          dataSource={filteredCampaigns}
          rowKey={(record) => record.id}
          loading={campaignLoading}
          pagination={false}
          rowClassName={(record) => (getCampaignStatusKey(record.status, record.expiresAt) === 'ended' ? 'admin-promo-row-expired' : '')}
          scroll={{ x: 980 }}
        />

        <div className="admin-promo-table-footer">
          <p className="m-0 text-sm text-[#555555]">Hiển thị {filteredCampaigns.length} / {campaignMeta.totalCount} chiến dịch</p>
          <Pagination
            className="admin-tech-pagination"
            current={campaignMeta.pageNumber}
            pageSize={campaignMeta.pageSize}
            total={campaignMeta.totalCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={loadCampaigns}
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
        className="admin-promo-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          
          <div className="mb-4 border-b border-[#F0F2F5] pb-2">
            <h4 className="m-0 text-sm font-bold text-[#FF8228] flex items-center gap-1.5">
              <SymbolIcon className="!text-[18px]">info</SymbolIcon>
              Thông tin cơ bản
            </h4>
          </div>
          
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item 
              label="Mã voucher" 
              name="code" 
              rules={[{ required: !editingVoucher, message: 'Nhập mã voucher' }]}
              extra="Ví dụ: FIXY50, MAUBAC (viết liền không dấu)"
            >
              <Input disabled={Boolean(editingVoucher)} placeholder="VD: FIXY20" className="!h-10" />
            </Form.Item>
            
            <Form.Item label="Dịch vụ áp dụng" name="categoryId">
              <Select
                allowClear
                showSearch
                placeholder="Tất cả dịch vụ"
                optionFilterProp="label"
                className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                options={categories.map((category) => ({ value: category.id, label: category.name }))}
              />
            </Form.Item>

            <Form.Item label="Chiến dịch" name="campaignId" extra="Có thể bỏ trống nếu voucher không thuộc chiến dịch nào">
              <Select
                allowClear
                showSearch
                placeholder="Chọn chiến dịch"
                optionFilterProp="label"
                className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                options={campaignOptions}
              />
            </Form.Item>
          </div>

          <Form.Item label="Mô tả chương trình" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết chương trình khuyến mãi cho khách hàng..." />
          </Form.Item>

          <div className="mb-4 mt-6 border-b border-[#F0F2F5] pb-2">
            <h4 className="m-0 text-sm font-bold text-[#FF8228] flex items-center gap-1.5">
              <SymbolIcon className="!text-[18px]">payments</SymbolIcon>
              Trị giá & Điều kiện
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item label="Loại giảm giá" name="type" rules={[{ required: true }]}>
              <Select 
                className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                options={[
                  { value: VOUCHER_TYPE.PERCENT, label: 'Giảm theo phần trăm (%)' },
                  { value: VOUCHER_TYPE.FIXED, label: 'Số tiền cố định (đ)' },
                ]} 
              />
            </Form.Item>
            
            <Form.Item 
              label="Giá trị giảm" 
              name="value" 
              rules={[{ required: true, message: 'Nhập giá trị giảm' }]}
            >
              <InputNumber 
                className="!w-full !h-10 [&_.ant-input-number-input]:!h-10" 
                min={1} 
                placeholder="Nhập số tiền hoặc %"
              />
            </Form.Item>

            <Form.Item label="Đơn tối thiểu" name="minOrderValue">
              <Space.Compact className="!w-full">
                <InputNumber 
                  className="!h-10 !w-full [&_.ant-input-number-input]:!h-10" 
                  min={0} 
                  placeholder="Đơn hàng tối thiểu để áp dụng"
                />
                <span className="flex items-center justify-center px-3 bg-[#f5f5f5] border border-l-0 border-[#d9d9d9] rounded-r-lg text-sm text-[#555] h-10 select-none">
                  đ
                </span>
              </Space.Compact>
            </Form.Item>
            
            <Form.Item label="Mức giảm tối đa" name="maxDiscount" extra="Chỉ áp dụng khi giảm theo phần trăm">
              <Space.Compact className="!w-full">
                <InputNumber 
                  className="!h-10 !w-full [&_.ant-input-number-input]:!h-10" 
                  min={0} 
                  placeholder="Giảm tối đa (đ)"
                />
                <span className="flex items-center justify-center px-3 bg-[#f5f5f5] border border-l-0 border-[#d9d9d9] rounded-r-lg text-sm text-[#555] h-10 select-none">
                  đ
                </span>
              </Space.Compact>
            </Form.Item>
          </div>

          <div className="mb-4 mt-6 border-b border-[#F0F2F5] pb-2">
            <h4 className="m-0 text-sm font-bold text-[#FF8228] flex items-center gap-1.5">
              <SymbolIcon className="!text-[18px]">settings</SymbolIcon>
              Giới hạn & Hiệu lực
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item label="Thành phố áp dụng" name="city" extra="Để trống nếu áp dụng toàn quốc">
              <Select
                allowClear
                showSearch
                placeholder="Chọn thành phố"
                optionFilterProp="label"
                className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                options={provinces.map((prov) => ({ value: prov.name, label: prov.name }))}
              />
            </Form.Item>

            <Form.Item label="Đối tượng khách hàng" name="firstOrderOnly" valuePropName="checked" className="!mb-0">
              <div className="flex items-center gap-2 mt-2">
                <Switch className="custom-switch-orange" />
                <span className="text-sm font-semibold text-[#4A4A4A]">Chỉ áp dụng cho đơn đầu tiên</span>
              </div>
            </Form.Item>

            <Form.Item label="Lượt dùng tối đa" name="maxUsage" extra="Tổng số lần mã có thể được sử dụng">
              <InputNumber className="!w-full !h-10 [&_.ant-input-number-input]:!h-10" min={0} placeholder="Nhập số lượt hoặc 0 cho không giới hạn" />
            </Form.Item>
            
            <Form.Item label="Lượt dùng / khách hàng" name="maxUsagePerUser" extra="Số lần tối đa mỗi khách hàng được dùng">
              <InputNumber className="!w-full !h-10 [&_.ant-input-number-input]:!h-10" min={1} placeholder="VD: 1" />
            </Form.Item>

            <Form.Item label="Thời gian hiệu lực" name="dateRange" rules={[{ required: true, message: 'Chọn thời gian hiệu lực' }]} className="md:col-span-2">
              <DatePicker.RangePicker 
                className="!w-full !h-10" 
                showTime 
                format="DD/MM/YYYY HH:mm" 
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Form.Item>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-[#F0F2F5] pt-4">
            <Button className="!h-10 !px-6 !font-bold" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="!h-10 !px-6 !font-bold !bg-[#FF8228] hover:!bg-[#E66F18]">
              {editingVoucher ? 'Cập nhật voucher' : 'Phát hành voucher'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingCampaign ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch voucher'}
        open={campaignModalOpen}
        onCancel={() => setCampaignModalOpen(false)}
        footer={null}
        width={680}
        destroyOnHidden
        className="admin-promo-modal"
      >
        <Form form={campaignForm} layout="vertical" onFinish={handleCampaignSubmit} requiredMark={false}>
          <div className="mb-4 border-b border-[#F0F2F5] pb-2">
            <h4 className="m-0 flex items-center gap-1.5 text-sm font-bold text-[#FF8228]">
              <SymbolIcon className="!text-[18px]">campaign</SymbolIcon>
              Thông tin chiến dịch
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item label="Tên chiến dịch" name="name" rules={[{ required: true, message: 'Nhập tên chiến dịch' }]} className="md:col-span-2">
              <Input className="!h-10" placeholder="VD: Hè tiết kiệm 2026" />
            </Form.Item>

            <Form.Item label="Ngân sách tối đa" name="budgetLimit">
              <InputNumber className="!h-10 !w-full [&_.ant-input-number-input]:!h-10" min={0} addonAfter="đ" placeholder="0 nếu không giới hạn" />
            </Form.Item>

            <Form.Item label="Trigger tự động" name="autoTriggerEvent" rules={[{ required: true }]}>
              <Select
                className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                options={campaignTriggerOptions}
              />
            </Form.Item>

            {!editingCampaign && (
              <Form.Item label="Trạng thái ban đầu" name="status" rules={[{ required: true }]}>
                <Select
                  className="!h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center"
                  options={[
                    { value: VOUCHER_CAMPAIGN_STATUS.DRAFT, label: 'Nháp' },
                    { value: VOUCHER_CAMPAIGN_STATUS.ACTIVE, label: 'Đang chạy' },
                    { value: VOUCHER_CAMPAIGN_STATUS.SUSPENDED, label: 'Tạm dừng' },
                  ]}
                />
              </Form.Item>
            )}

            <Form.Item label="Thời gian chạy" name="dateRange" rules={[{ required: true, message: 'Chọn thời gian chạy' }]} className={editingCampaign ? 'md:col-span-2' : ''}>
              <DatePicker.RangePicker
                className="!h-10 !w-full"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Form.Item>
          </div>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả mục tiêu hoặc điều kiện của chiến dịch..." />
          </Form.Item>

          <div className="mt-8 flex justify-end gap-3 border-t border-[#F0F2F5] pt-4">
            <Button className="!h-10 !px-6 !font-bold" onClick={() => setCampaignModalOpen(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={campaignSubmitting} className="!h-10 !px-6 !font-bold !bg-[#FF8228] hover:!bg-[#E66F18]">
              {editingCampaign ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminShell>
  );
}
