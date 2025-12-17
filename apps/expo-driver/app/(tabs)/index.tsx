import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePoobelStore, useCurrentDriver, useDriverRoutes } from '@poobel/shared-data';
import { Colors, StatusColors } from '../../constants/Colors';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const currentDriver = useCurrentDriver();
  const routes = currentDriver ? useDriverRoutes(currentDriver.id) : [];
  const completeStop = usePoobelStore((state) => state.completeStop);
  const updateStopStatus = usePoobelStore((state) => state.updateStopStatus);
  const stops = usePoobelStore((state) => state.stops);

  const activeRoute = routes.find((r) => r.status === 'in_progress');
  const routeStops = stops
    .filter((s) => s.routeId === activeRoute?.id)
    .sort((a, b) => a.sequence - b.sequence);
  const currentStop = routeStops.find((s) => s.status === 'in_progress' || s.status === 'pending');
  const completedCount = routeStops.filter((s) => s.status === 'completed').length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCompleteStop = (stopId: string) => {
    Alert.alert(
      'Complete Stop',
      'Mark this stop as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeStop(stopId);
          },
        },
      ]
    );
  };

  const handleSkipStop = (stopId: string) => {
    Alert.alert(
      'Skip Stop',
      'Are you sure you want to skip this stop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            updateStopStatus(stopId, 'skipped', 'Customer unavailable');
          },
        },
      ]
    );
  };

  const handleReportIssue = (stopId: string) => {
    Alert.alert(
      'Report Issue',
      'What issue did you encounter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Bin Inaccessible',
          onPress: () => updateStopStatus(stopId, 'problematic', 'Bin inaccessible'),
        },
        {
          text: 'Gate Locked',
          onPress: () => updateStopStatus(stopId, 'problematic', 'Gate locked'),
        },
        {
          text: 'Other',
          onPress: () => updateStopStatus(stopId, 'problematic', 'Other issue reported'),
        },
      ]
    );
  };

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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{currentDriver.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: StatusColors[currentDriver.status] }]} />
            <Text style={styles.statusText}>{currentDriver.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Active Route Card */}
        {activeRoute ? (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View>
                <Text style={styles.routeLabel}>CURRENT ROUTE</Text>
                <Text style={styles.routeName}>{activeRoute.name}</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>
                  {completedCount}/{routeStops.length}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedCount / Math.max(routeStops.length, 1)) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.routeStats}>
              <View style={styles.statItem}>
                <Ionicons name="location" size={16} color={Colors.dark.textMuted} />
                <Text style={styles.statText}>{activeRoute.totalDistance} mi</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={Colors.dark.textMuted} />
                <Text style={styles.statText}>{activeRoute.estimatedDuration} min</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flag" size={16} color={Colors.dark.textMuted} />
                <Text style={styles.statText}>{routeStops.length - completedCount} remaining</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noRouteCard}>
            <Ionicons name="car-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.noRouteTitle}>No Active Route</Text>
            <Text style={styles.noRouteSubtitle}>Check your schedule for upcoming routes</Text>
          </View>
        )}

        {/* Current Stop */}
        {currentStop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Stop</Text>
            <View style={styles.currentStopCard}>
              <View style={styles.stopSequence}>
                <Text style={styles.sequenceNumber}>{currentStop.sequence}</Text>
              </View>
              <View style={styles.stopInfo}>
                <Text style={styles.stopAddress}>{currentStop.address.split(',')[0]}</Text>
                <Text style={styles.stopCity}>
                  {currentStop.address.split(',').slice(1).join(',')}
                </Text>
                <View style={styles.stopMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.dark.textMuted} />
                    <Text style={styles.metaText}>{currentStop.scheduledTime}</Text>
                  </View>
                  <View style={[styles.serviceBadge, { backgroundColor: `${Colors.secondary}20` }]}>
                    <Text style={[styles.serviceBadgeText, { color: Colors.secondary }]}>
                      {currentStop.serviceType}
                    </Text>
                  </View>
                </View>

                {(currentStop.binLocation || currentStop.accessCode || currentStop.notes) && (
                  <View style={styles.stopNotes}>
                    {currentStop.binLocation && (
                      <View style={styles.noteRow}>
                        <Ionicons name="cube-outline" size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.noteText}>{currentStop.binLocation}</Text>
                      </View>
                    )}
                    {currentStop.accessCode && (
                      <View style={styles.noteRow}>
                        <Ionicons name="key-outline" size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.noteText}>Code: {currentStop.accessCode}</Text>
                      </View>
                    )}
                    {currentStop.notes && (
                      <View style={styles.noteRow}>
                        <Ionicons name="document-text-outline" size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.noteText}>{currentStop.notes}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.navigateButton}>
                <Ionicons name="navigate" size={20} color="white" />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteStop(currentStop.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleSkipStop(currentStop.id)}
              >
                <Ionicons name="play-skip-forward" size={18} color={Colors.dark.textSecondary} />
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleReportIssue(currentStop.id)}
              >
                <Ionicons name="warning" size={18} color={Colors.warning} />
                <Text style={[styles.secondaryButtonText, { color: Colors.warning }]}>
                  Report Issue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="call" size={18} color={Colors.secondary} />
                <Text style={[styles.secondaryButtonText, { color: Colors.secondary }]}>
                  Call Customer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upcoming Stops */}
        {routeStops.filter((s) => s.status === 'pending' && s.id !== currentStop?.id).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Stops</Text>
            {routeStops
              .filter((s) => s.status === 'pending' && s.id !== currentStop?.id)
              .slice(0, 3)
              .map((stop) => (
                <View key={stop.id} style={styles.upcomingStop}>
                  <View style={styles.upcomingSequence}>
                    <Text style={styles.upcomingSequenceText}>{stop.sequence}</Text>
                  </View>
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingAddress}>{stop.address.split(',')[0]}</Text>
                    <Text style={styles.upcomingTime}>{stop.scheduledTime}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
                </View>
              ))}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{currentDriver.completedStops}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{currentDriver.onTimeRate}%</Text>
              <Text style={styles.statLabel}>On-Time</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{currentDriver.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    textTransform: 'capitalize',
  },
  routeCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 4,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.cardAlt,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  noRouteCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  noRouteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  noRouteSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  currentStopCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  stopSequence: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sequenceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  stopInfo: {
    flex: 1,
  },
  stopAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  stopCity: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stopNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: 6,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  upcomingStop: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  upcomingSequence: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upcomingSequenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  upcomingTime: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
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
