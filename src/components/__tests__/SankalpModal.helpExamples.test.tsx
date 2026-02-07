/**
 * SankalpModal Help & Examples Tests
 * Shloka Sadhana - V3 Feature #1
 *
 * Tests for Sankalp help text and example selection
 * Following TDD approach - RED phase
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SankalpModal } from '../SankalpModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SankalpModal - Help & Examples (V3 Feature #1)', () => {
  const mockOnConfirm = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Help Text', () => {
    it('should display help button/link "What\'s a sankalp?"', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText(/What's a sankalp\?/i)).toBeTruthy();
    });

    it('should show expanded help text when help button is pressed', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const helpButton = screen.getByText(/What's a sankalp\?/i);
      fireEvent.press(helpButton);

      // Check for help text content
      expect(
        screen.getByText(/A sankalp is a heartfelt intention/i)
      ).toBeTruthy();
    });

    it('should collapse help text when pressed again', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const helpButton = screen.getByText(/What's a sankalp\?/i);

      // Expand
      fireEvent.press(helpButton);
      expect(screen.getByText(/A sankalp is a heartfelt intention/i)).toBeTruthy();

      // Collapse
      fireEvent.press(helpButton);
      expect(screen.queryByText(/A sankalp is a heartfelt intention/i)).toBeNull();
    });

    it('should have accessible label for help button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('Learn what a sankalp is')).toBeTruthy();
    });
  });

  describe('First-Time Help Display', () => {
    it('should show full help text automatically on first open', async () => {
      // Simulate first-time user (no flag in storage)
      mockAsyncStorage.getItem.mockResolvedValue(null);

      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Wait for AsyncStorage check
      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
          '@shloka_sadhana:sankalp_explanation_seen'
        );
      });

      // Help text should be expanded automatically
      expect(
        screen.getByText(/A sankalp is a heartfelt intention/i)
      ).toBeTruthy();
    });

    it('should not show full help text automatically on subsequent opens', async () => {
      // Simulate returning user (flag exists in storage)
      mockAsyncStorage.getItem.mockResolvedValue('true');

      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Wait for AsyncStorage check
      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
          '@shloka_sadhana:sankalp_explanation_seen'
        );
      });

      // Help text should NOT be expanded automatically
      expect(
        screen.queryByText(/A sankalp is a heartfelt intention/i)
      ).toBeNull();
    });

    it('should save flag to AsyncStorage after first view', async () => {
      // Simulate first-time user
      mockAsyncStorage.getItem.mockResolvedValue(null);

      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Wait for flag to be set
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          '@shloka_sadhana:sankalp_explanation_seen',
          'true'
        );
      });
    });
  });

  describe('Example Sankalpas', () => {
    it('should display "Need inspiration?" button', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByText(/Need inspiration\?/i)).toBeTruthy();
    });

    it('should show example categories when "Need inspiration?" is pressed', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      // Check for category headers
      expect(screen.getByText('Personal')).toBeTruthy();
      expect(screen.getByText('Family')).toBeTruthy();
      expect(screen.getByText('Universal')).toBeTruthy();
      expect(screen.getByText('Spiritual')).toBeTruthy();
    });

    it('should display example sankalpas under each category', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      // Check for at least one example from each category
      expect(
        screen.getByText(/For my spiritual growth and inner peace/i)
      ).toBeTruthy();
      expect(
        screen.getByText(/For the health and happiness of my family/i)
      ).toBeTruthy();
      expect(
        screen.getByText(/For world peace and the welfare of all beings/i)
      ).toBeTruthy();
      expect(
        screen.getByText(/As an offering to the Divine/i)
      ).toBeTruthy();
    });

    it('should pre-fill text input when example is selected', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Open examples
      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      // Select an example
      const example = screen.getByText(/For my spiritual growth and inner peace/i);
      fireEvent.press(example);

      // Check that text input is filled
      const input = screen.getByPlaceholderText('Enter your intention...');
      expect(input.props.value).toBe('For my spiritual growth and inner peace');
    });

    it('should close examples section after selection', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Open examples
      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      // Select an example
      const example = screen.getByText(/For my spiritual growth and inner peace/i);
      fireEvent.press(example);

      // Examples section should be closed
      expect(screen.queryByText('Personal')).toBeNull();
    });

    it('should still allow editing after selecting an example', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Open examples and select
      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      const example = screen.getByText(/For my spiritual growth and inner peace/i);
      fireEvent.press(example);

      // Edit the text
      const input = screen.getByPlaceholderText('Enter your intention...');
      fireEvent.changeText(input, 'For my peace and wisdom');

      expect(input.props.value).toBe('For my peace and wisdom');
    });

    it('should have accessible labels for example buttons', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByLabelText('View example sankalpas')).toBeTruthy();
    });
  });

  describe('Help Text Content', () => {
    it('should include explanation of what a sankalp is', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const helpButton = screen.getByText(/What's a sankalp\?/i);
      fireEvent.press(helpButton);

      expect(
        screen.getByText(/A sankalp is a heartfelt intention you set before practice/i)
      ).toBeTruthy();
    });

    it('should mention that sankalp can be skipped', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      const helpButton = screen.getByText(/What's a sankalp\?/i);
      fireEvent.press(helpButton);

      expect(screen.getByText(/You can skip if you prefer/i)).toBeTruthy();
    });
  });

  describe('Integration with Existing Functionality', () => {
    it('should still allow confirm with example sankalp', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Select example
      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);
      const example = screen.getByText(/For my spiritual growth and inner peace/i);
      fireEvent.press(example);

      // Confirm
      const confirmButton = screen.getByText('Start Practice');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(
        'For my spiritual growth and inner peace'
      );
    });

    it('should not interfere with skip functionality', () => {
      render(
        <SankalpModal
          visible={true}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      );

      // Open help and examples
      const helpButton = screen.getByText(/What's a sankalp\?/i);
      fireEvent.press(helpButton);

      const inspirationButton = screen.getByText(/Need inspiration\?/i);
      fireEvent.press(inspirationButton);

      // Skip should still work
      const skipButton = screen.getByText('Skip');
      fireEvent.press(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });
});
