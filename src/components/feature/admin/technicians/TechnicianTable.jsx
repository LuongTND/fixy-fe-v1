'use client';

import { useCallback, useEffect, useState } from 'react';
import { Avatar, Button, Card, Image as AntImage, Input, Modal, Pagination, Select, Table, Tag, App } from 'antd';
import { SymbolIcon } from '@/app/(main)/dashboard/_components/AdminShell';
import { useWorkerProfiles } from '@/hooks/useWorkerProfiles';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { WORKER_STATUS, WORKER_STATUS_TEXT, WORKER_STATUS_OPTIONS, WORKER_STATUS_UI } from '@/constants/enums';

const mapStatus = (statusValue) => {
  if (typeof statusValue === 'string') {
    const normalized = statusValue.toLowerCase();
    if (normalized.includes('approve') || normalized.includes('active')) return WORKER_STATUS_TEXT[WORKER_STATUS.APPROVED];
    if (normalized.includes('reject')) return WORKER_STATUS_TEXT[WORKER_STATUS.REJECTED];
    if (normalized.includes('suspend') || normalized.includes('lock') || normalized.includes('block')) return WORKER_STATUS_TEXT[WORKER_STATUS.SUSPENDED];
    return WORKER_STATUS_TEXT[WORKER_STATUS.PENDING];
  }

  return WORKER_STATUS_TEXT[statusValue] || WORKER_STATUS_TEXT[WORKER_STATUS.PENDING];
};

const extractProfilesPayload = (payload) => {
  if (Array.isArray(payload)) {
    return { items: payload, totalCount: payload.length };
  }

  const items = payload?.items || payload?.data || payload?.results || payload?.records || [];
  const totalCount = payload?.totalCount || payload?.totalItems || payload?.totalRecords || payload?.count || items.length;

  return {
    items: Array.isArray(items) ? items : [],
    totalCount,
  };
};

const getTechnicianName = (record) => (
  record.user?.fullName ||
  record.user?.name ||
  record.fullName ||
  record.name ||
  record.target ||
  'Kỹ thuật viên'
);

const getTechnicianAvatar = (record) => (
  record.user?.avatarUrl ||
  record.user?.avatar ||
  record.avatarUrl ||
  record.avatar ||
  record.imageUrl
);

const getTechnicianOccupations = (record) => {
  const services = record.workerServices || record.workerService || record.services || [];
  if (!services || !services.length) {
    const backupName = record.occupation || record.bio || 'Chưa cập nhật';
    return [{ name: backupName, isPrimary: false }];
  }

  const sortedServices = [...services].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return sortedServices.map((service) => {
    const name =
      service?.category?.name ||
      service?.serviceCategory?.name ||
      service?.categoryName;
    return {
      name: name || 'Dịch vụ',
      isPrimary: Boolean(service.isPrimary),
    };
  });
};

const normalizeCategory = (category) => ({
  id: category.id ?? category.Id,
  parentId: category.parentId ?? category.ParentId ?? null,
  name: category.name ?? category.Name ?? 'Danh mục',
});

const mapStatusFilter = (statusString) => {
  switch (statusString) {
    case 'pending': return 0;
    case 'approved': return 1;
    case 'rejected': return 2;
    case 'suspended': return 3;
    default: return null;
  }
};

const getProfileImages = (profile, ...keys) => keys.flatMap((key) => {
  const value = profile?.[key];
  return Array.isArray(value) ? value : [];
});

const getProfileServices = (profile) => profile?.workerServices || profile?.workerService || profile?.services || [];

const getImageUrl = (image) => image?.fileUrl || image?.url || image?.preview;

const getTechnicianRating = (record, value) => {
  const rating = value ?? record.ratingAvg ?? record.averageRating ?? record.rating;
  const numericRating = Number(rating);

  if (!Number.isFinite(numericRating)) {
    return 'N/A';
  }

  return numericRating.toFixed(1);
};

const getAdminProfileDetailId = (record) => (
  record?.userId ||
  record?.user?.id ||
  record?.user?.userId ||
  record?.accountId ||
  record?.id
);

const formatCurrency = (value) => {
  if (!Number.isFinite(Number(value))) return 'Chưa cập nhật';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
};

