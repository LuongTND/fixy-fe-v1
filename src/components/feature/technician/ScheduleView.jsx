'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { App, DatePicker, Input, Modal, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { workerScheduleApi } from '@/apis/worker-schedule.api';
import { workerProfileApi } from '@/apis/worker-profile.api';

// dayOfWeek: 0=Sun, 1=Mon, …, 6=Sat  (matches API)
const DAY_META = [
  { dayOfWeek: 1, label: 'Thứ 2', short: 'T2' },
  { dayOfWeek: 2, label: 'Thứ 3', short: 'T3' },
  { dayOfWeek: 3, label: 'Thứ 4', short: 'T4' },
  { dayOfWeek: 4, label: 'Thứ 5', short: 'T5' },
  { dayOfWeek: 5, label: 'Thứ 6', short: 'T6' },
  { dayOfWeek: 6, label: 'Thứ 7', short: 'T7' },
  { dayOfWeek: 0, label: 'Chủ Nhật', short: 'CN' },
];

/** Build a lookup map: dayOfWeek → schedule row */
function buildScheduleMap(rows) {
  return Object.fromEntries((rows || []).map((r) => [r.dayOfWeek, r]));
}

/** Strip seconds from "HH:mm:ss" → "HH:mm" */
function trimTime(t) {
  if (!t) return '';
  return t.slice(0, 5);
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50 ${on ? 'bg-primary' : 'bg-[#DDDDDD]'}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-5' : 'left-1'}`}
      />
    </button>
  );
}

function TimeInput({ value, onChange, disabled }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-md border border-[#DDDDDD] bg-white px-2 py-1 text-sm font-semibold text-[#383838] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#9A9A9A]"
    />
  );
}

