/**
 * OnboardingScreen
 * Shloka Sadhana — First-launch onboarding flow
 *
 * 3-page horizontal scroll:
 *   Page 1 — Welcome (OM + DiyaGlow ambience)
 *   Page 2 — Purpose (3 feature cards)
 *   Page 3 — Notification permission + completion
 *
 * On completion: stores ONBOARDING_COMPLETE and replaces nav root with MainTabs.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { setItem } from '@/utils/storage';
import { requestNotificationPermissions } from '@/utils/notifications';
import { DiyaGlow } from '@/components/sacred/DiyaGlow';
import { PrimaryButton } from '@/components/primitives/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_PAGES = 3;

// ─── Feature list for Page 2 ────────────────────────────────────────────────

const FEATURES = [
  {
    icon: 'meditation' as const,
    iconLib: 'material' as const,
    title: 'Daily Mantras',
    body: 'Build a consistent japa practice with a mala counter, timer, and streak tracking.',
  },
  {
    icon: 'book-open-variant' as const,
    iconLib: 'material' as const,
    title: 'Sacred Library',
    body: 'Explore shlokas, Gayatri Mantra, Vishnu Sahasranama, and more with meanings.',
  },
  {
    icon: 'calendar-star' as const,
    iconLib: 'material' as const,
    title: 'Your Journey',
    body: 'Track streaks, unlock wisdom teachings at milestones, and honour your practice.',
  },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // ── Helpers ──

  const scrollToPage = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const completeOnboarding = async () => {
    await setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    navigation.replace('MainTabs');
  };

  const handleEnableReminders = async () => {
    setNotifLoading(true);
    await requestNotificationPermissions();
    setNotifLoading(false);
    await completeOnboarding();
  };

  // ── Page renderers ──

  const renderPage1 = () => (
    <View style={[styles.page, { paddingTop: insets.top + 24 }]}>
      {/* Ambient diya glow from top */}
      <DiyaGlow intensity="active" />

      <View style={styles.page1Content}>
        {/* OM symbol */}
        <Text style={styles.omSymbol}>ॐ</Text>

        <Text style={[styles.appName, { color: theme.text }]}>Shloka Sadhana</Text>
        <Text style={[styles.appTagline, { color: theme.textSecondary }]}>Your daily sacred practice companion</Text>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.page1Body, { color: theme.textMeaning }]}>
          A peaceful space to chant, reflect, and grow — completely offline, always with you.
        </Text>

        <PrimaryButton
          label="Begin"
          onPress={() => scrollToPage(1)}
          style={styles.nextBtn}
          accessibilityLabel="Go to next page"
        />
      </View>
    </View>
  );

  const renderPage2 = () => (
    <View style={[styles.page, { paddingTop: insets.top + 48 }]}>
      <Text style={[styles.page2Title, { color: theme.text }]}>What awaits you</Text>
      <Text style={[styles.page2Subtitle, { color: theme.textSecondary }]}>Everything you need, nothing you don&apos;t.</Text>

      <View style={styles.featureList}>
        {FEATURES.map((f) => (
          <View key={f.title} style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIconWrap, { backgroundColor: theme.surfaceElevated }]}>
              <MaterialCommunityIcons name={f.icon} size={28} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{f.title}</Text>
              <Text style={[styles.featureBody, { color: theme.textMeaning }]}>{f.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton
        label="Continue"
        onPress={() => scrollToPage(2)}
        style={styles.nextBtn}
        accessibilityLabel="Go to next page"
      />
    </View>
  );

  const renderPage3 = () => (
    <View style={[styles.page, { paddingTop: insets.top + 48 }]}>
      <View style={styles.notifHero}>
        <Ionicons name="notifications-outline" size={64} color={Colors.primary} />
      </View>

      <Text style={[styles.notifTitle, { color: theme.text }]}>Stay connected to your practice</Text>
      <Text style={[styles.notifBody, { color: theme.textMeaning }]}>
        A gentle daily reminder keeps your sadhana unbroken. You can customise or turn off
        notifications anytime in Settings.
      </Text>

      <View style={styles.notifActions}>
        <PrimaryButton
          label={notifLoading ? 'Please wait…' : 'Enable Reminders'}
          onPress={handleEnableReminders}
          disabled={notifLoading}
          style={styles.notifPrimaryBtn}
          accessibilityLabel="Enable daily practice reminders"
        />

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={completeOnboarding}
          accessibilityRole="button"
          accessibilityLabel="Skip notifications and enter the app"
        >
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>Maybe later</Text>
        </TouchableOpacity>
      </View>

      {/* Guest note */}
      <View style={styles.guestNote}>
        <Ionicons name="cloud-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.guestNoteText, { color: theme.textSecondary }]}>
          All data is stored locally — no account needed.
        </Text>
      </View>
    </View>
  );

  // ── Render ──

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {renderPage1()}
        {renderPage2()}
        {renderPage3()}
      </ScrollView>

      {/* Dot indicators */}
      <View style={[styles.dots, { bottom: insets.bottom + 24 }]}>
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: theme.border }, i === currentPage && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  appName: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  appTagline: {
    color: Colors.textSecondary,
    fontSize: 17,
    fontStyle: 'italic',
    marginBottom: 28,
    textAlign: 'center',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  divider: {
    backgroundColor: Colors.divider,
    height: 1,
    marginBottom: 24,
    width: '60%',
  },
  dot: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 22,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
  },
  featureBody: {
    color: Colors.textMeaning,
    fontSize: 13,
    lineHeight: 19,
  },
  featureCard: {
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  featureIconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  featureList: {
    gap: 16,
    marginBottom: 40,
    width: '100%',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  guestNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 36,
  },
  guestNoteText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  nextBtn: {
    width: '100%',
  },
  notifActions: {
    gap: 16,
    width: '100%',
  },
  notifBody: {
    color: Colors.textMeaning,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
  },
  notifHero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  notifPrimaryBtn: {
    width: '100%',
  },
  notifTitle: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  omSymbol: {
    color: Colors.templeGold,
    fontSize: 96,
    fontWeight: '300',
    lineHeight: 110,
    marginBottom: 8,
    textAlign: 'center',
  },
  page: {
    alignItems: 'center',
    paddingHorizontal: 28,
    width: SCREEN_WIDTH,
  },
  page1Body: {
    color: Colors.textMeaning,
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 40,
    textAlign: 'center',
  },
  page1Content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  page2Subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  page2Title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    padding: 10,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
