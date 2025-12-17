import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePoobelStore, useCurrentCustomer, useCustomerNotifications } from '@poobel/shared-data';
import { Colors } from '../../constants/Colors';

type TabType = 'history' | 'notifications';

export default function ActivityScreen() {
  const currentCustomer = useCurrentCustomer();
  const notifications = currentCustomer
    ? useCustomerNotifications(currentCustomer.id)
    : [];
  const stops = usePoobelStore((state) => state.stops);
  const drivers = usePoobelStore((state) => state.drivers);
  const markNotificationRead = usePoobelStore((state) => state.markNotificationRead);
  const [activeTab, setActiveTab] = useState<TabType>('history');

  const customerStops = stops.filter((s) => s.customerId === currentCustomer?.id);
  const completedStops = customerStops.filter((s) => s.status === 'completed');

  const getDriverName = (stopId: string) => {
    // In a real app, we'd look up which driver completed this stop
    return drivers[0]?.name || 'Driver';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approaching':
        return { name: 'car', color: Colors.secondary };
      case 'completed':
        return { name: 'checkmark-circle', color: Colors.primary };
      case 'delayed':
        return { name: 'time', color: Colors.warning };
      case 'route_change':
        return { name: 'swap-horizontal', color: Colors.purple };
      case 'message':
        return { name: 'chatbubble', color: Colors.secondary };
      default:
        return { name: 'notifications', color: Colors.dark.textMuted };
    }
  };

  if (!currentCustomer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={Colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>Not Logged In</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time"
            size={18}
            color={activeTab === 'history' ? Colors.primary : Colors.dark.textMuted}
          />
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}
          >
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons
            name="notifications"
            size={18}
            color={activeTab === 'notifications' ? Colors.primary : Colors.dark.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'notifications' && styles.tabTextActive,
            ]}
          >
            Notifications
          </Text>
          {notifications.filter((n) => !n.read).length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {notifications.filter((n) => !n.read).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'history' ? (
          <>
            {completedStops.length > 0 ? (
              completedStops.map((stop) => (
                <View key={stop.id} style={styles.historyCard}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.historyContent}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTitle}>Pickup Completed</Text>
                      <Text style={styles.historyTime}>
                        {stop.actualTime || stop.scheduledTime}
                      </Text>
                    </View>
                    <Text style={styles.historyAddress}>{stop.address}</Text>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyDriver}>{getDriverName(stop.id)}</Text>
                      <View style={styles.historyServiceBadge}>
                        <Text style={styles.historyServiceText}>{stop.serviceType}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContent}>
                <Ionicons name="document-text-outline" size={48} color={Colors.dark.textMuted} />
                <Text style={styles.emptyContentTitle}>No Service History</Text>
                <Text style={styles.emptyContentSubtitle}>
                  Your completed pickups will appear here
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {notifications.length > 0 ? (
              notifications
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
                .map((notification) => {
                  const icon = getNotificationIcon(notification.type);
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationCard,
                        !notification.read && styles.notificationUnread,
                      ]}
                      onPress={() => markNotificationRead(notification.id)}
                    >
                      <View
                        style={[
                          styles.notificationIcon,
                          { backgroundColor: `${icon.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={icon.name as keyof typeof Ionicons.glyphMap}
                          size={20}
                          color={icon.color}
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          <Text style={styles.notificationTitle}>
                            {notification.title}
                          </Text>
                          {!notification.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {new Date(notification.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
            ) : (
              <View style={styles.emptyContent}>
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color={Colors.dark.textMuted}
                />
                <Text style={styles.emptyContentTitle}>No Notifications</Text>
                <Text style={styles.emptyContentSubtitle}>
                  You'll be notified about your service here
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  historyTime: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  historyAddress: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  historyDriver: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  historyServiceBadge: {
    backgroundColor: `${Colors.secondary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyServiceText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  notificationUnread: {
    backgroundColor: `${Colors.primary}08`,
    borderColor: `${Colors.primary}30`,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notificationMessage: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 6,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  emptyContentSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
    textAlign: 'center',
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

