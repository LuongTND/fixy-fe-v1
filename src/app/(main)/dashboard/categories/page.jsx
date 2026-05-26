'use client';

import { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Popconfirm, Select, Switch, Table, Tag, Upload } from 'antd';
import '../admin-dashboard.css';
import { serviceCategoryApi } from '@/apis/service-category.api';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';

const emptyCategory = {
  parentId: null,
  name: '',
  description: '',
  imageUrl: '',
  sortOrder: 1,
  isActive: true,
};

const statusMap = {
  active: { label: 'Hoạt động', className: 'admin-category-status-active' },
  archived: { label: 'Lưu trữ', className: 'admin-category-status-archived' },
};

const LEVEL_INDENT_CLASSES = {
  1: 'pl-6',
  2: 'pl-12',
  3: 'pl-[72px]',
};

function normalizeCategory(category) {
  return {
    ...category,
    id: category.id ?? category.Id,
    parentId: category.parentId ?? category.ParentId ?? null,
    name: category.name ?? category.Name ?? '',
    description: category.description ?? category.Description ?? '',
    imageUrl: category.imageUrl ?? category.ImageUrl ?? '',
    sortOrder: category.sortOrder ?? category.SortOrder ?? 0,
    isActive: category.isActive ?? category.IsActive ?? true,
  };
}

function buildRows(categories, expandedCategoryIds) {
  const normalized = categories.map(normalizeCategory);
  const childrenByParent = normalized.reduce((acc, category) => {
    const parentKey = category.parentId || 'root';
    acc[parentKey] = acc[parentKey] || [];
    acc[parentKey].push(category);
    return acc;
  }, {});

  Object.values(childrenByParent).forEach((group) => {
    group.sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      return orderDiff || a.name.localeCompare(b.name, 'vi');
    });
  });

  const rows = [];
  const appendCategory = (category, level = 0) => {
    const children = childrenByParent[category.id] || [];
    rows.push({
      ...category,
      key: category.id,
      level,
      status: category.isActive ? 'active' : 'archived',
      subCategories: children.length || null,
    });

    if (expandedCategoryIds.has(category.id)) {
      children.forEach((child) => appendCategory(child, level + 1));
    }
  };

  (childrenByParent.root || []).forEach((category) => appendCategory(category));

  return rows;
}

