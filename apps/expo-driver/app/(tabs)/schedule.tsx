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
import { usePoobelStore, useCurrentDriver, useDriverRoutes } from '@poobel/shared-data';
import { Colors, StatusColors } from '../../constants/Colors';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen() {
  const currentDriver = useCurrentDriver();
  const routes = currentDriver ? useDriverRoutes(currentDriver.id) : [];
  const stops = usePoobelStore((state) => state.stops);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const selectedRoutes = routes.filter((r) => r.date === selectedDate.toISOString().split('T')[0]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      {/* Week Picker */}
      <View style={styles.weekPicker}>
        {weekDates.map((date) => (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dayItem,
              isSelected(date) && styles.dayItemSelected,
              isToday(date) && !isSelected(date) && styles.dayItemToday,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dayName,
                isSelected(date) && styles.dayNameSelected,
              ]}
            >
              {DAYS[date.getDay()]}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                isSelected(date) && styles.dayNumberSelected,
              ]}
            >
              {date.getDate()}
            </Text>
            {isToday(date) && !isSelected(date) && <View style={styles.todayDot} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.routeCount}>
            {selectedRoutes.length} route{selectedRoutes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Routes */}
        {selectedRoutes.length > 0 ? (
          selectedRoutes.map((route) => {
            const routeStops = stops.filter((s) => s.routeId === route.id);
            const completed = routeStops.filter((s) => s.status === 'completed').length;

            return (
              <View key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <View
                    style={[
                      styles.routeStatus,
                      {
                        backgroundColor:
                          route.status === 'completed'
                            ? `${Colors.primary}20`
                            : route.status === 'in_progress'
                            ? `${Colors.warning}20`
                            : `${Colors.secondary}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        route.status === 'completed'
                          ? 'checkmark-circle'
                          : route.status === 'in_progress'
                          ? 'play-circle'
                          : 'time'
                      }
                      size={16}
                      color={
                        route.status === 'completed'
                          ? Colors.primary
                          : route.status === 'in_progress'
                          ? Colors.warning
                          : Colors.secondary
                      }
                    />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <View style={styles.routeMeta}>
                      <Text style={styles.routeTime}>{route.startTime}</Text>
                      <Text style={styles.routeDivider}>→</Text>
                      <Text style={styles.routeTime}>{route.endTime || 'TBD'}</Text>
                    </View>
                  </View>
                  <View style={styles.routeProgress}>
                    <Text style={styles.progressText}>
                      {completed}/{routeStops.length}
                    </Text>
                    <Text style={styles.progressLabel}>stops</Text>
                  </View>
                </View>

                <View style={styles.routeDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={16} color={Colors.dark.textMuted} />
                    <Text style={styles.detailText}>{route.totalDistance} miles</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={Colors.dark.textMuted} />
                    <Text style={styles.detailText}>{route.estimatedDuration} min</Text>
                  </View>
                </View>

                {/* Route Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(completed / Math.max(routeStops.length, 1)) * 100}%`,
                          backgroundColor:
                            route.status === 'completed' ? Colors.primary : Colors.warning,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Stop Preview */}
                {route.status !== 'completed' && routeStops.length > 0 && (
                  <View style={styles.stopsPreview}>
                    {routeStops.slice(0, 3).map((stop, index) => (
                      <View key={stop.id} style={styles.stopPreviewItem}>
                        <View
                          style={[
                            styles.stopPreviewDot,
                            { backgroundColor: StatusColors[stop.status] },
                          ]}
                        />
                        <Text style={styles.stopPreviewText} numberOfLines={1}>
                          {stop.address.split(',')[0]}
                        </Text>
                        <Text style={styles.stopPreviewTime}>{stop.scheduledTime}</Text>
                      </View>
                    ))}
                    {routeStops.length > 3 && (
                      <Text style={styles.moreStops}>+{routeStops.length - 3} more stops</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No Routes Scheduled</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any routes scheduled for this day
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekPicker: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
  },
  dayItemSelected: {
    backgroundColor: Colors.primary,
  },
  dayItemToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: 'white',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  dayNumberSelected: {
    color: 'white',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  routeCount: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  routeTime: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  routeDivider: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginHorizontal: 8,
  },
  routeProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  routeDetails: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.cardAlt,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stopsPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  stopPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  stopPreviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  stopPreviewText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  stopPreviewTime: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  moreStops: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});

