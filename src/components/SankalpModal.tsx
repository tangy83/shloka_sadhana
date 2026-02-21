/**
 * SankalpModal Component
 * Shloka Sadhana - Intention Setting Modal
 *
 * Modal for setting practice intention (Sankalp) before starting
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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SANKALP_EXAMPLES, SANKALP_HELP_TEXT } from '@/constants/SankalpExamples';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

export interface SankalpModalProps {
  visible: boolean;
  initialValue?: string;
  onConfirm: (sankalp: string) => void;
  onSkip: () => void;
}

/**
 * Modal for setting practice intention (Sankalp)
 * Allows user to enter their intention or skip
 */
export const SankalpModal: React.FC<SankalpModalProps> = ({
  visible,
  initialValue = '',
  onConfirm,
  onSkip,
}) => {
  const [text, setText] = useState(initialValue);
  const [showHelp, setShowHelp] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Update text when initialValue changes
  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  // Check if first-time user and show help automatically
  useEffect(() => {
    async function checkFirstTime() {
      if (!visible) return;

      const seen = await AsyncStorage.getItem(STORAGE_KEYS.SANKALP_EXPLANATION_SEEN);

      if (seen === null) {
        // First-time user
        setShowHelp(true);

        // Mark as seen
        await AsyncStorage.setItem(STORAGE_KEYS.SANKALP_EXPLANATION_SEEN, 'true');
      } else {
        setShowHelp(false);
      }
    }

    checkFirstTime();
  }, [visible]);

  /**
   * Handle confirm button press
   */
  const handleConfirm = () => {
    onConfirm(text);
  };

  /**
   * Handle skip button press
   */
  const handleSkip = () => {
    onSkip();
  };

  /**
   * Handle help button press
   */
  const handleToggleHelp = () => {
    setShowHelp(!showHelp);
  };

  /**
   * Handle examples button press
   */
  const handleToggleExamples = () => {
    setShowExamples(!showExamples);
  };

  /**
   * Handle example selection
   */
  const handleSelectExample = (example: string) => {
    setText(example);
    setShowExamples(false);
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
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Title */}
              <Text style={styles.title}>Set Your Sankalp</Text>

              {/* Description */}
              <Text style={styles.description}>
                Set an intention for your practice
              </Text>

              {/* Help Button */}
              <TouchableOpacity
                style={styles.helpButton}
                onPress={handleToggleHelp}
                accessibilityLabel="Learn what a sankalp is"
                accessibilityRole="button"
              >
                <Text style={styles.helpButtonText}>What&apos;s a sankalp?</Text>
              </TouchableOpacity>

              {/* Help Text (Expandable) */}
              {showHelp && (
                <View style={styles.helpTextContainer}>
                  <Text style={styles.helpText}>{SANKALP_HELP_TEXT.FULL}</Text>
                </View>
              )}

              {/* Text Input */}
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Enter your intention..."
                placeholderTextColor="#C9A96E"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Intention text input"
                accessibilityRole="text"
              />

              {/* Examples Button */}
              <TouchableOpacity
                style={styles.examplesButton}
                onPress={handleToggleExamples}
                accessibilityLabel="View example sankalpas"
                accessibilityRole="button"
              >
                <Text style={styles.examplesButtonText}>Need inspiration?</Text>
              </TouchableOpacity>

              {/* Examples (Expandable) */}
              {showExamples && (
                <View style={styles.examplesContainer}>
                  {Object.entries(SANKALP_EXAMPLES).map(([key, category]) => (
                    <View key={key} style={styles.categoryContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.examples.map((example, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.exampleItem}
                          onPress={() => handleSelectExample(example)}
                          accessibilityLabel={`Select example: ${example}`}
                          accessibilityRole="button"
                        >
                          <Text style={styles.exampleText}>{example}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
              {/* Skip Button */}
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
                accessibilityLabel="Skip setting intention"
                accessibilityRole="button"
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                accessibilityLabel="Start practice with intention"
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>Start Practice</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
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
  categoryContainer: {
    marginBottom: 16,
  },
  categoryName: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
  },
  confirmButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#BDBDBD',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleItem: {
    backgroundColor: '#3C3C3C',
    borderColor: '#424242',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  exampleText: {
    color: '#FFF8E7',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  examplesButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  examplesButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  examplesContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  helpButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  helpButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  helpText: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  helpTextContainer: {
    backgroundColor: '#2C2C2C',
    borderLeftColor: '#FF6B35',
    borderLeftWidth: 3,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderColor: '#424242',
    borderRadius: 12,
    borderWidth: 1,
    color: '#FFF8E7',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
    padding: 16,
  },
  modalContainer: {
    maxHeight: '85%',
    maxWidth: 400,
    width: '85%',
  },
  modalContent: {
    backgroundColor: '#2D1B4E',
    borderRadius: 16,
    elevation: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalScrollView: {
    flex: 1,
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
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFF8E7',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
