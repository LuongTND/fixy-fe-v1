"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Input,
  Modal,
  Pagination,
  Table,
  Tag,
  Tooltip,
} from "antd";
import "../admin-dashboard.css";
import { payoutApi } from "@/apis/payout.api";
import {
  formatTransactionTime,
  formatBookingPrice as formatCurrency,
} from "@/utils/format";
import { maskAccount } from "@/utils/helpers";
import { AdminShell, SymbolIcon } from "../_components/AdminShell";
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";

const normalizePaged = (payload) => ({
  items: Array.isArray(payload) ? payload : payload?.items || [],
  totalCount: Array.isArray(payload)
    ? payload.length
    : payload?.totalCount || 0,
  pageNumber: payload?.pageNumber || 1,
  pageSize: payload?.pageSize || 10,
});

const getStatusKey = (status) => String(status || "Pending").toLowerCase();

const statusMap = {
  pending: { label: "Chờ duyệt", className: "admin-finance-status-pending" },
  approved: { label: "Đã thanh toán", className: "admin-finance-status-paid" },
  processing: {
    label: "Đang xử lý",
    className: "admin-finance-status-processing",
  },
  success: { label: "Đã thanh toán", className: "admin-finance-status-paid" },
  paid: { label: "Đã thanh toán", className: "admin-finance-status-paid" },
  rejected: { label: "Từ chối", className: "admin-finance-status-pending" },
};

function getTechnicianName(record) {
  return (
    record.workerName ||
    record.workerProfile?.fullName ||
    record.worker?.fullName ||
    record.user?.fullName ||
    "Kỹ thuật viên"
  );
}

function getPayoutAccount(record) {
  return (
    record.payoutAccount || record.account || record.workerPayoutAccount || {}
  );
}

function isDepositRefundPayout(record) {
  return Boolean(
    record?.isDepositRefund ||
    (record?.vietQrUrl && record.vietQrUrl.includes("HOAN%20COC"))
  );
}

