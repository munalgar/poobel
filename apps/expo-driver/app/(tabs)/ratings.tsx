import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePoobelStore, useCurrentDriver, useDriverReviews } from '@poobel/shared-data';
import { Colors } from '../../constants/Colors';

export default function RatingsScreen() {
  const currentDriver = useCurrentDriver();
  const reviews = currentDriver ? useDriverReviews(currentDriver.id) : [];
  const customers = usePoobelStore((state) => state.customers);

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
        : 0,
  }));

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Customer';
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
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ratings</Text>
        </View>

        {/* Rating Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.ratingBig}>
            <Text style={styles.ratingNumber}>{currentDriver.rating}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(currentDriver.rating) ? 'star' : 'star-outline'}
                  size={20}
                  color={Colors.warning}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              Based on {currentDriver.totalRatings} reviews
            </Text>
          </View>

          <View style={styles.ratingDistribution}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <View key={rating} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{rating}</Text>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <View style={styles.distributionBar}>
                  <View
                    style={[styles.distributionFill, { width: `${percentage}%` }]}
                  />
                </View>
                <Text style={styles.distributionCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{currentDriver.onTimeRate}%</Text>
              <Text style={styles.statLabel}>On-Time Rate</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                <Ionicons name="flag" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{currentDriver.completedStops}</Text>
              <Text style={styles.statLabel}>Total Stops</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="trending-up" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.statValue}>{currentDriver.earlyCount}</Text>
              <Text style={styles.statLabel}>Early Pickups</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.danger}20` }]}>
                <Ionicons name="close-circle" size={24} color={Colors.danger} />
              </View>
              <Text style={styles.statValue}>{currentDriver.missedCount}</Text>
              <Text style={styles.statLabel}>Missed</Text>
            </View>
          </View>
        </View>

        {/* Recent Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.length > 0 ? (
            reviews
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>
                          {getCustomerName(review.customerId)[0]}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>
                          {getCustomerName(review.customerId)}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={16}
                          color={Colors.warning}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
          ) : (
            <View style={styles.noReviews}>
              <Ionicons name="chatbubble-outline" size={48} color={Colors.dark.textMuted} />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>
                Complete more stops to receive customer feedback
              </Text>
            </View>
          )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  overviewCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ratingBig: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 8,
  },
  ratingDistribution: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distributionLabel: {
    width: 16,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'right',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.dark.cardAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 4,
  },
  distributionCount: {
    width: 24,
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'right',
  },
  statsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  reviewsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  noReviewsSubtext: {
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

