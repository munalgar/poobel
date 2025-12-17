'use client';

import { useState } from 'react';
import { usePoobelStore } from '@poobel/shared-data';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Bell,
  Users,
  Filter,
} from 'lucide-react';

export default function MessagesPage() {
  const drivers = usePoobelStore((state) => state.drivers);
  const messages = usePoobelStore((state) => state.messages);
  const sendMessage = usePoobelStore((state) => state.sendMessage);

  const [selectedDriver, setSelectedDriver] = useState<string | null>(drivers[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDriverData = drivers.find((d) => d.id === selectedDriver);
  const driverMessages = messages
    .filter(
      (m) =>
        (m.senderId === selectedDriver || m.receiverId === selectedDriver) &&
        (m.senderType === 'dispatch' || m.receiverType === 'dispatch')
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDriver) return;

    sendMessage({
      senderId: 'dispatch',
      senderType: 'dispatch',
      receiverId: selectedDriver,
      receiverType: 'driver',
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUnreadCount = (driverId: string) => {
    return messages.filter(
      (m) => m.senderId === driverId && m.receiverType === 'dispatch' && !m.read
    ).length;
  };

  const statusColors: Record<string, string> = {
    en_route: 'var(--accent-info)',
    at_stop: 'var(--accent-warning)',
    completed: 'var(--accent-primary)',
    available: 'var(--accent-purple)',
    offline: 'var(--text-muted)',
  };

  return (
    <div className="flex h-screen">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Messages</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5"
            />
          </div>
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDrivers.map((driver) => {
            const lastMessage = messages
              .filter(
                (m) =>
                  (m.senderId === driver.id || m.receiverId === driver.id) &&
                  (m.senderType === 'dispatch' || m.receiverType === 'dispatch')
              )
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            const unreadCount = getUnreadCount(driver.id);

            return (
              <div
                key={driver.id}
                className={`p-4 cursor-pointer transition-all border-l-2 ${
                  selectedDriver === driver.id
                    ? 'bg-[var(--bg-tertiary)] border-l-[var(--accent-primary)]'
                    : 'border-l-transparent hover:bg-[var(--bg-hover)]'
                }`}
                onClick={() => setSelectedDriver(driver.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)] flex items-center justify-center text-white font-semibold">
                      {driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-secondary)]"
                      style={{ backgroundColor: statusColors[driver.status] }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[var(--text-primary)] truncate">{driver.name}</p>
                      {lastMessage && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {lastMessage?.content || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-[var(--accent-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Broadcast Button */}
        <div className="p-4 border-t border-[var(--border-primary)]">
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            Broadcast to All
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedDriverData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)] flex items-center justify-center text-white font-semibold">
                    {selectedDriverData.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)]"
                    style={{ backgroundColor: statusColors[selectedDriverData.status] }}
                  />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{selectedDriverData.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedDriverData.vehiclePlate} · {selectedDriverData.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {driverMessages.length > 0 ? (
                driverMessages.map((message) => {
                  const isFromDispatch = message.senderType === 'dispatch';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromDispatch ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl ${
                          isFromDispatch
                            ? 'bg-[var(--accent-primary)] text-white rounded-br-md'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border-primary)]'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isFromDispatch ? 'text-white/70' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          <span className="text-xs">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isFromDispatch && (
                            message.read ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-[var(--text-secondary)]">No messages yet</p>
                    <p className="text-sm text-[var(--text-muted)]">Start the conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pr-12"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className={`p-3 rounded-xl transition-all ${
                    newMessage.trim()
                      ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                  }`}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)]">Select a driver to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

