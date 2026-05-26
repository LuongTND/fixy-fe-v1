'use client';
import { useState } from 'react';

const CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Trần Thị Hương',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANMSpTikGRVMtbzJ2M224lpHhCoPJ1ZXUYOMPRGXTP0VWfnQVXcNE3ajUZh7AwJiN5-f9XFoUDzMjWbeHGnAsogs6eS1nTjLctrYER4Wroyu0_JYY32IRxeYovvaVd7VFlOUF9YAOPs2cSlsxW8QV-cJU6TxY8QOQv6pe02w9vXmXlX1sWTpqd4k9zzpZULvohP-YElqEXoZivuzfteZlp9E27mNsWgXJPFY1gcEWioIM3752yCSnwMFSTGma0PHnQrExBL5CJIaU',
    online: true,
    lastMessage: 'Anh ơi tới chưa? Em đang ở nhà chờ.',
    time: '10:45',
    jobId: 'VT-2841',
    active: true,
  },
  {
    id: 'conv-2',
    name: 'Nguyễn Minh Tuấn',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtIV-hYawK5E89qRMI9fLkg5w2fXzN7xIWI1WcmKkXNtHF2elqfDHmZoqOtNSCdM8wnWfh4N-G3ktn-WnPuqCTy1IR34FpO93ZhGJWYlhlJp1Sj-yQfAoykTbJ5BeE50nQZVtwmg1uYDNq2ZUQOEGe9gLGk4glm3M-JdiGOI5R8IMY7aY9jugIasXzkgHuruBFSPD_FhKpW56m6K54zMzwInfUquIG9_8ZT_2Wv8Om8lyOV_SCaOASRVU6ud1g-SJqEO8TjFjfXRs',
    online: false,
    lastMessage: 'Gửi anh ảnh sơ đồ điện phòng khách rồi nhé.',
    time: 'Hôm qua',
    jobId: null,
    active: false,
  },
  {
    id: 'conv-3',
    name: 'Lê Thanh Nga',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlxhO5VUcK8NBlmzJGZVYLDlTXOZq17E82DtM1LqIjDaHoRIil_bbMyuXLBue7i_2xbdt29MhsRq5Z1yRWGY7i2nQDJI6jwyRE-1LYoKSUXtN_eK6aCbf0ZC0lD4H0MpWUW32uJ7CZNREWyuxchXs41yehBGqp4FlZqEmvK4j-JkhIB8-3hu15BAOHcS4bY6_qLe79Cw-naf_SqqeMOhupcB75b1mIVCr3ZFclgHP1J5f08vgfl6LnzxaY11FLLN3YcowPeJZeIt0',
    online: false,
    lastMessage: 'Thanh toán hoàn tất. Cảm ơn anh!',
    time: 'T3',
    jobId: 'VT-2839',
    completed: true,
    active: false,
  },
];

const MESSAGES = [
  { type: 'system', text: 'Đơn hàng #VT-2841 bắt đầu ngày 24/10/2024' },
  {
    type: 'received', text: 'Anh ơi, em đã xem ảnh bảng điện rồi. Em sẽ mang cầu chì đúng loại đã trao đổi nhé.',
    time: '10:42', avatar: CONVERSATIONS[0].avatar,
  },
  {
    type: 'sent', text: 'Ok chị, cảm ơn chị. Đây là lối vào bãi xe chị nên đi.',
    time: '10:44',
  },
  {
    type: 'received', time: '10:45', avatar: CONVERSATIONS[0].avatar,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAii93qDALwHiz7odWzSsJlxUZdZUcrc3h1W5fUsQjErkz2UjTCCGrAbPm_I0bU_2-3nnYAcVkzdSDhqAHTZPRqYCHJnk0tmPW1dsVejJu1wyDGn-zFy1yoCncwavbailzXlVhWxDhA8qGWHiQvEp61dpyrKyWCCDObWNzf5wrg-FMAKllDGRUFIh1bLWofwKj44d6LjxT0AhmymLR4JYDquHG13aBuGlfmh9U9_bgl08X_As_aqGv4opSDLIhxhrfVVrTdTPzFwtk',
    text: 'Đây có đúng model bảng điện nhà chị không? Em muốn kiểm tra lại rail.',
  },
  {
    type: 'sent', voice: true, duration: '0:14', progress: 33,
    time: '10:46',
  },
];

