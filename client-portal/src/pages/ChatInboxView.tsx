import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatApi, uploadApi } from '../services/api';
import {
  Search,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Loader2,
  X,
  ArrowLeft,
  Building2,
  UserCircle,
} from 'lucide-react';

export const ChatInboxView: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isUserOnline, refreshConversations } = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Fetch all conversations
  const loadConversations = async () => {
    if (!user?._id) return;
    try {
      const res = await chatApi.getConversations(user._id);
      if (res.data.success && res.data.conversations) {
        setConversations(res.data.conversations);

        // Select initial conversation
        if (conversationId) {
          const found = res.data.conversations.find((c: any) => c._id === conversationId);
          if (found) setActiveConv(found);
        } else if (res.data.conversations.length > 0 && window.innerWidth > 768) {
          setActiveConv(res.data.conversations[0]);
          navigate(`/chats/${res.data.conversations[0]._id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?._id]);

  // Load messages when activeConv changes
  useEffect(() => {
    if (!activeConv?._id || !user?._id) return;

    let isMounted = true;
    setLoadingMessages(true);

    if (socket) {
      socket.emit('join_conversation', activeConv._id);
    }

    chatApi
      .getMessages(activeConv._id)
      .then((res) => {
        if (isMounted && res.data.success) {
          setMessages(res.data.messages || []);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    // Mark as read
    chatApi.markAsRead(activeConv._id, user._id).then(() => {
      refreshConversations();
    });

    return () => {
      isMounted = false;
      if (socket) {
        socket.emit('leave_conversation', activeConv._id);
      }
    };
  }, [activeConv?._id, user?._id, socket]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Socket event handling
  useEffect(() => {
    if (!socket || !activeConv?._id) return;

    const handleMessageReceive = (msg: any) => {
      if (msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
        if (user?._id && msg.receiverId === user._id) {
          chatApi.markAsRead(activeConv._id, user._id).catch(() => {});
        }
      }

      // Update conversation list lastMessage
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.text || '📷 Photo shared',
                lastMessageAt: msg.createdAt,
              }
            : c
        )
      );
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConv._id && data.userId !== user?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConv._id && data.userId !== user?._id) {
        setIsTyping(false);
      }
    };

    const handleRead = (data: { conversationId: string; readByUserId: string }) => {
      if (data.conversationId === activeConv._id && data.readByUserId !== user?._id) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?._id ? { ...m, status: 'SEEN' } : m))
        );
      }
    };

    socket.on('message:receive', handleMessageReceive);
    socket.on('message:typing', handleTyping);
    socket.on('message:stop-typing', handleStopTyping);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:receive', handleMessageReceive);
      socket.off('message:typing', handleTyping);
      socket.off('message:stop-typing', handleStopTyping);
      socket.off('message:read', handleRead);
    };
  }, [socket, activeConv?._id, user?._id]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeConv?._id || !user?._id) return;

    socket.emit('message:typing', {
      conversationId: activeConv._id,
      userId: user._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('message:stop-typing', {
        conversationId: activeConv._id,
        userId: user._id,
      });
    }, 1500);
  };

  // Image Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setSelectedImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImagePreview) || !activeConv?._id || !user?._id || sending) {
      return;
    }

    const otherParticipant = activeConv.participants.find(
      (p: any) => p._id !== user._id && p !== user._id
    );
    const receiverId = otherParticipant?._id || otherParticipant || '65e100000000000000000002';

    setSending(true);
    let uploadedUrl: string | undefined = undefined;

    try {
      if (selectedImagePreview) {
        const upRes = await uploadApi.uploadImage(selectedImagePreview);
        if (upRes.data.success) {
          uploadedUrl = upRes.data.url;
        }
      }

      const textToSend = inputText.trim();
      setInputText('');
      setSelectedImagePreview(null);

      const res = await chatApi.sendMessage(activeConv._id, {
        senderId: user._id,
        receiverId,
        text: textToSend,
        imageUrl: uploadedUrl,
      });

      if (res.data.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    const otherParticipant = c.participants.find((p: any) => p._id !== user?._id && p !== user?._id);
    const name = otherParticipant?.name || c.relatedBrandId?.brandName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipant = (conv: any) => {
    if (!conv?.participants) return null;
    return conv.participants.find((p: any) => p._id !== user?._id && p !== user?._id);
  };

  const activeOtherUser = getOtherParticipant(activeConv);
  const activeIsOnline = activeOtherUser ? isUserOnline(activeOtherUser._id || activeOtherUser) : false;

  return (
    <div className="h-[calc(100vh-8.5rem)] rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex overflow-hidden backdrop-blur-xl">
      {/* Left Sidebar: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/70 ${
          activeConv && window.innerWidth < 768 ? 'hidden' : 'flex'
        }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Direct Messaging</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {conversations.length} chats
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {loadingConvs ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <span>Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <span>No conversations found.</span>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const otherId = other?._id || other;
              const online = isUserOnline(otherId);
              const isSelected = activeConv?._id === conv._id;
              const unread = conv.unreadCount?.[user?._id || ''] || 0;

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    setActiveConv(conv);
                    navigate(`/chats/${conv._id}`);
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-950/40 border-l-4 border-blue-500' : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Avatar with Online Dot */}
                  <div className="relative shrink-0">
                    {conv.relatedBrandId?.logoUrl ? (
                      <img
                        src={conv.relatedBrandId.logoUrl}
                        alt="Brand"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        {(other?.name || 'U').charAt(0)}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        online ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {other?.name || conv.relatedBrandId?.brandName || 'User'}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-slate-400 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-[#07090e]/60 ${
          !activeConv && window.innerWidth < 768 ? 'hidden' : 'flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  {activeConv.relatedBrandId?.logoUrl ? (
                    <img
                      src={activeConv.relatedBrandId.logoUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white">
                      {(activeOtherUser?.name || 'U').charAt(0)}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                      activeIsOnline ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeOtherUser?.name || activeConv.relatedBrandId?.brandName || 'User'}
                    </h3>
                    {activeConv.relatedBrandId && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {activeConv.relatedBrandId.brandName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {activeIsOnline ? (
                      <span className="text-emerald-400 font-medium">● Online</span>
                    ) : (
                      'Offline (will receive notification)'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 opacity-30" />
                  <p className="text-xs">No messages yet. Send a greeting to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[65%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-2 shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                        }`}
                      >
                        {msg.imageUrl && (
                          <div
                            onClick={() => setZoomedImage(msg.imageUrl)}
                            className="rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                          >
                            <img
                              src={msg.imageUrl}
                              alt="Attached"
                              className="max-h-72 w-full object-cover rounded-xl"
                            />
                          </div>
                        )}

                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-white/70 pt-0.5">
                          <span>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            <span>
                              {msg.status === 'SEEN' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-slate-800/60 px-3 py-1.5 rounded-full w-fit">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selected Image Preview */}
            {selectedImagePreview && (
              <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImagePreview}
                    alt="Upload preview"
                    className="w-12 h-12 rounded-xl object-cover border border-blue-500/40 shadow"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white">Image attached</span>
                    <p className="text-[10px] text-slate-400">Ready to send</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImagePreview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                title="Attach Photo / Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedImagePreview) || sending}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3 p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Select a Conversation</h3>
            <p className="text-xs max-w-sm text-center">
              Connect directly with verified franchisors, discuss territory availability, and review franchise documents in real time.
            </p>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 cursor-pointer"
        >
          <img
            src={zoomedImage}
            alt="Zoomed attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
