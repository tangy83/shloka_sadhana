/**
 * OfferingModal Component
 * Shloka Sadhana - Practice Dedication Modal
 *
 * Modal for dedicating practice results (Offering) after completion
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export interface OfferingModalProps {
  visible: boolean;
  elapsedTime?: string;
  initialValue?: string;
  initialNotesValue?: string;
  onConfirm: (offering: string, notes: string) => void;
  onSkip: () => void;
}

/**
 * Modal for dedicating practice results (Offering)
 * Shows after completing practice, allows user to dedicate or skip
 */
export const OfferingModal: React.FC<OfferingModalProps> = ({
  visible,
  elapsedTime,
  initialValue = '',
  initialNotesValue = '',
  onConfirm,
  onSkip,
}) => {
  const [text, setText] = useState(initialValue);
  const [notes, setNotes] = useState(initialNotesValue);

  // Update text when initialValue changes
  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  // Update notes when initialNotesValue changes
  useEffect(() => {
    setNotes(initialNotesValue);
  }, [initialNotesValue]);

  /**
   * Handle confirm button press
   */
  const handleConfirm = () => {
    onConfirm(text, notes);
  };

  /**
   * Handle skip button press
   */
  const handleSkip = () => {
    onSkip();
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Dedicate Your Practice</Text>

          <Text style={styles.description}>
            Offer the fruits of your practice
          </Text>

          {elapsedTime && (
            <Text style={styles.elapsedTime}>
              Practice completed: {elapsedTime}
            </Text>
          )}

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Enter your offering..."
            placeholderTextColor={Colors.textSecondary}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Offering text input"
            accessibilityRole="text"
          />

          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes or reflections (optional)..."
            placeholderTextColor={Colors.textSecondary}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Session notes input"
            accessibilityRole="text"
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
              accessibilityLabel="Skip dedication"
              accessibilityRole="button"
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              accessibilityLabel="Complete practice with offering"
              accessibilityRole="button"
            >
              <Text style={styles.confirmButtonText}>Complete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  confirmButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: Colors.textMeaning,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
  },
  elapsedTime: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.text,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
    padding: 16,
  },
  modalContainer: {
    maxWidth: 400,
    width: '85%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Colors.scrim,
    justifyContent: 'center',
    zIndex: 9999,
  },
  skipButton: {
    backgroundColor: Colors.surfaceElevated,
  },
  skipButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: Colors.textBright,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
