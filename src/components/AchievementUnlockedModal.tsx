/**
 * AchievementUnlockedModal
 * Shloka Sadhana — Achievement unlock celebration
 *
 * Shown when the player earns a new achievement.
 * Auto-dismisses after 3 seconds or on tap.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Achievement } from '@/data/achievements';

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
  visible,
  achievement,
  onDismiss,
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible || !achievement) return null;

  return (
    <Pressable
      style={styles.overlay}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss achievement unlocked"
    >
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={achievement.icon as never}
            size={44}
            color={Colors.templeGold}
          />
        </View>

        <Text style={styles.label}>Achievement Unlocked!</Text>
        <Text style={[styles.title, { color: theme.text }]}>{achievement.title}</Text>
        <Text style={styles.desc}>{achievement.description}</Text>

        <View style={styles.xpRow}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color={Colors.templeGold} />
          <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
        </View>

        <Text style={styles.hint}>Tap anywhere to continue</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  card: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderColor: 'rgba(255, 215, 0, 0.30)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    width: '100%',
  },
  desc: {
    color: Colors.textMeaning,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: 'center',
  },
  hint: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  // eslint-disable-next-line react-native/no-color-literals
  iconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.40)',
    borderRadius: 48,
    borderWidth: 1.5,
    height: 88,
    justifyContent: 'center',
    marginBottom: 20,
    width: 88,
  },
  label: {
    color: Colors.templeGold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 32,
    zIndex: 9999,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  xpRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  xpText: {
    color: Colors.templeGold,
    fontSize: 16,
    fontWeight: '700',
  },
});