export default function AdminFinancePage() {
  const { message, modal, notification } = App.useApp();
  const [payouts, setPayouts] = useState([]);
  const [meta, setMeta] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    payout: null,
    reason: "",
  });
  const [vietqrModal, setVietqrModal] = useState({
    open: false,
    payout: null,
    status: "waiting", // "waiting" | "success"
  });
  const connectionRef = useRef(null);

  const loadPayouts = useCallback(
    async (pageNumber = meta.pageNumber, pageSize = meta.pageSize) => {
      setLoading(true);
      try {
        const response = await payoutApi.getAll({
          PageNumber: pageNumber,
          PageSize: pageSize,
          SortBy: "CreatedDate",
          SortDescending: true,
        });
        const paged = normalizePaged(response);
        setPayouts(paged.items);
        setMeta({
          pageNumber: paged.pageNumber,
          pageSize: paged.pageSize,
          totalCount: paged.totalCount,
        });
      } catch (error) {
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải yêu cầu rút tiền.",
        );
      } finally {
        setLoading(false);
      }
    },
    [message, meta.pageNumber, meta.pageSize],
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadPayouts(1, 10);
      }
    });
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // SignalR listener for PayoutApproved event (from SePay webhook)
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let hubUrl =
      process.env.NEXT_PUBLIC_NOTIFICATION_HUB_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(
            /\/api\/?$/,
            "/hubs/notifications",
          )
        : "");

    if (!hubUrl) return undefined;

    const separator = hubUrl.includes("?") ? "&" : "?";
    hubUrl = `${hubUrl}${separator}ngrok-skip-browser-warning=true`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging({
        log(logLevel, msg) {
          if (logLevel >= LogLevel.Warning) {
            console.warn(`[SignalR Finance] ${msg}`);
          }
        },
      })
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log("[Finance] SignalR connected for PayoutApproved events.");

        connection.on("PayoutApproved", (data) => {
          console.log("[Finance] PayoutApproved event:", data);

          // Update the payout in the table
          setPayouts((prev) =>
            prev.map((p) =>
              p.id === data.payoutRequestId
                ? {
                    ...p,
                    status: data.status || "Approved",
                    gatewayTransactionRef: data.gatewayTransactionRef,
                  }
                : p,
            ),
          );

          // If VietQR modal is showing the matching payout, switch to success
          setVietqrModal((prev) => {
            if (prev.open && prev.payout?.id === data.payoutRequestId) {
              return { ...prev, status: "success" };
            }
            return prev;
          });

          notification.success({
            message: "Chuyển tiền thành công ✅",
            description: `Mã ${data.payoutCode} đã được đối soát tự động. Mã ngân hàng: ${data.gatewayTransactionRef || "N/A"}`,
            duration: 6,
          });
        });
      })
      .catch((err) => {
        console.warn("[Finance] SignalR connection failed:", err);
      });

    return () => {
      connection.off("PayoutApproved");
      connection
        .stop()
        .catch((err) =>
          console.warn("[Finance] Error stopping SignalR:", err),
        );
    };
  }, [notification]);

  // Auto-close VietQR modal 2 seconds after success
  useEffect(() => {
    if (vietqrModal.status === "success") {
      const timer = setTimeout(() => {
        setVietqrModal({ open: false, payout: null, status: "waiting" });
        loadPayouts();
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [vietqrModal.status, loadPayouts]);

  const handleApprove = (record) => {
    const isRefund = isDepositRefundPayout(record);
    modal.confirm({
      title: isRefund ? "Duyệt hoàn tiền cọc ký quỹ?" : "Duyệt yêu cầu rút tiền?",
      content: `Xác nhận duyệt ${isRefund ? "hoàn cọc" : "rút tiền"} ${formatCurrency(record.amount)} của ${getTechnicianName(record)}.`,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        setActingId(record.id);
        try {
          await payoutApi.approve(record.id);
          message.success("Đã duyệt yêu cầu thành công.");
          await loadPayouts();
        } catch (error) {
          message.error(
            error.response?.data?.message ||
              error.message ||
              "Không thể duyệt yêu cầu.",
          );
        } finally {
          setActingId(null);
        }
      },
    });
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const reason = rejectModal.reason.trim();
    if (!reason) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }

    setActingId(rejectModal.payout?.id);
    try {
      await payoutApi.reject(rejectModal.payout.id, reason);
      message.success("Đã từ chối yêu cầu.");
      setRejectModal({ open: false, payout: null, reason: "" });
      await loadPayouts();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể từ chối yêu cầu.",
      );
    } finally {
      setActingId(null);
    }
  };

  const handleOpenVietQr = (record) => {
    setVietqrModal({ open: true, payout: record, status: "waiting" });
  };

  const handleCopyTransferContent = (record) => {
    const isRefund = isDepositRefundPayout(record);
    const prefix = isRefund ? "FIXY HOAN COC" : "FIXY RUT";
    const content = `${prefix} ${record?.payoutCode || ""}`;
    navigator.clipboard.writeText(content).then(
      () => message.success(`Đã copy nội dung: ${content}`),
      () => message.error("Không thể copy, vui lòng copy thủ công."),
    );
  };

  const pendingCount = payouts.filter(
    (item) => getStatusKey(item.status) === "pending",
  ).length;
  const paidAmount = payouts
    .filter((item) =>
      ["paid", "success", "approved"].includes(getStatusKey(item.status)),
    )
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const summaryCards = [
    {
      icon: "pending_actions",
      label: "Yêu cầu chờ duyệt",
      value: pendingCount,
      meta: "Trong trang hiện tại",
      trend: "alert",
    },
    {
      icon: "payments",
      label: "Tổng tiền yêu cầu",
      value: formatCurrency(
        payouts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      ),
      meta: "Theo bộ lọc hiện tại",
      trend: "neutral",
    },
    {
      icon: "check_circle",
      label: "Đã xử lý",
      value: formatCurrency(paidAmount),
      meta: "Đã duyệt / thanh toán",
      trend: "up",
      success: true,
    },
    {
      icon: "receipt_long",
      label: "Tổng yêu cầu",
      value: meta.totalCount,
      meta: "Tất cả yêu cầu rút tiền",
      trend: "neutral",
    },
  ];

  const columns = [
    {
      title: "Kỹ thuật viên",
      key: "technician",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="!bg-[#EAF9FF] !text-[#FF8228]"
            icon={<SymbolIcon>person</SymbolIcon>}
          />
          <div>
            <p className="m-0 text-sm font-bold text-[#383838]">
              {getTechnicianName(record)}
            </p>
            <p className="m-0 text-xs text-[#555555]">
              #
              {String(record.id || "")
                .slice(0, 8)
                .toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Loại yêu cầu",
      key: "type",
      width: 170,
      render: (_, record) => {
        const isRefund = isDepositRefundPayout(record);
        return isRefund ? (
          <Tag color="orange" className="!m-0 !inline-flex !items-center !gap-1 !text-xs !font-bold !px-2.5 !py-1 !rounded-md !border-[#FFD591] !bg-[#FFF7E6] !text-[#D46B08]">
            <SymbolIcon className="!text-[14px]">shield</SymbolIcon>
            Hoàn cọc thôi việc
          </Tag>
        ) : (
          <Tag color="blue" className="!m-0 !inline-flex !items-center !gap-1 !text-xs !font-bold !px-2.5 !py-1 !rounded-md !border-[#91CAFF] !bg-[#E6F4FF] !text-[#0958D9]">
            <SymbolIcon className="!text-[14px]">payments</SymbolIcon>
            Rút thu nhập
          </Tag>
        );
      },
    },
    {
      title: "Mã rút tiền",
      dataIndex: "payoutCode",
      key: "payoutCode",
      width: 130,
      render: (value) =>
        value ? (
          <Tag
            color="blue"
            className="!text-xs !font-bold !px-2 !py-0.5 !rounded-md"
          >
            {value}
          </Tag>
        ) : (
          <span className="text-xs text-[#818A91]">—</span>
        ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (value) => (
        <p className="m-0 text-sm font-bold text-[#383838]">
          {formatCurrency(value)}
        </p>
      ),
    },
    {
      title: "Ngân hàng",
      key: "bank",
      render: (_, record) => {
        const account = getPayoutAccount(record);
        return (
          <div>
            <p className="m-0 text-sm font-bold text-[#383838]">
              {account.bankName || record.bankName || "Chưa cập nhật"}
            </p>
            <p className="m-0 text-xs text-[#555555]">
              {maskAccount(account.accountNumber || record.accountNumber)}
            </p>
          </div>
        );
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (value) => (
        <span className="text-sm text-[#555555]">
          {value ? formatTransactionTime(value) : "Chưa cập nhật"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const status = statusMap[getStatusKey(record.status)] || statusMap.pending;
        return (
          <div>
            <Tag className={`admin-finance-status ${status.className}`}>
              {status.label}
            </Tag>
            {record.gatewayTransactionRef && (
              <Tooltip title="Mã đối soát ngân hàng">
                <p className="m-0 mt-1 text-[11px] font-medium text-[#39B54A]">
                  🏦 {record.gatewayTransactionRef}
                </p>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      width: 280,
      render: (_, record) => {
        const isPending = getStatusKey(record.status) === "pending";
        if (!isPending)
          return <span className="text-xs text-[#818A91]">Đã xử lý</span>;

        return (
          <div className="admin-finance-actions">
            {record.vietQrUrl && (
              <Button
                className="admin-finance-approve-button"
                style={{
                  background:
                    "linear-gradient(135deg, #FF8228 0%, #FF6B00 100%)",
                  borderColor: "#FF8228",
                  color: "#fff",
                }}
                onClick={() => handleOpenVietQr(record)}
                icon={<SymbolIcon>qr_code_2</SymbolIcon>}
              >
                Quét VietQR
              </Button>
            )}
            {!record.vietQrUrl && (
              <Button
                loading={actingId === record.id}
                className="admin-finance-approve-button"
                onClick={() => handleApprove(record)}
              >
                Duyệt
              </Button>
            )}
            <Button
              danger
              className="admin-finance-outline-button"
              onClick={() =>
                setRejectModal({ open: true, payout: record, reason: "" })
              }
            >
              Từ chối
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminShell activeKey="finance">
      <section className="admin-page-heading">
        <div>
          <h2>Tài Chính & Giải Ngân</h2>
          <p>
            Theo dõi doanh thu nền tảng và xử lý yêu cầu rút tiền của kỹ thuật
            viên.
          </p>
        </div>
        <Button
          className="admin-finance-refresh-button"
          onClick={() => loadPayouts(meta.pageNumber, meta.pageSize)}
          icon={<SymbolIcon>refresh</SymbolIcon>}
        >
          Làm mới
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="admin-finance-summary-card">
            <SymbolIcon className="admin-finance-summary-watermark">
              {item.icon}
            </SymbolIcon>
            <p className="m-0 text-xs font-bold uppercase text-[#555555]">
              {item.label}
            </p>
            <h3
              className={`m-0 mt-2 text-3xl font-bold ${item.success ? "text-[#39B54A]" : "text-[#383838]"}`}
            >
              {item.value}
            </h3>
            <div
              className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${item.trend === "alert" ? "text-[#EA4335]" : item.trend === "up" ? "text-[#39B54A]" : "text-[#555555]"}`}
            >
              <SymbolIcon className="!text-[16px]">
                {item.trend === "alert"
                  ? "schedule"
                  : item.trend === "up"
                    ? "trending_up"
                    : "groups"}
              </SymbolIcon>
              {item.meta}
            </div>
          </Card>
        ))}
      </section>

      <Card className="admin-panel !mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDDDD] pb-4">
          <h3 className="m-0 text-lg font-bold text-[#383838]">
            Yêu Cầu Rút Tiền
          </h3>
        </div>

        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={payouts}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={false}
          scroll={{ x: 1100 }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">
            Tổng {meta.totalCount} yêu cầu
          </p>
          <Pagination
            className="admin-tech-pagination"
            current={meta.pageNumber}
            pageSize={meta.pageSize}
            total={meta.totalCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={loadPayouts}
          />
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EA4335]/10 text-[#EA4335]">
              <SymbolIcon className="!text-[22px]">block</SymbolIcon>
            </span>
            <div>
              <p className="m-0 text-lg font-bold text-[#383838]">
                Từ chối yêu cầu rút tiền
              </p>
              <p className="m-0 text-xs font-medium text-[#818A91]">
                Lý do sẽ được gửi lại cho kỹ thuật viên.
              </p>
            </div>
          </div>
        }
        open={rejectModal.open}
        onCancel={() =>
          setRejectModal({ open: false, payout: null, reason: "" })
        }
        footer={null}
        destroyOnHidden
        width={560}
      >
        <form className="mt-6 space-y-5" onSubmit={handleReject}>
          {rejectModal.payout && (
            <div className="rounded-xl border border-[#F1D5CD] bg-[#FFF8F5] p-4">
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">
                Yêu cầu đang xử lý
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">
                    Kỹ thuật viên
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">
                    {getTechnicianName(rejectModal.payout)}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">
                    Số tiền
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#FF8228]">
                    {formatCurrency(rejectModal.payout.amount)}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">
                    Ngân hàng
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">
                    {getPayoutAccount(rejectModal.payout).bankName ||
                      rejectModal.payout.bankName ||
                      "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#818A91]">
              Lý do từ chối
            </label>
            <Input.TextArea
              rows={5}
              showCount
              maxLength={240}
              placeholder="Ví dụ: Thông tin tài khoản nhận tiền chưa khớp, vui lòng kiểm tra lại."
              value={rejectModal.reason}
              onChange={(event) =>
                setRejectModal((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              size="large"
              onClick={() =>
                setRejectModal({ open: false, payout: null, reason: "" })
              }
              className="sm:min-w-[120px]"
            >
              Hủy
            </Button>
            <Button
              danger
              size="large"
              htmlType="submit"
              loading={Boolean(actingId)}
              className="sm:min-w-[180px]"
            >
              Xác nhận từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* VietQR Dynamic Modal */}
      <Modal
        title={null}
        open={vietqrModal.open}
        onCancel={() =>
          setVietqrModal({ open: false, payout: null, status: "waiting" })
        }
        footer={null}
        destroyOnHidden
        width={520}
        centered
      >
        {vietqrModal.payout && (
          <div className="w-full text-center">
            {vietqrModal.status === "success" ? (
              /* SUCCESS STATE */
              <div className="w-full py-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#39B54A]/10">
                  <SymbolIcon className="!text-[48px] text-[#39B54A]">
                    check_circle
                  </SymbolIcon>
                </div>
                <h3 className="m-0 text-xl font-bold text-[#39B54A]">
                  Chuyển tiền thành công!
                </h3>
                <p className="mt-2 text-sm text-[#555555]">
                  Hệ thống đã tự động đối soát qua SePay. Modal sẽ tự đóng...
                </p>
              </div>
            ) : (
              /* WAITING/QR STATE */
              <>
                <div className="mb-4 flex items-center justify-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8228]/10 text-[#FF8228]">
                    <SymbolIcon className="!text-[22px]">
                      qr_code_2
                    </SymbolIcon>
                  </span>
                  <div className="text-left">
                    <p className="m-0 text-lg font-bold text-[#383838]">
                      {isDepositRefundPayout(vietqrModal.payout)
                        ? "Quét VietQR hoàn cọc ký quỹ"
                        : "Quét VietQR chuyển tiền"}
                    </p>
                    <p className="m-0 text-xs text-[#818A91]">
                      Mở App ngân hàng → Quét mã QR bên dưới
                    </p>
                  </div>
                </div>

                {isDepositRefundPayout(vietqrModal.payout) && (
                  <div
                    className="mx-auto mb-4 flex items-center justify-center gap-2 rounded-xl border border-[#FFD591] bg-[#FFF7E6] px-4 py-2.5 text-xs font-semibold text-[#D46B08]"
                    style={{ width: "100%", maxWidth: "380px" }}
                  >
                    <SymbolIcon className="!text-[18px] shrink-0 text-[#D46B08]">shield</SymbolIcon>
                    <span className="text-center leading-normal">
                      Hoàn trả 100% tiền cọc bảo đảm cho KTV thôi việc
                    </span>
                  </div>
                )}

                {/* QR Code Image */}
                <div
                  className="mx-auto mb-4 overflow-hidden rounded-2xl border-2 border-[#E8E8E8] bg-white p-3 shadow-sm"
                  style={{ width: 280 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vietqrModal.payout.vietQrUrl}
                    alt={`VietQR ${vietqrModal.payout.payoutCode}`}
                    className="h-auto w-full"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                </div>

                {/* Transfer Details */}
                <div
                  className="mx-auto mb-4 w-full max-w-sm space-y-2.5 rounded-xl border border-[#DDDDDD] bg-[#FAFAFA] p-4 text-left text-sm"
                  style={{ width: "100%", maxWidth: "380px" }}
                >
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="shrink-0 text-[#818A91]">Loại yêu cầu:</span>
                    <span className="text-right font-bold text-[#383838]">
                      {isDepositRefundPayout(vietqrModal.payout) ? (
                        <Tag color="orange" className="!m-0 !font-bold">🛡️ Hoàn cọc thôi việc</Tag>
                      ) : (
                        <Tag color="blue" className="!m-0 !font-bold">💰 Rút thu nhập</Tag>
                      )}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="shrink-0 text-[#818A91]">Tên KTV:</span>
                    <span className="text-right font-bold text-[#383838]">
                      {getTechnicianName(vietqrModal.payout)}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="shrink-0 text-[#818A91]">Ngân hàng:</span>
                    <span className="text-right font-bold text-[#383838]">
                      {vietqrModal.payout.bankName || vietqrModal.payout.bankCode || "—"}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="shrink-0 text-[#818A91]">Số tài khoản:</span>
                    <span className="text-right font-bold text-[#383838]">
                      {vietqrModal.payout.accountNumber || "—"}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="shrink-0 text-[#818A91]">Số tiền:</span>
                    <span className="text-right font-bold text-[#FF8228]">
                      {formatCurrency(vietqrModal.payout.amount)}
                    </span>
                  </div>
                  <div className="!mt-3 w-full border-t border-[#DDDDDD] pt-3">
                    <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">
                      Nội dung chuyển khoản
                    </p>
                    <div className="mt-1 flex w-full items-center justify-between gap-2">
                      <code className="rounded bg-[#FFF3E0] px-2.5 py-1 text-sm font-bold text-[#FF6B00]">
                        {isDepositRefundPayout(vietqrModal.payout) ? "FIXY HOAN COC" : "FIXY RUT"} {vietqrModal.payout.payoutCode}
                      </code>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() =>
                          handleCopyTransferContent(
                            vietqrModal.payout,
                          )
                        }
                        icon={<SymbolIcon className="!text-[14px]">content_copy</SymbolIcon>}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Waiting Status */}
                <div className="flex items-center justify-center gap-2 text-sm text-[#818A91]">
                  <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#FF8228]" />
                  Đang chờ hệ thống tự động đối soát qua SePay...
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
