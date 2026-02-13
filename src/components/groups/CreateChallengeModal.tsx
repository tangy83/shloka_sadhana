/**
 * Create Challenge Modal
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Modal for creating a new group challenge
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { ChallengeType, ChallengeDuration, CreateChallengeData } from '@/types/challenges';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: CreateChallengeData) => Promise<void>;
}

interface ChallengeTypeOption {
  type: ChallengeType;
  name: string;
  description: string;
  icon: string;
  suggestedGoals: number[];
}

const CHALLENGE_TYPES: ChallengeTypeOption[] = [
  {
    type: 'practices',
    name: 'Practice Challenge',
    description: 'First to complete X practice sessions',
    icon: '🙏',
    suggestedGoals: [10, 25, 50, 100],
  },
  {
    type: 'malas',
    name: 'Mala Challenge',
    description: 'First to complete X malas',
    icon: '📿',
    suggestedGoals: [10, 50, 100, 500],
  },
  {
    type: 'minutes',
    name: 'Minutes Challenge',
    description: 'First to practice X minutes',
    icon: '⏱️',
    suggestedGoals: [100, 300, 600, 1000],
  },
  {
    type: 'consistency',
    name: 'Consistency Challenge',
    description: 'Highest streak during challenge period',
    icon: '🔥',
    suggestedGoals: [7, 14, 21, 30],
  },
];

const DURATIONS: ChallengeDuration[] = [7, 14, 30];

export const CreateChallengeModal: React.FC<Props> = ({ visible, onClose, onCreate }) => {
  const [selectedType, setSelectedType] = useState<ChallengeType>('practices');
  const [goal, setGoal] = useState<string>('');
  const [duration, setDuration] = useState<ChallengeDuration>(7);
  const [creating, setCreating] = useState(false);

  const selectedTypeOption = CHALLENGE_TYPES.find((t) => t.type === selectedType)!;

  const handleCreate = async () => {
    // Validation
    const goalNum = parseInt(goal, 10);
    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid goal number');
      return;
    }

    if (goalNum > 10000) {
      Alert.alert('Goal Too High', 'Please enter a goal less than 10,000');
      return;
    }

    setCreating(true);

    try {
      await onCreate({
        type: selectedType,
        goal: goalNum,
        duration,
      });

      // Reset form
      setSelectedType('practices');
      setGoal('');
      setDuration(7);
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create challenge');
    } finally {
      setCreating(false);
    }
  };

  const handleSuggestedGoal = (suggestedGoal: number) => {
    setGoal(suggestedGoal.toString());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Challenge</Text>
            <TouchableOpacity onPress={onClose} disabled={creating}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Challenge Type */}
            <Text style={styles.sectionLabel}>Challenge Type</Text>
            {CHALLENGE_TYPES.map((typeOption) => (
              <TouchableOpacity
                key={typeOption.type}
                style={[
                  styles.typeOption,
                  selectedType === typeOption.type && styles.selectedTypeOption,
                ]}
                onPress={() => setSelectedType(typeOption.type)}
                disabled={creating}
              >
                <View style={styles.typeIcon}>
                  <Text style={styles.typeIconText}>{typeOption.icon}</Text>
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>{typeOption.name}</Text>
                  <Text style={styles.typeDescription}>{typeOption.description}</Text>
                </View>
                {selectedType === typeOption.type && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Goal */}
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter goal number..."
              placeholderTextColor={Colors.dark.textSecondary}
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
              editable={!creating}
            />

            {/* Suggested Goals */}
            <View style={styles.suggestedGoals}>
              {selectedTypeOption.suggestedGoals.map((suggestedGoal) => (
                <TouchableOpacity
                  key={suggestedGoal}
                  style={styles.suggestedGoalChip}
                  onPress={() => handleSuggestedGoal(suggestedGoal)}
                  disabled={creating}
                >
                  <Text style={styles.suggestedGoalText}>{suggestedGoal}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration */}
            <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Duration</Text>
            <View style={styles.durationOptions}>
              {DURATIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationOption,
                    duration === dur && styles.selectedDurationOption,
                  ]}
                  onPress={() => setDuration(dur)}
                  disabled={creating}
                >
                  <Text
                    style={[
                      styles.durationText,
                      duration === dur && styles.selectedDurationText,
                    ]}
                  >
                    {dur} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Creating...' : 'Create Challenge'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: Layout.typography.h2,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.dark.textSecondary,
    padding: Layout.spacing.xs,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.md,
  },
  sectionSpacing: {
    marginTop: Layout.spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  selectedTypeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  typeIconText: {
    fontSize: 24,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  suggestedGoals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  suggestedGoalChip: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  suggestedGoalText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  durationOptions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  durationOption: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  selectedDurationOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  durationText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  selectedDurationText: {
    color: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Layout.spacing.xl,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
