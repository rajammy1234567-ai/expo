import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatApi, uploadApi } from '../services/api';
import { IBrand } from '../types';
import {
  X,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
  Paperclip,
  Maximize2,
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: IBrand | null;
  targetUserId?: string;
  targetUserName?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  brand,
  targetUserId,
  targetUserName,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Determine recipient
  const resolvedTargetUserId =
    targetUserId ||
    (brand?.ownerUserId as any)?._id ||
    (brand?.ownerUserId as any) ||
    '65e100000000000000000002'; // Chai Shai Express admin default

  const resolvedName =
    targetUserName ||
    brand?.brandName ||
    'Brand Leadership';

  const recipientOnline = isUserOnline(resolvedTargetUserId);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!isOpen || !user?._id) return;

    let isMounted = true;
    setLoading(true);

    const initChat = async () => {
      try {
        const res = await chatApi.startConversation(
          resolvedTargetUserId,
          brand?._id,
          user._id
        );
        if (isMounted && res.data.success && res.data.conversation) {
          const conv = res.data.conversation;
          setConversation(conv);

          // Join socket room
          if (socket) {
            socket.emit('join_conversation', conv._id);
          }

          // Fetch messages
          const msgRes = await chatApi.getMessages(conv._id);
          if (isMounted && msgRes.data.success) {
            setMessages(msgRes.data.messages || []);
          }

          // Mark as read
          chatApi.markAsRead(conv._id, user._id).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to init chat', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (socket && conversation?._id) {
        socket.emit('leave_conversation', conversation._id);
      }
    };
  }, [isOpen, user?._id, resolvedTargetUserId, brand?._id, socket]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    const handleMessageReceive = (msg: any) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
        if (user?._id && msg.receiverId === user._id) {
          chatApi.markAsRead(conversation._id, user._id).catch(() => {});
        }
      }
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversation._id && data.userId !== user?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversation._id && data.userId !== user?._id) {
        setIsTyping(false);
      }
    };

    const handleRead = (data: { conversationId: string; readByUserId: string }) => {
      if (data.conversationId === conversation._id && data.readByUserId !== user?._id) {
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
  }, [socket, conversation?._id, user?._id]);

  // Handle typing indicator trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !conversation?._id || !user?._id) return;

    socket.emit('message:typing', {
      conversationId: conversation._id,
      userId: user._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('message:stop-typing', {
        conversationId: conversation._id,
        userId: user._id,
      });
    }, 1500);
  };

  // Image Selection & Upload
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

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImagePreview) || !conversation?._id || !user?._id || sending) {
      return;
    }

    setSending(true);
    let uploadedUrl: string | undefined = undefined;

    try {
      if (selectedImagePreview) {
        setUploadingImage(true);
        const upRes = await uploadApi.uploadImage(selectedImagePreview);
        setUploadingImage(false);
        if (upRes.data.success) {
          uploadedUrl = upRes.data.url;
        }
      }

      const textToSend = inputText.trim();
      setInputText('');
      setSelectedImagePreview(null);

      const res = await chatApi.sendMessage(conversation._id, {
        senderId: user._id,
        receiverId: resolvedTargetUserId,
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
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar / Logo */}
            <div className="relative">
              {brand?.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={resolvedName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  {resolvedName.charAt(0)}
                </div>
              )}
              {/* Online Green Indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  recipientOnline ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{resolvedName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {brand ? 'Franchise Partner' : 'Direct Chat'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {recipientOnline ? (
                  <span className="text-emerald-400 font-medium">● Online now</span>
                ) : (
                  <span>Offline (will receive notification)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation?._id && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/chats/${conversation._id}`);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Expand to Full Inbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#07090e]/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">Connecting to secure chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                💬
              </div>
              <h4 className="text-sm font-bold text-white">Direct 1-on-1 Communication</h4>
              <p className="text-xs max-w-sm">
                Say hello! Inquire directly about territory exclusivity, unit economics,
                or share store location photos.
              </p>
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
                    className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-2 shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                    }`}
                  >
                    {/* Image Attachment */}
                    {msg.imageUrl && (
                      <div
                        onClick={() => setZoomedImage(msg.imageUrl)}
                        className="rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="max-h-60 w-full object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                    {/* Meta / Status */}
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

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-slate-800/60 px-3 py-1.5 rounded-full w-fit">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>{resolvedName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Attachment Preview */}
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
          className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950 flex items-center gap-2"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Attach Photo / Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${resolvedName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImagePreview) || sending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending || uploadingImage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Full Image Zoom Modal */}
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
