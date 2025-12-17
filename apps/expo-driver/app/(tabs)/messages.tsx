import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePoobelStore, useCurrentDriver, useDriverMessages } from '@poobel/shared-data';
import { Colors } from '../../constants/Colors';

export default function MessagesScreen() {
  const currentDriver = useCurrentDriver();
  const messages = currentDriver ? useDriverMessages(currentDriver.id) : [];
  const customers = usePoobelStore((state) => state.customers);
  const sendMessage = usePoobelStore((state) => state.sendMessage);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<'dispatch' | string>('dispatch');

  const dispatchMessages = messages.filter(
    (m) => m.senderType === 'dispatch' || m.receiverType === 'dispatch'
  );

  const customerMessages = messages.filter(
    (m) => m.senderType === 'customer' || m.receiverType === 'customer'
  );

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Customer';
  };

  const handleSend = () => {
    if (!newMessage.trim() || !currentDriver) return;

    sendMessage({
      senderId: currentDriver.id,
      senderType: 'driver',
      receiverId: activeChat === 'dispatch' ? 'dispatch' : activeChat,
      receiverType: activeChat === 'dispatch' ? 'dispatch' : 'customer',
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const activeMessages =
    activeChat === 'dispatch'
      ? dispatchMessages
      : customerMessages.filter(
          (m) => m.senderId === activeChat || m.receiverId === activeChat
        );

  // Group customer chats
  const customerChats = [...new Set(customerMessages.map((m) =>
    m.senderType === 'customer' ? m.senderId : m.receiverId
  ))];

  if (!currentDriver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={Colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>No Driver Selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>

        {/* Chat Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeChat === 'dispatch' && styles.tabActive]}
            onPress={() => setActiveChat('dispatch')}
          >
            <View style={[styles.tabIcon, { backgroundColor: `${Colors.secondary}20` }]}>
              <Ionicons name="business" size={16} color={Colors.secondary} />
            </View>
            <Text style={[styles.tabText, activeChat === 'dispatch' && styles.tabTextActive]}>
              Dispatch
            </Text>
            {dispatchMessages.filter((m) => !m.read && m.receiverType === 'driver').length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {dispatchMessages.filter((m) => !m.read && m.receiverType === 'driver').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {customerChats.map((customerId) => (
            <TouchableOpacity
              key={customerId}
              style={[styles.tab, activeChat === customerId && styles.tabActive]}
              onPress={() => setActiveChat(customerId)}
            >
              <View style={[styles.tabIcon, { backgroundColor: `${Colors.purple}20` }]}>
                <Text style={styles.tabInitial}>
                  {getCustomerName(customerId)[0]}
                </Text>
              </View>
              <Text
                style={[styles.tabText, activeChat === customerId && styles.tabTextActive]}
                numberOfLines={1}
              >
                {getCustomerName(customerId).split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer}>
          {activeMessages.length > 0 ? (
            activeMessages
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .map((message) => {
                const isFromMe = message.senderId === currentDriver.id;
                return (
                  <View
                    key={message.id}
                    style={[styles.messageRow, isFromMe && styles.messageRowSent]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isFromMe ? styles.messageBubbleSent : styles.messageBubbleReceived,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isFromMe && styles.messageTextSent,
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isFromMe && styles.messageTimeSent,
                        ]}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.emptyMessages}>
              <Ionicons name="chatbubble-outline" size={48} color={Colors.dark.textMuted} />
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.dark.textMuted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.purple,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    maxWidth: 80,
  },
  tabTextActive: {
    color: 'white',
  },
  badge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageRowSent: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleReceived: {
    backgroundColor: Colors.dark.card,
    borderBottomLeftRadius: 4,
  },
  messageBubbleSent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  messageTextSent: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeSent: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.dark.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.cardAlt,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
});

