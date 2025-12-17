import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePoobelStore, useCurrentCustomer } from '@poobel/shared-data';
import { Colors } from '../constants/Colors';

export default function ReviewScreen() {
  const router = useRouter();
  const currentCustomer = useCurrentCustomer();
  const drivers = usePoobelStore((state) => state.drivers);
  const stops = usePoobelStore((state) => state.stops);
  const addReview = usePoobelStore((state) => state.addReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const assignedDriver = drivers.find((d) => d.id === currentCustomer?.assignedDriverId);
  const completedStop = stops.find(
    (s) => s.customerId === currentCustomer?.id && s.status === 'completed'
  );

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    if (!currentCustomer || !assignedDriver || !completedStop) {
      Alert.alert('Error', 'Unable to submit review');
      return;
    }

    addReview({
      customerId: currentCustomer.id,
      driverId: assignedDriver.id,
      stopId: completedStop.id,
      rating,
      comment: comment.trim() || undefined,
    });

    Alert.alert('Thank You!', 'Your review has been submitted.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Great';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  if (!assignedDriver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>No Driver to Review</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {assignedDriver.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.driverName}>{assignedDriver.name}</Text>
          <Text style={styles.driverVehicle}>{assignedDriver.vehiclePlate}</Text>
        </View>

        {/* Rating Stars */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingQuestion}>How was your service?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= rating ? Colors.warning : Colors.dark.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{getRatingLabel()}</Text>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.dark.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Quick Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Quick feedback</Text>
          <View style={styles.tags}>
            {['On time', 'Professional', 'Careful', 'Friendly', 'Clean'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() =>
                  setComment((prev) =>
                    prev.includes(tag) ? prev : `${prev} ${tag}`.trim()
                  )
                }
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  driverCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  driverAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  driverVehicle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 12,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 100,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.dark.cardAlt,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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

