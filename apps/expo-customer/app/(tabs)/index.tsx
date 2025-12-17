import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePoobelStore, useCurrentCustomer, useCustomerNotifications } from '@poobel/shared-data';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const currentCustomer = useCurrentCustomer();
  const notifications = currentCustomer
    ? useCustomerNotifications(currentCustomer.id)
    : [];
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);

  const assignedDriver = drivers.find((d) => d.id === currentCustomer?.assignedDriverId);
  
  // Find if there's an active stop for this customer
  const activeStop = stops.find(
    (s) =>
      s.customerId === currentCustomer?.id &&
      (s.status === 'pending' || s.status === 'in_progress')
  );

  const completedStop = stops.find(
    (s) => s.customerId === currentCustomer?.id && s.status === 'completed'
  );

  const unreadNotifications = notifications.filter((n) => !n.read);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate ETA simulation
  const getETA = () => {
    if (!activeStop) return null;
    const scheduledTime = activeStop.scheduledTime;
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const eta = new Date();
    eta.setHours(hours, minutes);
    return eta;
  };

  const eta = getETA();

  if (!currentCustomer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={Colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>Not Logged In</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{currentCustomer.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push('/chat')}
            >
              <Ionicons name="chatbubble-ellipses" size={22} color={Colors.dark.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={22} color={Colors.dark.text} />
              {unreadNotifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Tracking Card */}
        {activeStop && assignedDriver ? (
          <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {assignedDriver.name.split(' ').map((n) => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.driverName}>{assignedDriver.name}</Text>
                  <View style={styles.driverMeta}>
                    <Ionicons name="star" size={14} color={Colors.warning} />
                    <Text style={styles.driverRating}>{assignedDriver.rating}</Text>
                    <Text style={styles.driverVehicle}>{assignedDriver.vehiclePlate}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="chatbubble" size={18} color={Colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="call" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
              <View style={styles.mapOverlay}>
                <View style={styles.driverMarker}>
                  <Ionicons name="car" size={20} color="white" />
                </View>
                <View style={styles.routeLine} />
                <View style={styles.customerMarker}>
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </View>
            </View>

            {/* ETA Info */}
            <View style={styles.etaContainer}>
              <View style={styles.etaMain}>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                <Text style={styles.etaTime}>
                  {eta?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.etaDivider} />
              <View style={styles.etaStatus}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor:
                        assignedDriver.status === 'en_route'
                          ? Colors.secondary
                          : assignedDriver.status === 'at_stop'
                          ? Colors.warning
                          : Colors.dark.textMuted,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {assignedDriver.status === 'en_route'
                    ? 'Driver En Route'
                    : assignedDriver.status === 'at_stop'
                    ? 'At Previous Stop'
                    : 'Scheduled'}
                </Text>
              </View>
            </View>
          </View>
        ) : completedStop ? (
          <View style={styles.completedCard}>
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.completedTitle}>Pickup Completed!</Text>
            <Text style={styles.completedSubtitle}>
              Your waste was collected at {completedStop.actualTime}
            </Text>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => router.push('/review')}
            >
              <Ionicons name="star" size={18} color="white" />
              <Text style={styles.reviewButtonText}>Rate Your Driver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noServiceCard}>
            <Ionicons name="calendar-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.noServiceTitle}>No Upcoming Service</Text>
            <Text style={styles.noServiceSubtitle}>
              Your next pickup is scheduled for {currentCustomer.nextPickupDate}
            </Text>
          </View>
        )}

        {/* Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Service</Text>
          <View style={styles.serviceCard}>
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Ionicons name="location" size={20} color={Colors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Service Address</Text>
                <Text style={styles.serviceValue}>{currentCustomer.address}</Text>
              </View>
            </View>
            <View style={styles.serviceDivider} />
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Ionicons name="cube" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Bin Location</Text>
                <Text style={styles.serviceValue}>{currentCustomer.binLocation}</Text>
              </View>
            </View>
            <View style={styles.serviceDivider} />
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Ionicons name="repeat" size={20} color={Colors.purple} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Schedule</Text>
                <Text style={styles.serviceValue}>
                  {currentCustomer.scheduleDays.join(' & ')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                <Ionicons name="calendar" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.actionLabel}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="pause-circle" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.actionLabel}>Hold Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.purple}20` }]}>
                <Ionicons name="call" size={24} color={Colors.purple} />
              </View>
              <Text style={styles.actionLabel}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/chat')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  trackingCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  driverRating: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  driverVehicle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: Colors.dark.cardAlt,
    position: 'relative',
  },
  mapOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 40,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLine: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 8,
    borderStyle: 'dashed',
  },
  customerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  etaMain: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  etaTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  etaDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 16,
  },
  etaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  completedCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  completedIcon: {
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  completedSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noServiceCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  noServiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  noServiceSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  serviceValue: {
    fontSize: 14,
    color: Colors.dark.text,
    marginTop: 2,
  },
  serviceDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 12,
    marginLeft: 52,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
