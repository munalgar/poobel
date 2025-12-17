import { useState, useRef } from 'react';
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
import { usePoobelStore, useCurrentCustomer } from '@poobel/shared-data';
import { Colors } from '../constants/Colors';

// AI response simulator
const generateAIResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('next pickup') || lowerMessage.includes('schedule')) {
    return "Your next pickup is scheduled for December 18th, 2024. Your assigned driver is Marcus Johnson, and you can expect the pickup around 8:00 AM based on the route schedule. Would you like to make any changes to your schedule?";
  }
  
  if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
    return "I can help you reschedule your pickup. Our available time slots are:\n\n• Morning (6 AM - 10 AM)\n• Midday (10 AM - 2 PM)\n• Afternoon (2 PM - 6 PM)\n\nWhich would you prefer?";
  }
  
  if (lowerMessage.includes('driver') || lowerMessage.includes('late')) {
    return "I can check on your driver's status. Currently, Marcus Johnson is en route and should arrive within the next 15 minutes. You'll receive a notification when he's approaching your location.";
  }
  
  if (lowerMessage.includes('hold') || lowerMessage.includes('pause') || lowerMessage.includes('vacation')) {
    return "I can help you place a hold on your service. How long would you like to pause pickups? You can choose:\n\n• 1 week\n• 2 weeks\n• Custom dates\n\nYour service will automatically resume after the hold period.";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('billing')) {
    return "Your current plan is the Standard Residential service at $25/month, which includes twice-weekly pickups. Would you like to see other plan options or review your billing history?";
  }
  
  if (lowerMessage.includes('recycling') || lowerMessage.includes('recycle')) {
    return "We accept most recyclables including:\n\n• Paper & cardboard\n• Plastic containers (#1-7)\n• Glass bottles & jars\n• Metal cans\n\nPlease ensure items are clean and dry. Would you like to add recycling service to your account?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Poobel AI assistant. I can help you with:\n\n• Checking your schedule\n• Rescheduling pickups\n• Placing service holds\n• Tracking your driver\n• Answering questions\n\nHow can I assist you today?";
  }
  
  return "I understand you're asking about \"" + message.slice(0, 30) + "...\". Let me help you with that. Could you please provide more details about what you'd like to know? I can assist with scheduling, driver tracking, service changes, and more.";
};

export default function ChatScreen() {
  const currentCustomer = useCurrentCustomer();
  const chatThreads = usePoobelStore((state) => state.chatThreads);
  const addChatMessage = usePoobelStore((state) => state.addChatMessage);
  const createChatThread = usePoobelStore((state) => state.createChatThread);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get or create chat thread for current customer
  const customerThreads = chatThreads.filter(
    (t) => t.customerId === currentCustomer?.id
  );
  const activeThread = customerThreads[0];

  const handleSend = () => {
    if (!message.trim() || !currentCustomer) return;

    let threadId = activeThread?.id;
    if (!threadId) {
      const newThread = createChatThread(currentCustomer.id, 'Support Chat');
      threadId = newThread.id;
    }

    // Add user message
    addChatMessage(threadId, 'user', message.trim());
    const userMessage = message.trim();
    setMessage('');

    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      addChatMessage(threadId, 'assistant', aiResponse);
      setIsTyping(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000 + Math.random() * 1000);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const currentThread = chatThreads.find(
    (t) => t.customerId === currentCustomer?.id
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {/* Welcome message */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="sparkles" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Poobel AI Assistant</Text>
            <Text style={styles.welcomeText}>
              I'm here to help with your waste collection service. Ask me about schedules, driver tracking, or service changes.
            </Text>
          </View>

          {/* Quick suggestions */}
          {(!currentThread || currentThread.messages.length === 0) && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {[
                'When is my next pickup?',
                'I need to reschedule',
                'Put my service on hold',
                'What can I recycle?',
              ].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionButton}
                  onPress={() => {
                    setMessage(suggestion);
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Chat messages */}
          {currentThread?.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' && styles.messageRowUser,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user'
                    ? styles.messageBubbleUser
                    : styles.messageBubbleAssistant,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === 'user' && styles.messageTextUser,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.messageRow}>
              <View style={styles.assistantAvatar}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={Colors.dark.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestions: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginBottom: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleAssistant: {
    backgroundColor: Colors.dark.card,
    borderBottomLeftRadius: 4,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  messageTextUser: {
    color: 'white',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.textMuted,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
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
});

