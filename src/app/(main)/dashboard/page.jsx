'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Progress, Select, Spin } from 'antd';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import './admin-dashboard.css';
import { dashboardApi } from '@/apis/dashboard.api';
import { AdminShell, SymbolIcon } from './_components/AdminShell';

const formatNumber = (value = 0) => Number(value || 0).toLocaleString('vi-VN');
const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const serviceColors = ['#FF8228', '#5BC0DE', '#39B54A', '#555555', '#DDDDDD'];
const headingButtonClass = '!inline-flex !h-9 !min-h-9 !items-center !justify-center !gap-2 !rounded-md !px-3.5 !text-sm !font-semibold !leading-none !text-[#383838] [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[20px] [&_.material-symbols-outlined]:!leading-none';
const currentYear = new Date().getFullYear();
const monthOptions = [
  { value: 0, label: 'Cả năm' },
  ...Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: `Tháng ${index + 1}` })),
];
const yearOptions = Array.from({ length: 6 }, (_, index) => {
  const year = currentYear - index;
  return { value: year, label: String(year) };
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="admin-custom-tooltip">
        <p className="admin-tooltip-title">{`Kỳ: ${label}`}</p>
        <div className="admin-tooltip-divider" />
        <div className="admin-tooltip-items">
          {payload.map((entry, index) => {
            const color = entry.color || entry.stroke || '#FF8228';
            return (
              <div key={index} className="admin-tooltip-item">
                <span className="admin-tooltip-dot" style={{ backgroundColor: color }} />
                <span className="admin-tooltip-label">{entry.name}:</span>
                <span className="admin-tooltip-value">
                  {formatNumber(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

function normalizeTopService(item, index, total) {
  const name = item.categoryName || item.serviceName || item.name || item.label || 'Dịch vụ';
  const rawValue = Number(item.percent ?? item.percentage ?? item.value ?? item.bookingCount ?? item.count ?? 0);
  const percent = item.percent || item.percentage
    ? rawValue
    : total > 0
      ? Math.round((rawValue / total) * 100)
      : 0;

  return {
    name,
    value: Math.min(Math.max(percent, 0), 100),
    color: item.color || serviceColors[index % serviceColors.length],
  };
}

export default function DashboardPage() {
  const { message } = App.useApp();
  const [summary, setSummary] = useState(null);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {
        year: selectedYear,
        ...(selectedMonth ? { month: selectedMonth } : {}),
      };
      const [summaryResult, trendsResult, servicesResult] = await Promise.allSettled([
        dashboardApi.getSummary(),
        dashboardApi.getBookingTrends(filterParams),
        dashboardApi.getTopServices(filterParams),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value || null);
      } else {
        setSummary(null);
      }

      if (trendsResult.status === 'fulfilled') {
        setBookingTrends(Array.isArray(trendsResult.value) ? trendsResult.value : []);
      } else {
        setBookingTrends([]);
      }

      if (servicesResult.status === 'fulfilled') {
        setTopServices(Array.isArray(servicesResult.value) ? servicesResult.value : []);
        setActiveCategoryIndex(0);
      } else {
        setTopServices([]);
        setActiveCategoryIndex(0);
      }

      if ([summaryResult, trendsResult, servicesResult].some((result) => result.status === 'rejected')) {
        message.warning('Một phần dữ liệu dashboard chưa tải được.');
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }, [message, selectedMonth, selectedYear]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => [
    { icon: 'engineering', label: 'Kỹ thuật viên', value: formatNumber(summary?.totalWorkers), change: 'Live', trend: 'up', tone: 'orange' },
    { icon: 'group', label: 'Khách hàng', value: formatNumber(summary?.totalCustomers), change: 'Live', trend: 'up', tone: 'blue' },
    { icon: 'receipt_long', label: 'Đơn hàng', value: formatNumber(summary?.totalBookings), change: 'Live', trend: 'up', tone: 'green' },
    { icon: 'payments', label: 'Tổng doanh thu', value: formatCurrency(summary?.totalRevenue), change: 'Live', trend: 'up', tone: 'primary' },
  ], [summary]);

  const trendSummary = useMemo(() => {
    const completed = bookingTrends.reduce((sum, item) => sum + Number(item.completedCount || 0), 0);
    const cancelled = bookingTrends.reduce((sum, item) => sum + Number(item.cancelledCount || 0), 0);
    return { completed, cancelled, total: completed + cancelled };
  }, [bookingTrends]);

  const trendChartData = useMemo(() => bookingTrends.map((item) => {
    const completed = Number(item.completedCount || 0);
    const cancelled = Number(item.cancelledCount || 0);
    return {
      label: item.label,
      completed,
      cancelled,
      total: completed + cancelled,
    };
  }), [bookingTrends]);

  const categoryStats = useMemo(() => {
    const total = topServices.reduce((sum, item) => sum + Number(item.bookingCount || item.count || item.value || 0), 0);
    return topServices.map((item, index) => normalizeTopService(item, index, total)).slice(0, 5);
  }, [topServices]);

  const activeCategory = categoryStats[activeCategoryIndex] || categoryStats[0];
  const activeCategoryName = activeCategory?.name || 'Dịch vụ';
  const activeCategoryPercent = activeCategory?.value || 0;

  return (
    <AdminShell activeKey="dashboard">
      <section className="admin-page-heading">
        <div>
          <h2>Tổng Quan Sức Khỏe Nền Tảng</h2>
          <p>Thống kê vận hành và hoạt động theo dữ liệu thực của hệ sinh thái Vua Thợ.</p>
        </div>
        <div className="admin-heading-actions">
          <Select
            className="admin-dashboard-filter-select"
            value={selectedMonth}
            options={monthOptions}
            onChange={setSelectedMonth}
          />
          <Select
            className="admin-dashboard-filter-select admin-dashboard-year-select"
            value={selectedYear}
            options={yearOptions}
            onChange={setSelectedYear}
          />
          <Button className={headingButtonClass} icon={<SymbolIcon>refresh</SymbolIcon>} onClick={loadDashboard} loading={loading}>
            Làm mới
          </Button>
        </div>
      </section>

      <Spin spinning={loading}>
        <section className="admin-kpi-grid">
          {stats.map((stat) => (
            <Card key={stat.label} className={`admin-kpi-card admin-kpi-${stat.tone}`}>
              <div className="admin-kpi-head">
                <span className="admin-kpi-icon">
                  <SymbolIcon>{stat.icon}</SymbolIcon>
                </span>
                <span className={`admin-kpi-change admin-trend-${stat.trend}`}>
                  {stat.change}
                  <SymbolIcon>{stat.trend === 'up' ? 'trending_up' : 'trending_down'}</SymbolIcon>
                </span>
              </div>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </Card>
          ))}
        </section>

        <section className="admin-visual-grid">
          <Card className="admin-panel admin-chart-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Xu Hướng Đơn Hàng</h3>
                <p className="admin-chart-subtitle">
                  {selectedMonth ? `Tháng ${selectedMonth}/${selectedYear}` : `Năm ${selectedYear}`}
                </p>
              </div>
              <div className="admin-trend-summary">
                <span><strong>{formatNumber(trendSummary.completed)}</strong> hoàn thành</span>
                <span><strong>{formatNumber(trendSummary.cancelled)}</strong> đã hủy</span>
              </div>
            </div>
            <div className="admin-chart admin-trend-chart">
              {bookingTrends.length > 0 ? (
                <>
                  <div className="admin-recharts-frame">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trendChartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }} barGap={6}>
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8228" stopOpacity={0.95}/>
                            <stop offset="95%" stopColor="#FFB884" stopOpacity={0.6}/>
                          </linearGradient>
                          <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7CDFFE" stopOpacity={0.95}/>
                            <stop offset="95%" stopColor="#B3F0FF" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#E9E0DB" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#818A91', fontSize: 12, fontWeight: 700 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#818A91', fontSize: 12, fontWeight: 700 }} width={34} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 130, 40, 0.06)' }} />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          formatter={(value) => value}
                        />
                        <Bar dataKey="completed" name="Hoàn thành" fill="url(#colorCompleted)" radius={[6, 6, 0, 0]} maxBarSize={22} />
                        <Bar dataKey="cancelled" name="Đã hủy" fill="url(#colorCancelled)" radius={[6, 6, 0, 0]} maxBarSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {trendSummary.total === 0 && (
                    <div className="admin-trend-zero-state">Chưa có đơn hoàn thành hoặc đã hủy trong khoảng thời gian này.</div>
                  )}
                </>
              ) : (
                <Empty description="Chưa có dữ liệu xu hướng" />
              )}
            </div>
          </Card>

          <Card className="admin-panel admin-category-panel">
            <div className="admin-panel-head">
              <h3>Danh Mục Dịch Vụ</h3>
            </div>
            {categoryStats.length > 0 ? (
              <div className="admin-category-panel-content">
                <div className="admin-category-chart-container" style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={78}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="admin-category-chart-center-label">
                    <p className="admin-category-center-name">{activeCategoryName}</p>
                    <p className="admin-category-center-value">{activeCategoryPercent}%</p>
                  </div>
                </div>
                <div className="admin-category-list">
                  {categoryStats.map((category, index) => (
                    <div
                      key={category.name}
                      className={`admin-category-item ${activeCategoryIndex === index ? 'admin-category-item-active-hover' : ''}`}
                      onMouseEnter={() => setActiveCategoryIndex(index)}
                    >
                      <div className="admin-category-item-info">
                        <span className="admin-category-bullet" style={{ backgroundColor: category.color }} />
                        <span className="admin-category-name">{category.name}</span>
                        <strong className="admin-category-percent">{category.value}%</strong>
                      </div>
                      <Progress
                        percent={category.value}
                        showInfo={false}
                        strokeColor={category.color}
                        trailColor="#FBF9F8"
                        size={6}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu dịch vụ" />
            )}
          </Card>
        </section>
      </Spin>
    </AdminShell>
  );
}