export function ScheduleView() {
  const { message } = App.useApp();
  const [workerProfileId, setWorkerProfileId] = useState(null);
  const [scheduleMap, setScheduleMap] = useState({});
  const [exceptions, setExceptions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingDay, setSavingDay] = useState(null); // dayOfWeek currently saving
  const [addingDayOff, setAddingDayOff] = useState(false);
  const [dayOffDate, setDayOffDate] = useState(null);
  const [dayOffReason, setDayOffReason] = useState('');
  const [removingDate, setRemovingDate] = useState(null);
  const [pendingDeleteDayOff, setPendingDeleteDayOff] = useState(null);

  const debounceRef = useRef({});

  // ── Fetch worker profile id ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoadingProfile(true);
    });

    workerProfileApi.getMe()
      .then((res) => {
        if (cancelled) return;
        const id = res?.data?.id || res?.id;
        if (id) setWorkerProfileId(id);
        else message.warning('Không tìm thấy hồ sơ kỹ thuật viên.');
      })
      .catch(() => {
        if (!cancelled) message.error('Không thể lấy hồ sơ cá nhân.');
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => { cancelled = true; };
  }, [message]);

  // ── Fetch weekly schedule + exceptions once we have the profile id ───────
  const refreshSchedule = useCallback(async (id) => {
    if (!id) return;
    setLoadingSchedule(true);
    try {
      const [weeklyRes, exceptionsRes] = await Promise.all([
        workerScheduleApi.getWeekly(id),
        workerScheduleApi.getExceptions(id),
      ]);
      setScheduleMap(buildScheduleMap(weeklyRes?.data || weeklyRes || []));
      setExceptions(exceptionsRes?.data || exceptionsRes || []);
    } catch {
      message.error('Không thể tải lịch làm việc.');
    } finally {
      setLoadingSchedule(false);
    }
  }, [message]);

  useEffect(() => {
    if (!workerProfileId) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (alive) refreshSchedule(workerProfileId);
    });

    return () => {
      alive = false;
    };
  }, [workerProfileId, refreshSchedule]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getRow = (dayOfWeek) => scheduleMap[dayOfWeek] || { dayOfWeek, isActive: false, startTime: null, endTime: null };

  /** Immediately persist one field change to the API */
  const saveDay = useCallback(async (dayOfWeek, patch) => {
    if (!workerProfileId) return;
    const current = getRow(dayOfWeek);
    const next = { ...current, ...patch };

    // Optimistic UI — mirror the same default-time logic used in the API payload
    setScheduleMap((prev) => {
      const merged = { ...(prev[dayOfWeek] || {}), ...patch };
      if (merged.isActive && !merged.startTime) {
        merged.startTime = '08:00:00';
        merged.endTime   = '17:00:00';
      }
      return { ...prev, [dayOfWeek]: merged };
    });

    setSavingDay(dayOfWeek);
    try {
      await workerScheduleApi.updateDay(workerProfileId, {
        dayOfWeek: next.dayOfWeek,
        startTime: next.isActive ? (next.startTime || '08:00:00') : null,
        endTime: next.isActive ? (next.endTime || '17:00:00') : null,
        isActive: next.isActive,
      });
    } catch {
      message.error('Lưu lịch thất bại, vui lòng thử lại.');
      // Rollback
      setScheduleMap((prev) => ({ ...prev, [dayOfWeek]: current }));
    } finally {
      setSavingDay(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerProfileId, scheduleMap, message]);

  /** Debounce time input saves (300ms after user stops typing) */
  const handleTimeChange = (dayOfWeek, field, value) => {
    // Instant local update
    setScheduleMap((prev) => ({
      ...prev,
      [dayOfWeek]: { ...(prev[dayOfWeek] || {}), [field]: value ? `${value}:00` : null },
    }));

    clearTimeout(debounceRef.current[`${dayOfWeek}-${field}`]);
    debounceRef.current[`${dayOfWeek}-${field}`] = setTimeout(() => {
      saveDay(dayOfWeek, { [field]: value ? `${value}:00` : null });
    }, 600);
  };

  // ── Day-off ──────────────────────────────────────────────────────────────
  const handleAddDayOff = async () => {
    if (!dayOffDate) { message.warning('Vui lòng chọn ngày nghỉ.'); return; }
    if (!workerProfileId) return;
    setAddingDayOff(true);
    try {
      await workerScheduleApi.addDayOff(workerProfileId, {
        date: dayOffDate.format('YYYY-MM-DD'),
        reason: dayOffReason || 'Nghỉ phép',
      });
      message.success('Đã thêm ngày nghỉ.');
      setDayOffDate(null);
      setDayOffReason('');
      refreshSchedule(workerProfileId);
    } catch {
      message.error('Không thể thêm ngày nghỉ.');
    } finally {
      setAddingDayOff(false);
    }
  };

  const handleRequestRemoveDayOff = (exception) => {
    setPendingDeleteDayOff(exception);
  };

  const handleCancelRemoveDayOff = () => {
    if (removingDate) return;
    setPendingDeleteDayOff(null);
  };

  const handleRemoveDayOff = async () => {
    const dateStr = pendingDeleteDayOff?.date || pendingDeleteDayOff?.Date;
    if (!workerProfileId) return;
    if (!dateStr) return;
    setRemovingDate(dateStr);
    try {
      await workerScheduleApi.removeDayOff(workerProfileId, dateStr);
      setPendingDeleteDayOff(null);
      message.success('Đã xoá ngày nghỉ.');
      refreshSchedule(workerProfileId);
    } catch {
      message.error('Không thể xoá ngày nghỉ.');
    } finally {
      setRemovingDate(null);
    }
  };

  // ── Stats derived from scheduleMap ───────────────────────────────────────
  const activeCount = Object.values(scheduleMap).filter((r) => r.isActive).length;
  const totalHours = Object.values(scheduleMap)
    .filter((r) => r.isActive && r.startTime && r.endTime)
    .reduce((acc, r) => {
      const [sh, sm] = r.startTime.split(':').map(Number);
      const [eh, em] = r.endTime.split(':').map(Number);
      return acc + (eh * 60 + em - sh * 60 - sm) / 60;
    }, 0);

  if (loadingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
    <main className="mx-auto max-w-[1400px] grid grid-cols-12 gap-5 p-5 md:p-6">

      {/* ── LEFT (8 cols): Weekly schedule ── */}
      <div className="col-span-12 space-y-5 lg:col-span-8">

        {/* Header */}
        <section className="rounded-xl border border-border-light bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
            <h2 className="m-0 text-xl font-bold text-[#383838]">Lịch làm việc tuần</h2>
          </div>
          <p className="m-0 text-sm text-[#777777]">Bật/tắt từng ngày và điều chỉnh giờ bắt đầu — kết thúc. Thay đổi được lưu tự động.</p>
        </section>

        {/* Weekly grid */}
        <section className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
          {loadingSchedule ? (
            <div className="flex h-48 items-center justify-center">
              <Spin />
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {DAY_META.map(({ dayOfWeek, label }) => {
                const row = getRow(dayOfWeek);
                const isSaving = savingDay === dayOfWeek;
                const isOn = row.isActive;
                return (
                  <div
                    key={dayOfWeek}
                    className={`flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${isOn ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  >
                    {/* Left: toggle + label */}
                    <div className="flex items-center gap-3">
                      <Toggle
                        on={isOn}
                        disabled={isSaving}
                        onChange={(val) => saveDay(dayOfWeek, { isActive: val })}
                      />
                      <span className={`w-20 text-sm font-bold ${isOn ? 'text-[#383838]' : 'text-[#9A9A9A]'}`}>
                        {label}
                      </span>
                      {isSaving && <Spin size="small" />}
                    </div>

                    {/* Right: time pickers or "Nghỉ" */}
                    {isOn ? (
                      <div className="flex items-center gap-2">
                        <TimeInput
                          value={trimTime(row.startTime) || '08:00'}
                          disabled={isSaving}
                          onChange={(v) => handleTimeChange(dayOfWeek, 'startTime', v)}
                        />
                        <span className="text-sm font-bold text-[#9A9A9A]">–</span>
                        <TimeInput
                          value={trimTime(row.endTime) || '17:00'}
                          disabled={isSaving}
                          onChange={(v) => handleTimeChange(dayOfWeek, 'endTime', v)}
                        />
                        <span className="hidden text-xs text-[#9A9A9A] sm:inline">
                          {(() => {
                            const s = row.startTime || '08:00:00';
                            const e = row.endTime || '17:00:00';
                            const [sh, sm2] = s.split(':').map(Number);
                            const [eh, em] = e.split(':').map(Number);
                            const h = ((eh * 60 + em) - (sh * 60 + sm2)) / 60;
                            return h > 0 ? `${h}h` : '';
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm italic text-[#9A9A9A]">Nghỉ</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Day-off exceptions */}
        <section className="rounded-xl border border-border-light bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">event_busy</span>
            <h3 className="m-0 text-base font-bold text-[#383838]">Ngày nghỉ đặc biệt</h3>
          </div>

          {/* Add day-off form */}
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-dashed border-[#DDDDDD] bg-[#FAFAFA] p-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#777777]">Ngày nghỉ</label>
              <DatePicker
                value={dayOffDate}
                onChange={setDayOffDate}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(d) => d && d < dayjs().startOf('day')}
                className="h-[37px] w-full"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#777777]">Lý do</label>
              <Input
                value={dayOffReason}
                onChange={(e) => setDayOffReason(e.target.value)}
                placeholder="Nghỉ phép, việc gia đình..."
                className="h-[37px]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddDayOff}
              disabled={addingDayOff || !dayOffDate}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#FF8228] px-4 py-[7px] text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addingDayOff ? <Spin size="small" /> : <span className="material-symbols-outlined text-[18px]">add</span>}
              Thêm ngày nghỉ
            </button>
          </div>

          {/* Exception list */}
          {exceptions.length === 0 ? (
            <p className="m-0 text-sm text-[#9A9A9A]">Chưa có ngày nghỉ đặc biệt nào được đăng ký.</p>
          ) : (
            <div className="space-y-2">
              {exceptions.map((ex) => {
                const dateStr = ex.date || ex.Date;
                return (
                  <div key={dateStr} className="flex items-center justify-between rounded-lg border border-[#EEEEEE] bg-[#FBF9F8] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px]">event_busy</span>
                      <div>
                        <p className="m-0 text-sm font-bold text-[#383838]">
                          {dayjs(dateStr).format('DD/MM/YYYY')} ({dayjs(dateStr).format('dddd')})
                        </p>
                        {ex.reason && <p className="m-0 text-xs text-[#777777]">{ex.reason}</p>}
                      </div>
                    </div>
                    <Tooltip title="Xoá ngày nghỉ">
                      <button
                        type="button"
                        onClick={() => handleRequestRemoveDayOff(ex)}
                        disabled={removingDate === dateStr}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#EA4335] transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {removingDate === dateStr
                          ? <Spin size="small" />
                          : <span className="material-symbols-outlined text-[18px]">delete</span>}
                      </button>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── RIGHT (4 cols): Stats ── */}
      <div className="col-span-12 space-y-5 lg:col-span-4">

        {/* Quick stats */}
        <section className="rounded-xl border border-border-light bg-white p-5 shadow-sm">
          <h3 className="m-0 mb-4 text-base font-bold text-[#383838]">Thống kê tuần này</h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="material-symbols-outlined text-primary text-[22px] material-symbols-filled">timer</span>
              </div>
              <p className="m-0 text-xs text-[#777777]">Tổng giờ làm / tuần</p>
              <h4 className="m-0 mt-1 text-3xl font-bold text-[#383838]">
                {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}
                <span className="ml-1 text-base font-semibold text-[#555555]">giờ</span>
              </h4>
            </div>
            <div className="rounded-xl border border-[#DDDDDD] bg-[#FAFAFA] p-4">
              <div className="mb-2">
                <span className="material-symbols-outlined text-[#FF8228] text-[22px] material-symbols-filled">today</span>
              </div>
              <p className="m-0 text-xs text-[#777777]">Số ngày làm việc</p>
              <h4 className="m-0 mt-1 text-3xl font-bold text-[#383838]">
                {activeCount}
                <span className="ml-1 text-base font-semibold text-[#555555]">ngày</span>
              </h4>
            </div>
            <div className="rounded-xl border border-[#DDDDDD] bg-[#FAFAFA] p-4">
              <div className="mb-2">
                <span className="material-symbols-outlined text-[#9A9A9A] text-[22px] material-symbols-filled">beach_access</span>
              </div>
              <p className="m-0 text-xs text-[#777777]">Ngày nghỉ đã đăng ký</p>
              <h4 className="m-0 mt-1 text-3xl font-bold text-[#383838]">
                {exceptions.length}
                <span className="ml-1 text-base font-semibold text-[#555555]">ngày</span>
              </h4>
            </div>
          </div>
        </section>

        {/* Tips card */}
        <section className="rounded-xl border border-border-light bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
            <h3 className="m-0 text-base font-bold text-[#383838]">Mẹo tối ưu lịch</h3>
          </div>
          <ul className="m-0 space-y-2 pl-0">
            {[
              'Bật thêm ngày cuối tuần để nhận nhiều đơn hơn.',
              'Giờ cao điểm 8h–11h và 14h–17h thường có nhiều booking.',
              'Đăng ký ngày nghỉ sớm để tránh bỏ lỡ đơn hàng.',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-[#555555]">
                <span className="mt-0.5 shrink-0 text-primary material-symbols-outlined text-[16px]">check_circle</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
    <Modal
      open={Boolean(pendingDeleteDayOff)}
      title={(
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F0] text-[#EA4335]">
            <span className="material-symbols-outlined text-[20px]">event_busy</span>
          </span>
          <div>
            <p className="m-0 text-lg font-bold text-[#1b1c1c]">Xoá ngày nghỉ?</p>
            <p className="m-0 mt-1 text-xs font-medium text-[#818A91]">Ngày này sẽ được mở lại để nhận lịch đặt dịch vụ.</p>
          </div>
        </div>
      )}
      centered
      width={460}
      okText="Xoá ngày nghỉ"
      cancelText="Huỷ"
      okButtonProps={{
        danger: true,
        loading: Boolean(removingDate),
        className: '!font-bold',
      }}
      cancelButtonProps={{
        disabled: Boolean(removingDate),
      }}
      onOk={handleRemoveDayOff}
      onCancel={handleCancelRemoveDayOff}
      maskClosable={!removingDate}
      closable={!removingDate}
    >
      {pendingDeleteDayOff && (
        <div className="rounded-xl border border-[#F1D5CD] bg-[#FFF8F5] p-4">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-[#818A91]">Ngày nghỉ</p>
          <p className="m-0 mt-1 text-base font-bold text-[#1b1c1c]">
            {dayjs(pendingDeleteDayOff.date || pendingDeleteDayOff.Date).format('DD/MM/YYYY')}
          </p>
          {(pendingDeleteDayOff.reason || pendingDeleteDayOff.Reason) && (
            <p className="m-0 mt-2 text-sm leading-6 text-[#555555]">
              {pendingDeleteDayOff.reason || pendingDeleteDayOff.Reason}
            </p>
          )}
        </div>
      )}
    </Modal>
    </>
  );
}
