/**
 * Error Boundary Component
 * Shloka Sadhana - Catch React errors and display fallback UI
 *
 * Wraps the entire app to catch unhandled errors
 * Logs errors to Sentry in production
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';
import { logError } from '@/utils/sentry';

/**
 * Error Boundary to catch React component errors
 * Use this to wrap the entire app or critical sections
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    logError(error, {
      level: 'fatal',
      tags: {
        errorBoundary: 'true',
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo,
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('Error Boundary caught error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>🙏</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We apologize for the inconvenience. The error has been logged and we'll fix it soon.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack} numberOfLines={10}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.resetError} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: FontSize.md * 1.5,
  },
  errorBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontFamily: 'monospace',
    marginBottom: Spacing.sm,
  },
  errorStack: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 120,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
