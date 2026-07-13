'use client';

import { useEffect, useMemo, useState } from 'react';
import { App, Form, Input, Modal, Select } from 'antd';
import { supportTicketApi } from '@/apis/support.api';
import { SUPPORT_CATEGORY, SUPPORT_PRIORITY } from '@/constants/enums';

const categoryOptions = [
  { value: SUPPORT_CATEGORY.DISPUTE, label: 'Tranh chấp', description: 'Vấn đề với booking, chất lượng, giá hoặc bàn giao.' },
  { value: SUPPORT_CATEGORY.PAYMENT, label: 'Thanh toán', description: 'Ví, cổng thanh toán, voucher, rút tiền hoặc đối soát.' },
  { value: SUPPORT_CATEGORY.TECHNICAL, label: 'Kỹ thuật', description: 'Lỗi app, hồ sơ, chat, bản đồ hoặc tải ảnh.' },
  { value: SUPPORT_CATEGORY.OTHER, label: 'Khác', description: 'Câu hỏi hoặc yêu cầu hỗ trợ chung.' },
];

const priorityOptions = [
  { value: SUPPORT_PRIORITY.LOW, label: 'Thấp' },
  { value: SUPPORT_PRIORITY.NORMAL, label: 'Bình thường' },
  { value: SUPPORT_PRIORITY.HIGH, label: 'Cao' },
  { value: SUPPORT_PRIORITY.URGENT, label: 'Khẩn cấp' },
];

export function SupportTicketModal({
  open,
  onClose,
  bookingId,
  defaultCategory = SUPPORT_CATEGORY.OTHER,
  defaultPriority = SUPPORT_PRIORITY.NORMAL,
  defaultSubject = '',
  defaultDescription = '',
  contextLabel = '',
  afterSubmit,
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const selectedCategory = Form.useWatch('category', form);

  const initialValues = useMemo(() => ({
    category: defaultCategory,
    priority: defaultPriority,
    subject: defaultSubject,
    description: defaultDescription,
  }), [defaultCategory, defaultDescription, defaultPriority, defaultSubject]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await supportTicketApi.create({
        bookingId: bookingId || null,
        category: values.category,
        subject: values.subject.trim(),
        description: values.description.trim(),
        priority: values.priority,
      });
      message.success('Đã gửi yêu cầu hỗ trợ.');
      form.resetFields();
      onClose?.();
      afterSubmit?.();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.response?.data?.message || error.message || 'Không thể gửi yêu cầu hỗ trợ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={(
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8228]/10 text-[#FF8228]">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </span>
          <div>
            <p className="m-0 text-lg font-bold text-[#1b1c1c]">Gửi yêu cầu hỗ trợ</p>
            <p className="m-0 text-xs font-medium text-[#818A91]">{contextLabel || 'Đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.'}</p>
          </div>
        </div>
      )}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnHidden
      width={600}
      style={{ top: 48 }}
      okButtonProps={{ className: '!bg-[#FF8228]' }}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} className="mt-4">
        <Form.Item name="category" label="Loại hỗ trợ" rules={[{ required: true, message: 'Vui lòng chọn loại hỗ trợ.' }]}>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryOptions.map((item) => {
              const active = selectedCategory === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => form.setFieldValue('category', item.value)}
                  className={`min-h-[88px] rounded-xl border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-[#FF8228] bg-[#FFF4ED] text-[#FF8228] shadow-sm'
                      : 'border-[#DDDDDD] bg-white text-[#1b1c1c] hover:border-[#FF8228]/50 hover:bg-[#FFF8F5]'
                  }`}
                >
                  <span className="block text-sm font-bold leading-5">{item.label}</span>
                  <span className="mt-1.5 block text-xs font-medium leading-5 text-[#818A91]">{item.description}</span>
                </button>
              );
            })}
          </div>
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề.' },
              { min: 6, message: 'Tiêu đề cần ít nhất 6 ký tự.' },
            ]}
          >
            <Input
              size="large"
              placeholder="Ví dụ: Cần hỗ trợ thanh toán booking"
              maxLength={120}
              showCount
              className="!h-12"
            />
          </Form.Item>
          <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true, message: 'Chọn mức độ ưu tiên.' }]}>
            <Select
              size="large"
              options={priorityOptions}
              className="!h-12 [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-item]:!leading-[46px]"
            />
          </Form.Item>
        </div>

        {bookingId && (
          <div className="mb-4 rounded-xl border border-[#DEC0B1]/40 bg-[#FFF8F5] px-4 py-3 text-xs font-semibold text-[#555555]">
            Gắn với booking #{String(bookingId).slice(0, 8).toUpperCase()}
          </div>
        )}

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[
            { required: true, message: 'Vui lòng mô tả vấn đề.' },
            { min: 12, message: 'Mô tả cần ít nhất 12 ký tự.' },
          ]}
        >
          <Input.TextArea
            rows={5}
            maxLength={1000}
            showCount
            placeholder="Mô tả điều đã xảy ra, thời điểm phát sinh và mong muốn hỗ trợ."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
