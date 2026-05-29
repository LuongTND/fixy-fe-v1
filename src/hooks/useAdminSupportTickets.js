import { useCallback, useState } from 'react';
import { adminSupportTicketApi, supportTicketApi } from '@/apis/support.api';
import { extractCollectionPayload } from '@/utils/helpers';

export function useAdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const loadTickets = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const payload = await adminSupportTicketApi.getAll(params);
      const next = extractCollectionPayload(payload);
      setTickets(next.items);
      setMeta({
        pageNumber: next.pageNumber,
        pageSize: next.pageSize,
        totalCount: next.totalCount,
      });
      return next;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTicketDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const payload = await adminSupportTicketApi.getById(id);
      setSelectedTicket(payload);
      return payload;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (id, params = {}) => {
    setMessagesLoading(true);
    try {
      const payload = await supportTicketApi.getMessages(id, params);
      const next = extractCollectionPayload(payload);
      setMessages(next.items);
      return next;
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const loadTicketConversation = useCallback(async (id) => {
    const [detail, messagePage] = await Promise.all([
      loadTicketDetail(id),
      loadMessages(id, {
        PageNumber: 1,
        PageSize: 50,
        SortBy: 'CreatedDate',
        SortDescending: false,
      }),
    ]);

    return { detail, messages: messagePage.items };
  }, [loadMessages, loadTicketDetail]);

  const assignTicket = useCallback(async (id) => {
    setActing(true);
    try {
      return await adminSupportTicketApi.assign(id);
    } finally {
      setActing(false);
    }
  }, []);

  const updateTicketStatus = useCallback(async (id, payload) => {
    setActing(true);
    try {
      return await adminSupportTicketApi.updateStatus(id, payload);
    } finally {
      setActing(false);
    }
  }, []);

  const sendAdminMessage = useCallback(async (id, content) => {
    setActing(true);
    try {
      return await adminSupportTicketApi.sendMessage(id, { content });
    } finally {
      setActing(false);
    }
  }, []);

  return {
    tickets,
    messages,
    selectedTicket,
    meta,
    loading,
    detailLoading,
    messagesLoading,
    acting,
    setSelectedTicket,
    setMessages,
    loadTickets,
    loadTicketDetail,
    loadMessages,
    loadTicketConversation,
    assignTicket,
    updateTicketStatus,
    sendAdminMessage,
  };
}
