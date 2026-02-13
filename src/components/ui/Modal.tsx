/**
 * Modal Component
 * Shloka Sadhana - UI Library
 *
 * Base modal component with accessibility and consistent styling
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';

export interface ModalProps {
  /** Whether modal is visible */
  isVisible: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal subtitle/description */
  subtitle?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal footer (usually buttons) */
  footer?: React.ReactNode;
  /** Whether modal can be dismissed by backdrop tap */
  dismissable?: boolean;
  /** Whether to show scrollable content */
  scrollable?: boolean;
  /** Maximum height of modal content */
  maxHeight?: number | string;
  /** Custom style for modal container */
  containerStyle?: ViewStyle;
  /** Custom style for modal content */
  contentStyle?: ViewStyle;
  /** Accessibility label for modal */
  accessibilityLabel?: string;
}

/**
 * Modal component with consistent styling and accessibility
 *
 * @example
 * ```tsx
 * <Modal
 *   isVisible={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Set Your Intention"
 *   footer={
 *     <Button onPress={handleSubmit}>Confirm</Button>
 *   }
 * >
 *   <Input
 *     label="Sankalp"
 *     value={sankalp}
 *     onChangeText={setSankalp}
 *   />
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  dismissable = true,
  scrollable = false,
  maxHeight = '80%',
  containerStyle,
  contentStyle,
  accessibilityLabel,
}) => {
  const firstFocusableRef = useRef(null);

  // Focus first element when modal opens (for keyboard navigation)
  useEffect(() => {
    if (isVisible && firstFocusableRef.current) {
      // Small delay to allow modal animation to complete
      const timeout = setTimeout(() => {
        // @ts-ignore - focus() exists on some elements
        firstFocusableRef.current?.focus?.();
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={dismissable ? onClose : undefined}
      onBackButtonPress={dismissable ? onClose : undefined}
      onSwipeComplete={dismissable ? onClose : undefined}
      swipeDirection={dismissable ? ['down'] : undefined}
      backdropOpacity={0.6}
      backdropColor="#000000"
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      style={[styles.modal, containerStyle]}
      // Accessibility
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={accessibilityLabel || title || 'Modal dialog'}
      accessibilityRole="dialog"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.container, contentStyle]}>
          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && (
                <Text
                  style={styles.title}
                  accessible={true}
                  accessibilityRole="header"
                  accessibilityLevel={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}
            </View>
          )}

          {/* Content */}
          <ContentWrapper
            style={[
              styles.content,
              scrollable && styles.scrollableContent,
              { maxHeight },
            ]}
            showsVerticalScrollIndicator={scrollable}
          >
            {children}
          </ContentWrapper>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    maxHeight: '90%',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border as string,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scrollableContent: {
    flexGrow: 0,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border as string,
    gap: Spacing.sm,
  },
});
