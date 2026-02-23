/**
 * QuestCompletionModal
 * Shloka Sadhana — Daily quest completion celebration
 *
 * Shown when the player completes today's quest.
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
import { useTheme } from '@/contexts/ThemeContext';
import { Quest } from '@/data/quests';

interface QuestCompletionModalProps {
  visible: boolean;
  quest: Quest | null;
  onDismiss: () => void;
}

export const QuestCompletionModal: React.FC<QuestCompletionModalProps> = ({
  visible,
  quest,
  onDismiss,
}) => {
  const { theme } = useTheme();
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!quest) return null;

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
        accessibilityLabel="Dismiss quest completion"
      >
        <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
          {/* OM glyph hero */}
          <Text style={styles.omText}>ॐ</Text>

          <Text style={[styles.title, { color: theme.text }]}>Quest Complete!</Text>
          <Text style={styles.questName}>{quest.title}</Text>

          {/* XP earned */}
          <View style={styles.xpRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.templeGold} />
            <Text style={styles.xpText}>+{quest.xpReward} XP earned today</Text>
          </View>

          <Text style={styles.hint}>Tap anywhere to continue</Text>
        </View>
      </TouchableOpacity>
    </Modal>
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
  hint: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  // eslint-disable-next-line react-native/no-color-literals
  omText: {
    color: Colors.templeGold,
    fontSize: 72,
    fontWeight: '300',
    lineHeight: 90,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  questName: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
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
