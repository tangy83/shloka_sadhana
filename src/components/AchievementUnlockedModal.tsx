/**
 * AchievementUnlockedModal
 * Shloka Sadhana — Achievement unlock celebration
 *
 * Shown when the player earns a new achievement.
 * Auto-dismisses after 3 seconds or on tap.
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
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
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss achievement unlocked"
      >
        <View style={styles.card}>
          {/* Achievement icon */}
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={achievement.icon as never}
              size={44}
              color={Colors.templeGold}
            />
          </View>

          <Text style={styles.label}>Achievement Unlocked!</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.desc}>{achievement.description}</Text>

          {/* XP reward */}
          <View style={styles.xpRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={Colors.templeGold} />
            <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
          </View>

          <Text style={styles.hint}>Tap anywhere to continue</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderColor: 'rgba(255, 215, 0, 0.30)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    width: '100%',
  },
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
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    color: Colors.textMeaning,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: 'center',
  },
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
  hint: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