function buildCategoryFormData(values, imageFile) {
  const formData = new FormData();

  if (values.parentId && values.parentId !== 'none') {
    formData.append('ParentId', values.parentId);
  }

  formData.append('Name', values.name || '');
  formData.append('Description', values.description || '');
  formData.append('SortOrder', String(values.sortOrder ?? 0));
  formData.append('IsActive', String(values.isActive ?? true));

  if (imageFile) {
    formData.append('ImageFile', imageFile);
  }

  return formData;
}

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const {
    categories,
    loading,
    error: categoryLoadError,
    reload: loadCategories,
  } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(new Set());
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => buildRows(categories, expandedCategoryIds), [categories, expandedCategoryIds]);
  const parentOptions = useMemo(() => [
    { value: 'none', label: 'Không có (danh mục gốc)' },
    ...categories
      .map(normalizeCategory)
      .filter((category) => !category.parentId && category.id !== selectedCategory?.id)
      .map((category) => ({ value: category.id, label: category.name })),
  ], [categories, selectedCategory?.id]);

  const handleSelectCategory = (category) => {
    const normalized = normalizeCategory(category);
    setSelectedCategory(normalized);
    setSelectedImageFile(null);
    setSelectedImageName('');
    setImagePreviewUrl('');
    form.setFieldsValue({
      parentId: normalized.parentId || 'none',
      name: normalized.name || '',
      description: normalized.description || '',
      sortOrder: normalized.sortOrder ?? 1,
      isActive: normalized.isActive ?? true,
    });
  };

  /*
  const legacyLoadCategories = async () => {
    try {
      setLoading(true);
      const response = await legacyServiceCategoryLoader();
      const list = normalizeList(response);
      setCategories(list);
      setExpandedCategoryIds(new Set(list.map(normalizeCategory).filter((category) => !category.parentId).map((category) => category.id)));

      if (!selectedCategory && list.length > 0) {
        handleSelectCategory(list[0]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh mục dịch vụ');
    } finally {
      setLoading(false);
    }
  };
  */

  useEffect(() => {
    if (categoryLoadError) {
      message.error(categoryLoadError.response?.data?.message || categoryLoadError.message || 'Không thể tải danh mục dịch vụ');
    }
  }, [categoryLoadError, message]);

  useEffect(() => {
    queueMicrotask(() => {
      setExpandedCategoryIds(new Set(categories.map(normalizeCategory).filter((category) => !category.parentId).map((category) => category.id)));
      if (!selectedCategory && categories.length > 0) {
        handleSelectCategory(categories[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedCategory]);

  useEffect(() => () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setSelectedImageFile(null);
    setSelectedImageName('');
    setImagePreviewUrl('');
    form.setFieldsValue({ ...emptyCategory, parentId: 'none' });
  };

  const handleExpandAll = () => {
    setExpandedCategoryIds(new Set(categories.map(normalizeCategory).filter((category) => !category.parentId).map((category) => category.id)));
  };

  const handleCollapseAll = () => {
    setExpandedCategoryIds(new Set());
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const payload = buildCategoryFormData(values, selectedImageFile);
      const saved = selectedCategory?.id
        ? await serviceCategoryApi.update(selectedCategory.id, payload)
        : await serviceCategoryApi.create(payload);

      message.success(selectedCategory?.id ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục');
      setSelectedCategory(saved?.id || saved?.Id ? normalizeCategory(saved) : selectedCategory);
      setSelectedImageFile(null);
      setSelectedImageName('');
      setImagePreviewUrl('');
      await loadCategories();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    try {
      await serviceCategoryApi.delete(category.id);
      message.success('Đã xóa danh mục');
      setSelectedCategory(null);
      setSelectedImageFile(null);
      setSelectedImageName('');
      setImagePreviewUrl('');
      form.setFieldsValue({ ...emptyCategory, parentId: 'none' });
      await loadCategories();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể xóa danh mục');
    }
  };

  const columns = [
    {
      title: '',
      key: 'drag',
      width: 40,
      render: () => <SymbolIcon className="!text-[20px] !text-[#777777]">drag_indicator</SymbolIcon>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className={`admin-category-name ${LEVEL_INDENT_CLASSES[record.level] || ''}`}>
          {record.level ? (
            <span className="admin-category-branch" />
          ) : (
            <button
              type="button"
              className="inline-flex border-0 bg-transparent p-0 text-[#FF8228]"
              onClick={() => toggleCategory(record.id)}
              aria-label={expandedCategoryIds.has(record.id) ? 'Thu gọn danh mục' : 'Mở rộng danh mục'}
            >
              <SymbolIcon className="!text-[22px] !text-[#FF8228]">
                {expandedCategoryIds.has(record.id) ? 'arrow_drop_down' : 'arrow_right'}
              </SymbolIcon>
            </button>
          )}
          <span className={record.level ? 'font-medium' : 'font-bold'}>{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 96,
      render: (value, record) => (
        <span className={`admin-category-icon ${record.level ? 'admin-category-icon-child' : ''}`}>
          {value ? (
            <img src={value} alt="" className="h-full w-full rounded-lg object-cover" />
          ) : (
            <SymbolIcon className={record.level ? '!text-[18px]' : '!text-[22px]'}>category</SymbolIcon>
          )}
        </span>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: 'Danh mục con',
      dataIndex: 'subCategories',
      key: 'subCategories',
      width: 112,
      render: (value) => (value ? <Tag className="admin-category-count">{String(value).padStart(2, '0')}</Tag> : <span className="text-xs text-[#777777]">-</span>),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 132,
      render: (value) => (
        <Tag className={`admin-category-status ${statusMap[value].className}`}>
          <span />
          {statusMap[value].label}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 92,
      render: (_, record) => (
        <div className="admin-category-actions">
          <Button className="admin-category-action-button" onClick={() => handleSelectCategory(record)} icon={<SymbolIcon className="!text-[18px]">edit</SymbolIcon>} />
          <Popconfirm title="Xóa danh mục này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record)}>
            <Button className="admin-category-action-button" danger icon={<SymbolIcon className="!text-[18px]">delete</SymbolIcon>} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminShell activeKey="categories">
      <section className="admin-page-heading">
        <div>
          <h2>Quản Lý Danh Mục Dịch Vụ</h2>
          <p>Quản lý cấu trúc phân cấp, hình ảnh và trạng thái hiển thị của dịch vụ.</p>
        </div>
        <Button
          type="primary"
          className="admin-primary-pill-button"
          icon={<SymbolIcon>add_circle</SymbolIcon>}
          onClick={handleNewCategory}
        >
          Thêm danh mục dịch vụ
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(360px,0.9fr)]">
        <Card className="admin-panel admin-category-table-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDDDDD] pb-4">
            <h3 className="m-0 text-lg font-bold text-[#383838]">Cây Danh Mục</h3>
            <div className="flex items-center gap-2">
              <Button className="admin-toolbar-button" icon={<SymbolIcon>unfold_less</SymbolIcon>} onClick={handleCollapseAll}>
                Thu gọn
              </Button>
              <Button className="admin-toolbar-button" icon={<SymbolIcon>unfold_more</SymbolIcon>} onClick={handleExpandAll}>
                Mở rộng
              </Button>
            </div>
          </div>

          <Table
            className="admin-tech-table admin-category-table"
            columns={columns}
            dataSource={rows}
            loading={loading}
            pagination={false}
            scroll={{ x: 760 }}
            rowClassName={(record) => (record.status === 'archived' ? 'admin-category-row-archived' : '')}
          />
        </Card>

        <div className="space-y-6">
          <Card className="admin-panel admin-category-editor-card">
            <div className="admin-category-editor-head">
              <SymbolIcon className="!text-[#FF8228]">edit_note</SymbolIcon>
              <h3 className="m-0 text-lg font-bold text-[#383838]">
                {selectedCategory?.id ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
              </h3>
            </div>

            <Form form={form} layout="vertical" initialValues={{ ...emptyCategory, parentId: 'none' }} onFinish={handleSubmit}>
              <Form.Item label="Tên danh mục" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Danh mục cha" name="parentId">
                <Select options={parentOptions} />
              </Form.Item>
              <Form.Item label="Ảnh danh mục">
                {(imagePreviewUrl || selectedCategory?.imageUrl) && (
                  <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#DDDDDD] bg-[#FBF9F8] p-2">
                    <img
                      src={imagePreviewUrl || selectedCategory.imageUrl}
                      alt="Category preview"
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold text-[#383838]">Ảnh xem trước</p>
                      <p className="m-0 truncate text-xs text-[#777777]">
                        {selectedImageName || 'Ảnh hiện tại'}
                      </p>
                    </div>
                  </div>
                )}
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (imagePreviewUrl) {
                      URL.revokeObjectURL(imagePreviewUrl);
                    }
                    setSelectedImageFile(file);
                    setSelectedImageName(file.name);
                    setImagePreviewUrl(URL.createObjectURL(file));
                    return Upload.LIST_IGNORE;
                  }}
                >
                  <Button className="admin-toolbar-button" icon={<SymbolIcon>upload</SymbolIcon>}>
                    Chọn ảnh
                  </Button>
                </Upload>
              </Form.Item>
              {(selectedImageName || selectedCategory?.imageUrl) && (
                <p className="m-0 mb-4 text-xs text-[#777777]">
                  {selectedImageName ? `Đã chọn: ${selectedImageName}` : 'Đang dùng ảnh hiện tại. Chọn ảnh mới nếu muốn thay đổi.'}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                  <InputNumber className="!w-full" min={0} />
                </Form.Item>
                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                  <Switch className="admin-category-active-switch" checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
              </div>
              <div className="flex gap-3 pt-2">
                <Button htmlType="submit" loading={saving} type="primary" className="admin-category-submit-button">
                  {selectedCategory?.id ? 'Cập nhật' : 'Thêm mới'}
                </Button>
                <Button className="admin-category-cancel-button" onClick={handleNewCategory}>Hủy</Button>
              </div>
            </Form>
          </Card>

          <Card className="admin-category-tip-card">
            <div className="admin-category-tip-content">
              <SymbolIcon className="!text-[#00A8E8]">info</SymbolIcon>
              <div>
                <p className="m-0 font-bold text-[#383838]">Gợi ý phân cấp</p>
                <p className="m-0 mt-1 text-sm text-[#555555]">
                  Danh mục gốc hiển thị ở trang chủ. Nên giữ cấu trúc dưới 3 cấp để trải nghiệm mobile dễ quét hơn.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}
