/**
 * Input Component
 * Shloka Sadhana - UI Library
 *
 * Text input with label, error states, and consistent styling
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';

export interface InputProps extends TextInputProps {
  /** Input label */
  label?: string;
  /** Error message (shows error state if provided) */
  error?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Whether input is required */
  required?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Left icon/element */
  leftElement?: React.ReactNode;
  /** Right icon/element */
  rightElement?: React.ReactNode;
}

/**
 * Input component with label, error state, and helper text
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   helperText="We'll never share your email"
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  containerStyle,
  leftElement,
  rightElement,
  style,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const showHelperText = helperText || error;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        {/* Left element */}
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            leftElement && styles.inputWithLeftElement,
            rightElement && styles.inputWithRightElement,
            style,
          ]}
          placeholderTextColor={Colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={label || inputProps.placeholder}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled: inputProps.editable === false,
          }}
          {...inputProps}
        />

        {/* Right element */}
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {/* Helper text or error */}
      {showHelperText && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border as string,
    minHeight: 44, // iOS HIG minimum touch target
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputWithLeftElement: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightElement: {
    paddingRight: Spacing.xs,
  },
  leftElement: {
    paddingLeft: Spacing.md,
  },
  rightElement: {
    paddingRight: Spacing.md,
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
  },
});