export function TechnicianTable({ onProfilesLoaded }) {
  const { message } = App.useApp();
  const { getProfiles, getAdminProfileById, approveProfile, rejectProfile, loading } = useWorkerProfiles();
  const { parentCategories } = useServiceCategories({ parentsOnly: true });
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetailLoading, setProfileDetailLoading] = useState(false);
  const [filters, setFilters] = useState({
    PageNumber: 1,
    PageSize: 10,
    Status: 'all',
    CategoryId: 'all',
    SearchTerm: '',
  });

  const categoryOptions = [
    { value: 'all', label: 'Tất cả ngành nghề' },
    ...parentCategories.map((category) => ({ value: category.id, label: category.name })),
  ];

  const fetchProfiles = useCallback(async () => {
    try {
      const statusFilter = mapStatusFilter(filters.Status);
      const params = {
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize,
        SearchTerm: filters.SearchTerm || undefined,
      };
      if (statusFilter !== null) {
        params.Status = statusFilter;
      }
      if (filters.CategoryId !== 'all') {
        params.CategoryId = filters.CategoryId;
      }

      const res = await getProfiles(params);
      const payload = extractProfilesPayload(res);
      setData(payload.items);
      setTotal(payload.totalCount);
      onProfilesLoaded?.({ items: payload.items, totalCount: payload.totalCount });
    } catch (error) {
      console.error('Failed to fetch profiles', error);
    }
  }, [filters, getProfiles, onProfilesLoaded]);

  useEffect(() => {
    queueMicrotask(fetchProfiles);
  }, [fetchProfiles]);

  const handleApprove = async (id) => {
    try {
      await approveProfile(id);
      message.success('Đã duyệt hồ sơ thợ');
      fetchProfiles();
    } catch {
      // Error handled by hook.
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;

    try {
      await rejectProfile(rejectingId, rejectReason || 'Không đạt yêu cầu');
      message.success('Đã từ chối hồ sơ thợ');
      setRejectingId(null);
      setRejectReason('');
      fetchProfiles();
    } catch {
      // Error handled by hook.
    }
  };

  const handleOpenProfile = async (record) => {
    setSelectedProfile(record);
    setProfileModalOpen(true);

    try {
      setProfileDetailLoading(true);
      const detailId = getAdminProfileDetailId(record);
      const detail = detailId ? await getAdminProfileById(detailId) : null;
      setSelectedProfile(detail || record);
    } catch {
      message.warning('Không thể tải chi tiết hồ sơ, đang hiển thị dữ liệu hiện có.');
    } finally {
      setProfileDetailLoading(false);
    }
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        const status = mapStatus(record.status);
        const name = getTechnicianName(record);
        const avatar = getTechnicianAvatar(record);
        return (
          <div className="flex items-center gap-3">
            <Avatar size={40} src={avatar} className={status === 'suspended' ? 'grayscale' : ''} />
            <div>
              <p className="m-0 text-sm font-bold text-[#383838]">{name}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'occupation',
      key: 'occupation',
      render: (_, record) => {
        const occupations = getTechnicianOccupations(record);
        return (
          <div className="flex flex-wrap gap-1.5">
            {occupations.map((occ, idx) => (
              <Tag
                key={idx}
                className={`!m-0 !rounded-full !px-2.5 !py-0.5 !text-xs !font-semibold !border-0 ${
                  occ.isPrimary
                    ? '!bg-[#FF8228]/10 !text-[#FF8228]'
                    : '!bg-[#F0F2F5] !text-[#555555]'
                }`}
              >
                {occ.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (value, record) => {
        const rating = getTechnicianRating(record, value);
        const reviews = record.reviewCount || record.reviews || 0;
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#383838]">
            <SymbolIcon className={`!text-[18px] ${rating === 'N/A' ? '!text-[#9A9A9A]' : '!text-[#FF8228]'}`}>star</SymbolIcon>
            {rating}
            {reviews > 0 && <span className="text-xs font-normal text-[#555555]">({reviews})</span>}
          </span>
        );
      },
    },
    {
      title: 'Huy hiệu',
      dataIndex: 'badge',
      key: 'badge',
      render: (value) => (
        <Tag className="!m-0 !inline-flex !items-center !gap-1 !rounded-full !border-[#DDDDDD] !px-3 !py-1 !text-xs !font-semibold !text-[#4A4A4A]">
          <SymbolIcon className="!text-[14px] !text-[#FF8228]">workspace_premium</SymbolIcon>
          {value || 'Standard'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        const status = mapStatus(value);
        const labelObj = WORKER_STATUS_UI[status] || { label: 'Không xác định', className: '' };
        return (
          <Tag className={`admin-tech-status ${labelObj.className}`}>
            {labelObj.label}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 304,
      render: (_, record) => {
        const status = mapStatus(record.status);
        return (
          <div className="admin-tech-actions">
            <Button type="link" className="admin-tech-profile-action" onClick={() => handleOpenProfile(record)}>Hồ sơ</Button>
            <span className="admin-tech-action-slot">
              {status === 'pending' && (
                <span className="admin-tech-pending-actions">
                  <Button className="admin-tech-row-action admin-tech-approve-action" onClick={() => handleApprove(record.id)}>Duyệt</Button>
                  <Button className="admin-tech-row-action admin-tech-reject-action" danger onClick={() => setRejectingId(record.id)}>Từ chối</Button>
                </span>
              )}
              {status === 'suspended' && <Button type="primary" className="admin-tech-row-action admin-tech-unlock-action">Mở khóa</Button>}
              {status === 'approved' && (
                <Button className="admin-tech-icon-action" icon={<SymbolIcon className="!text-[18px]">lock</SymbolIcon>} />
              )}
            </span>
            <Button className="admin-tech-icon-action" icon={<SymbolIcon className="!text-[18px]">more_vert</SymbolIcon>} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="admin-panel !mt-6">
      <div className="admin-tech-filter-bar">
        <div className="admin-tech-filter-controls">
          <Select
            className="admin-tech-filter-select"
            value={filters.Status}
            onChange={(value) => setFilters((f) => ({ ...f, Status: value, PageNumber: 1 }))}
            options={WORKER_STATUS_OPTIONS}
          />
          <Select
            className="admin-tech-filter-select admin-tech-filter-select-wide"
            value={filters.CategoryId}
            options={categoryOptions}
            onChange={(value) => setFilters((f) => ({ ...f, CategoryId: value, PageNumber: 1 }))}
          />
          <Input.Search
            allowClear
            className="admin-tech-search"
            placeholder="Tìm tên, email hoặc số điện thoại"
            onSearch={(value) => setFilters((f) => ({ ...f, SearchTerm: value, PageNumber: 1 }))}
          />
        </div>
      </div>

      <Table
        className="admin-tech-table"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1040 }}
        rowClassName={(record) => (mapStatus(record.status) === 'suspended' ? 'admin-tech-row-locked' : '')}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="m-0 text-sm text-[#555555]">Cập nhật lần cuối: Hôm nay lúc 09:45</p>
        <Pagination
          className="admin-tech-pagination"
          current={filters.PageNumber}
          pageSize={filters.PageSize}
          total={total}
          onChange={(page, pageSize) => setFilters((f) => ({ ...f, PageNumber: page, PageSize: pageSize }))}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      <Modal
        title="Từ chối hồ sơ kỹ thuật viên"
        open={Boolean(rejectingId)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onCancel={() => {
          setRejectingId(null);
          setRejectReason('');
        }}
        onOk={handleReject}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="Nhập lý do từ chối hồ sơ..."
        />
      </Modal>

      <Modal
        title="Hồ sơ kỹ thuật viên"
        open={profileModalOpen}
        footer={null}
        width={860}
        className="[&_.ant-modal]:top-8"
        destroyOnHidden
        onCancel={() => {
          setProfileModalOpen(false);
          setSelectedProfile(null);
        }}
      >
        <WorkerProfileModalContent profile={selectedProfile} loading={profileDetailLoading} />
      </Modal>
    </Card>
  );
}

function WorkerProfileModalContent({ profile, loading }) {
  if (!profile) {
    return <div className="py-10 text-center text-sm text-[#555555]">Chưa có dữ liệu hồ sơ.</div>;
  }

  const status = mapStatus(profile.status);
  const statusMeta = WORKER_STATUS_UI[status] || { label: 'Không xác định', className: '' };
  const services = getProfileServices(profile);
  const idImages = getProfileImages(profile, 'identificateImages', 'identificationImages', 'identificationUploads');
  const portfolioImages = getProfileImages(profile, 'portfolioImages', 'portfolioUploads', 'profolioImages', 'profolioUploads');
  const certificates = Array.isArray(profile.certificates) ? profile.certificates : [];

  return (
    <div className={loading ? 'pointer-events-none opacity-60' : ''}>
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-[#DDDDDD] bg-[#FBF9F8] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar size={56} src={getTechnicianAvatar(profile)} />
          <div>
            <h3 className="m-0 text-lg font-bold text-[#383838]">{getTechnicianName(profile)}</h3>
            <p className="m-0 mt-1 text-sm text-[#555555]">{profile.email || profile.phone || 'Chưa có liên hệ'}</p>
          </div>
        </div>
        <Tag className={`admin-tech-status ${statusMeta.className}`}>{statusMeta.label}</Tag>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-[#DDDDDD] bg-white p-4">
          <h4 className="m-0 mb-4 flex items-center gap-2 font-bold text-[#383838]">
            <SymbolIcon className="!text-[20px] !text-[#FF8228]">badge</SymbolIcon>
            Thông tin cá nhân
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProfileField label="Số điện thoại" value={profile.phone || 'Chưa cập nhật'} />
            <ProfileField label="Ngày sinh" value={formatDate(profile.dateOfBirth)} />
            <ProfileField label="CCCD" value={profile.citizenIdNumber || 'Chưa cập nhật'} />
            <ProfileField label="Ngày cấp" value={formatDate(profile.citizenIdIssueDate)} />
            <ProfileField className="sm:col-span-2" label="Nơi cấp" value={profile.citizenIdIssuePlace || 'Chưa cập nhật'} />
          </div>
        </section>

        <section className="rounded-xl border border-[#DDDDDD] bg-white p-4">
          <h4 className="m-0 mb-4 flex items-center gap-2 font-bold text-[#383838]">
            <SymbolIcon className="!text-[20px] !text-[#FF8228]">handyman</SymbolIcon>
            Năng lực làm việc
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProfileField label="Kinh nghiệm" value={`${profile.experienceYears || 0} năm`} />
            <ProfileField label="Bán kính" value={`${profile.maxDistanceKm || 0} km`} />
            <ProfileField className="sm:col-span-2" label="Giới thiệu" value={profile.bio || 'Chưa cập nhật'} />
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[#DDDDDD] bg-white p-4">
        <h4 className="m-0 mb-4 flex items-center gap-2 font-bold text-[#383838]">
          <SymbolIcon className="!text-[20px] !text-[#FF8228]">category</SymbolIcon>
          Dịch vụ đăng ký
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.id || service.categoryId} className="rounded-lg border border-[#DDDDDD] bg-[#FBF9F8] p-3">
              <p className="m-0 font-bold text-[#383838]">{service.categoryName || service.category?.name || service.serviceCategory?.name || 'Dịch vụ'}</p>
              <p className="m-0 mt-1 text-sm text-[#555555]">{formatCurrency(service.basePrice)}</p>
              {service.isPrimary && <span className="mt-2 inline-flex rounded-full bg-[#FF8228]/10 px-3 py-1 text-xs font-bold text-[#FF8228]">Dịch vụ chính</span>}
            </div>
          ))}
          {!services.length && <p className="m-0 text-sm text-[#555555]">Chưa có dịch vụ đăng ký.</p>}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <ImagePreviewGroup title="Ảnh CCCD" images={idImages} />
        <ImagePreviewGroup title="Portfolio" images={portfolioImages} />
        <CertificatePreviewGroup certificates={certificates} />
      </div>
    </div>
  );
}

function ProfileField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#777777]">{label}</p>
      <p className="m-0 mt-1 text-sm font-semibold text-[#383838]">{value}</p>
    </div>
  );
}

function ImagePreviewGroup({ title, images }) {
  const previewImages = images
    .map((image) => ({ ...image, previewUrl: getImageUrl(image) }))
    .filter((image) => image.previewUrl);

  return (
    <section className="rounded-xl border border-[#DDDDDD] bg-white p-4">
      <h4 className="m-0 mb-3 font-bold text-[#383838]">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {previewImages.slice(0, 4).map((image, index) => (
          <AntImage
            key={image.id || image.previewUrl || index}
            src={image.previewUrl}
            alt={`${title} ${index + 1}`}
            className="!aspect-square !w-full !cursor-zoom-in !rounded-lg !border !border-[#DDDDDD] !object-cover"
            rootClassName="block"
            preview={{ mask: 'Xem ảnh' }}
          />
        ))}
      </div>
      {!previewImages.length && <p className="m-0 text-sm text-[#555555]">Chưa có ảnh.</p>}
    </section>
  );
}

function CertificatePreviewGroup({ certificates }) {
  const images = certificates.flatMap((certificate) => certificate.certificateImage || certificate.mediaUploads || []);

  return (
    <section className="rounded-xl border border-[#DDDDDD] bg-white p-4">
      <h4 className="m-0 mb-3 font-bold text-[#383838]">Chứng chỉ</h4>
      <div className="space-y-3">
        {certificates.map((certificate) => (
          <div key={certificate.id || certificate.title} className="rounded-lg border border-[#DDDDDD] bg-[#FBF9F8] p-3">
            <p className="m-0 text-sm font-bold text-[#383838]">{certificate.title || 'Chứng chỉ'}</p>
            <p className="m-0 mt-1 text-xs text-[#555555]">{certificate.issuedBy || 'Chưa có nơi cấp'} • {formatDate(certificate.issuedAt)}</p>
          </div>
        ))}
      </div>
      {!!images.length && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <AntImage
              key={image.id || image.fileUrl || index}
              src={getImageUrl(image)}
              alt={`Chứng chỉ ${index + 1}`}
              className="!aspect-square !w-full !cursor-zoom-in !rounded-lg !border !border-[#DDDDDD] !object-cover"
              rootClassName="block"
              preview={{ mask: 'Xem ảnh' }}
            />
          ))}
        </div>
      )}
      {!certificates.length && <p className="m-0 text-sm text-[#555555]">Chưa có chứng chỉ.</p>}
    </section>
  );
}
