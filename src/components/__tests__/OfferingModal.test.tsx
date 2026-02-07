/**
 * OfferingModal Component Tests
 * Shloka Sadhana - Practice Dedication Modal
 *
 * Tests for dedicating practice results (Offering) after completion
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OfferingModal } from '../OfferingModal';

describe('OfferingModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when visible is false', () => {
      render(
        <OfferingModal
          visible={false}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByText('Dedicate Your Practice')).toBeNull();
    });

    it('should render when visible is true', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Dedicate Your Practice')).toBeTruthy();
    });
  });

  describe('Content', () => {
    it('should display title', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Dedicate Your Practice')).toBeTruthy();
    });

    it('should display description text', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(
        screen.getByText('Offer the fruits of your practice')
      ).toBeTruthy();
    });

    it('should display text input field', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByPlaceholderText('Enter your offering...')).toBeTruthy();
    });

    it('should display completion message with elapsed time', () => {
      render(
        <OfferingModal
          visible={true}
          elapsedTime="05:30"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Practice completed: 05:30')).toBeTruthy();
    });
  });

  describe('Input Handling', () => {
    it('should allow text input', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your offering...');
      fireEvent.changeText(input, 'For all beings');

      expect(input.props.value).toBe('For all beings');
    });

    it('should allow multiline text input', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your offering...');
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('Confirm Button', () => {
    it('should display confirm button', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Complete')).toBeTruthy();
    });

    it('should call onConfirm with entered text when confirm button is pressed', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your offering...');
      fireEvent.changeText(input, 'For all beings');

      const confirmButton = screen.getByText('Complete');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('For all beings', '');
    });

    it('should call onConfirm with empty string if no text entered', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const confirmButton = screen.getByText('Complete');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('', '');
    });

    it('should have accessible label for confirm button', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('Complete practice with offering')).toBeTruthy();
    });
  });

  describe('Skip Button', () => {
    it('should display skip button', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Skip')).toBeTruthy();
    });

    it('should call onSkip when skip button is pressed', () => {
      render(
        <OfferingModal
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
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('Skip dedication')).toBeTruthy();
    });
  });

  describe('Elapsed Time Display', () => {
    it('should display elapsed time when provided', () => {
      render(
        <OfferingModal
          visible={true}
          elapsedTime="12:45"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText('Practice completed: 12:45')).toBeTruthy();
    });

    it('should not display elapsed time when not provided', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByText(/Practice completed:/)).toBeNull();
    });
  });

  describe('Initial Value', () => {
    it('should display initial value if provided', () => {
      render(
        <OfferingModal
          visible={true}
          initialValue="For world peace"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your offering...');
      expect(input.props.value).toBe('For world peace');
    });

    it('should allow editing initial value', () => {
      render(
        <OfferingModal
          visible={true}
          initialValue="For world peace"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const input = screen.getByPlaceholderText('Enter your offering...');
      fireEvent.changeText(input, 'For all sentient beings');

      expect(input.props.value).toBe('For all sentient beings');
    });
  });

  describe('Session Notes', () => {
    it('should display notes/reflection input field', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByPlaceholderText('Add notes or reflections (optional)...')).toBeTruthy();
    });

    it('should allow text input for notes', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const notesInput = screen.getByPlaceholderText('Add notes or reflections (optional)...');
      fireEvent.changeText(notesInput, 'Felt very peaceful today');

      expect(notesInput.props.value).toBe('Felt very peaceful today');
    });

    it('should pass both offering and notes to onConfirm', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const offeringInput = screen.getByPlaceholderText('Enter your offering...');
      const notesInput = screen.getByPlaceholderText('Add notes or reflections (optional)...');

      fireEvent.changeText(offeringInput, 'For all beings');
      fireEvent.changeText(notesInput, 'Great session today');

      const confirmButton = screen.getByText('Complete');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('For all beings', 'Great session today');
    });

    it('should pass offering and empty notes if notes not entered', () => {
      render(
        <OfferingModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const offeringInput = screen.getByPlaceholderText('Enter your offering...');
      fireEvent.changeText(offeringInput, 'For peace');

      const confirmButton = screen.getByText('Complete');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith('For peace', '');
    });

    it('should display initial notes value if provided', () => {
      render(
        <OfferingModal
          visible={true}
          initialNotesValue="Previous reflection"
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const notesInput = screen.getByPlaceholderText('Add notes or reflections (optional)...');
      expect(notesInput.props.value).toBe('Previous reflection');
    });
  });
});
