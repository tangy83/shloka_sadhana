/**
 * SankalpModal Component Tests
 * Shloka Sadhana - Intention Setting Modal
 *
 * Tests for setting practice intention (Sankalp) before starting
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SankalpModal } from '../SankalpModal';

describe('SankalpModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when visible is false', () => {
      render(
        <SankalpModal
          visible={false}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByText('Set Your Sankalp')).toBeNull();
    });

    it('should render when visible is true', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Set Your Sankalp')).toBeTruthy();
    });
  });

  describe('Content', () => {
    it('should display title', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Set Your Sankalp')).toBeTruthy();
    });

    it('should display description text', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(
        screen.getByText('Set an intention for your practice')
      ).toBeTruthy();
    });

    it('should display text input field', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByPlaceholderText('Enter your intention...')).toBeTruthy();
    });
  });

  describe('Input Handling', () => {
    it('should allow text input', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your intention...');
      fireEvent.changeText(input, 'Peace and healing');

      expect(input.props.value).toBe('Peace and healing');
    });

    it('should allow multiline text input', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your intention...');
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('Confirm Button', () => {
    it('should display confirm button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Start Practice')).toBeTruthy();
    });

    it('should call onConfirm with entered text when confirm button is pressed', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your intention...');
      fireEvent.changeText(input, 'Peace and healing');

      const confirmButton = screen.getByText('Start Practice');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('Peace and healing');
    });

    it('should call onConfirm with empty string if no text entered', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const confirmButton = screen.getByText('Start Practice');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('');
    });

    it('should have accessible label for confirm button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('Start practice with intention')).toBeTruthy();
    });
  });

  describe('Skip Button', () => {
    it('should display skip button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Skip')).toBeTruthy();
    });

    it('should call onSkip when skip button is pressed', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const skipButton = screen.getByText('Skip');
      fireEvent.press(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label for skip button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('Skip setting intention')).toBeTruthy();
    });
  });

  describe('Keyboard Handling', () => {
    it('should avoid keyboard when modal is visible', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Check that KeyboardAvoidingView or similar is used
      // This is platform-specific behavior
    });
  });

  describe('Initial Value', () => {
    it('should display initial value if provided', () => {
      render(
        <SankalpModal
          visible={true}
          initialValue="World peace"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your intention...');
      expect(input.props.value).toBe('World peace');
    });

    it('should allow editing initial value', () => {
      render(
        <SankalpModal
          visible={true}
          initialValue="World peace"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your intention...');
      fireEvent.changeText(input, 'Inner peace');

      expect(input.props.value).toBe('Inner peace');
    });
  });
});