export function ChatView() {
  const [selectedConv, setSelectedConv] = useState('conv-1');
  const [chatTab, setChatTab] = useState('active');
  const [message, setMessage] = useState('');

  const currentConv = CONVERSATIONS.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left: Conversations sidebar ── */}
      <aside className="w-[340px] shrink-0 flex flex-col border-r border-outline-variant bg-white hidden md:flex">
        {/* Header + search */}
        <div className="p-md border-b border-outline-variant">
          <h2 className="font-h3 mb-sm">Tin nhắn</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
            <input
              type="text"
              placeholder="Tìm cuộc trò chuyện..."
              className="w-full pl-9 pr-sm py-2 rounded-[8px] border border-border-medium text-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none bg-surface-container-low"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setChatTab('active')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${chatTab === 'active' ? 'text-primary-container border-b-2 border-primary-container' : 'text-text-tertiary hover:bg-surface-variant'}`}
          >Đang hoạt động</button>
          <button
            onClick={() => setChatTab('archive')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${chatTab === 'archive' ? 'text-primary-container border-b-2 border-primary-container' : 'text-text-tertiary hover:bg-surface-variant'}`}
          >Lưu trữ</button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {CONVERSATIONS.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`p-md flex gap-sm cursor-pointer transition-colors ${
                selectedConv === conv.id
                  ? 'bg-primary-fixed border-l-4 border-primary-container'
                  : 'hover:bg-surface-variant border-l-4 border-transparent'
              } ${conv.completed ? 'opacity-60' : ''}`}
            >
              <div className="relative shrink-0">
                <img src={conv.avatar} alt={conv.name} className={`w-11 h-11 rounded-full object-cover ${conv.completed ? 'grayscale' : ''}`} />
                {conv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="font-small-bold truncate">{conv.name}</span>
                  {conv.completed
                    ? <span className="material-symbols-outlined text-success text-[16px] material-symbols-filled">check_circle</span>
                    : <span className="text-[11px] text-text-muted">{conv.time}</span>
                  }
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">{conv.lastMessage}</p>
                {conv.jobId && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase">{conv.jobId}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: Chat window ── */}
      <section className="flex-1 flex flex-col bg-surface-container-low">

        {/* Chat header */}
        <header className="px-md py-sm border-b border-outline-variant flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-sm">
            <img src={currentConv?.avatar} alt={currentConv?.name} className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h3 className="font-small-bold leading-tight">{currentConv?.name}</h3>
              {currentConv?.online && (
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <button
              onClick={() => alert('Tính năng gọi ẩn danh đang được phát triển.')}
              className="flex items-center gap-1 bg-[#9a4600] text-white px-sm py-1.5 rounded-full text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span className="hidden sm:inline">Gọi ẩn danh</span>
            </button>
            <button className="p-1.5 text-text-secondary hover:bg-surface-variant rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-sm md:p-md flex flex-col gap-md custom-scrollbar">
          {MESSAGES.map((msg, i) => {
            if (msg.type === 'system') {
              return (
                <div key={i} className="flex justify-center">
                  <span className="bg-surface-container px-sm py-1 rounded-[8px] text-xs text-text-tertiary">{msg.text}</span>
                </div>
              );
            }

            if (msg.type === 'received') {
              return (
                <div key={i} className="flex gap-xs max-w-[92%] md:max-w-[75%]">
                  <img src={msg.avatar} alt="" className="w-7 h-7 rounded-full object-cover mt-auto shrink-0" />
                  <div className="bg-white p-sm rounded-xl rounded-bl-none shadow-sm border border-outline-variant">
                    {msg.image && (
                      <img src={msg.image} alt="Ảnh đính kèm" className="rounded-[8px] w-full max-w-[280px] h-auto object-cover mb-xs" />
                    )}
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                    <span className="text-[10px] text-text-muted mt-1 block">{msg.time}</span>
                  </div>
                </div>
              );
            }

            if (msg.type === 'sent') {
              if (msg.voice) {
                return (
                  <div key={i} className="flex flex-row-reverse gap-xs max-w-[92%] md:max-w-[75%] self-end">
                    <div className="bg-primary-container p-sm rounded-xl rounded-br-none shadow-sm flex items-center gap-sm w-[220px] sm:w-[240px] max-w-full">
                      <button className="w-8 h-8 rounded-full bg-on-primary-container text-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] material-symbols-filled">play_arrow</span>
                      </button>
                      <div className="flex-1 h-1 bg-white/20 rounded-full relative">
                        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white" />
                      </div>
                      <span className="text-[11px] text-white/80">{msg.duration}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="flex flex-row-reverse gap-xs max-w-[92%] md:max-w-[75%] self-end">
                  <div className="bg-primary-container p-sm rounded-xl rounded-br-none shadow-sm">
                    <p className="text-sm text-white">{msg.text}</p>
                    <span className="text-[10px] text-white/70 mt-1 block text-right">{msg.time}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Input */}
        <footer className="p-sm bg-white border-t border-outline-variant shrink-0">
          <div className="flex items-end gap-xs">
            <div className="flex gap-0.5 mb-1">
              <button className="p-1.5 text-[#9a4600] hover:bg-primary-fixed rounded-full transition-colors" title="Gửi ảnh">
                <span className="material-symbols-outlined text-[22px]">image</span>
              </button>
              <button className="p-1.5 text-[#9a4600] hover:bg-primary-fixed rounded-full transition-colors" title="Tin nhắn thoại">
                <span className="material-symbols-outlined text-[22px]">mic</span>
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-2 pr-10 rounded-[10px] border border-border-medium text-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none bg-surface-container-low resize-none max-h-28 custom-scrollbar"
                placeholder="Nhập tin nhắn..."
                rows={1}
              />
              <button className="absolute right-2 bottom-2 text-primary-container active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-[22px] material-symbols-filled">send</span>
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
