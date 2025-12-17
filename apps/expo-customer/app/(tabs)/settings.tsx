import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePoobelStore, useCurrentCustomer } from '@poobel/shared-data';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
  const currentCustomer = useCurrentCustomer();
  const resetData = usePoobelStore((state) => state.resetData);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentCustomer.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentCustomer.name}</Text>
            <Text style={styles.profileEmail}>{currentCustomer.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={18} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Service Address</Text>
                  <Text style={styles.settingValue} numberOfLines={1}>
                    {currentCustomer.address}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                  <Ionicons name="calendar" size={20} color={Colors.secondary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Collection Schedule</Text>
                  <Text style={styles.settingValue}>
                    {currentCustomer.scheduleDays.join(' & ')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.purple}20` }]}>
                  <Ionicons name="cube" size={20} color={Colors.purple} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Bin Location</Text>
                  <Text style={styles.settingValue}>{currentCustomer.binLocation}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                  <Ionicons name="notifications" size={20} color={Colors.secondary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get alerts about your service
                  </Text>
                </View>
              </View>
              <Switch
                value={true}
                trackColor={{ false: Colors.dark.cardAlt, true: Colors.primary }}
                thumbColor="white"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.warning}20` }]}>
                  <Ionicons name="mail" size={20} color={Colors.warning} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Service updates via email</Text>
                </View>
              </View>
              <Switch
                value={true}
                trackColor={{ false: Colors.dark.cardAlt, true: Colors.primary }}
                thumbColor="white"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name="chatbubble" size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>SMS Notifications</Text>
                  <Text style={styles.settingDescription}>Text alerts when driver is near</Text>
                </View>
              </View>
              <Switch
                value={false}
                trackColor={{ false: Colors.dark.cardAlt, true: Colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name="help-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.settingLabel}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                  <Ionicons name="call" size={20} color={Colors.secondary} />
                </View>
                <Text style={styles.settingLabel}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.warning}20` }]}>
                  <Ionicons name="document-text" size={20} color={Colors.warning} />
                </View>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow} onPress={resetData}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${Colors.danger}20` }]}>
                  <Ionicons name="refresh" size={20} color={Colors.danger} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: Colors.danger }]}>
                    Reset Demo Data
                  </Text>
                  <Text style={styles.settingDescription}>
                    Restore all mock data to initial state
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <View style={styles.version}>
          <Text style={styles.versionText}>Poobel Customer v1.0.0</Text>
          <Text style={styles.versionSubtext}>Demo Mode</Text>
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
  profileCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  settingValue: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.danger,
  },
  version: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  versionSubtext: {
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

