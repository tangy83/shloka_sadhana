/**
 * OfferingModal Component
 * Shloka Sadhana - Practice Dedication Modal
 *
 * Modal for dedicating practice results (Offering) after completion
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Title */}
            <Text style={styles.title}>Dedicate Your Practice</Text>

            {/* Description */}
            <Text style={styles.description}>
              Offer the fruits of your practice
            </Text>

            {/* Elapsed Time (if provided) */}
            {elapsedTime && (
              <Text style={styles.elapsedTime}>
                Practice completed: {elapsedTime}
              </Text>
            )}

            {/* Offering Text Input */}
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Enter your offering..."
              placeholderTextColor="#9E9E9E"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Offering text input"
              accessibilityRole="text"
            />

            {/* Notes/Reflection Text Input */}
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes or reflections (optional)..."
              placeholderTextColor="#9E9E9E"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Session notes input"
              accessibilityRole="text"
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Skip Button */}
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
                accessibilityLabel="Skip dedication"
                accessibilityRole="button"
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                accessibilityLabel="Complete practice with offering"
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#BDBDBD',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
  },
  elapsedTime: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderColor: '#424242',
    borderRadius: 12,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
    padding: 16,
  },
  modalContainer: {
    maxWidth: 400,
    width: '85%',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    elevation: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: '#424242',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
