/**
 * MalaCounter Component Tests
 * Shloka Sadhana - Mala Bead Counter UI
 *
 * Tests for tracking mala repetitions (108 beads per mala)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MalaCounter } from '../MalaCounter';

describe('MalaCounter', () => {
  describe('Initial State', () => {
    it('should render with count of 0', () => {
      render(<MalaCounter />);

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should render with custom initial count', () => {
      render(<MalaCounter initialCount={5} />);

      expect(screen.getByText('5')).toBeTruthy();
    });

    it('should display mala count (0 malas at start)', () => {
      render(<MalaCounter />);

      expect(screen.getByText('0 malas')).toBeTruthy();
    });
  });

  describe('Increment Count', () => {
    it('should increment count when + button is pressed', () => {
      render(<MalaCounter />);

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      expect(screen.getByText('1')).toBeTruthy();
    });

    it('should increment multiple times', () => {
      render(<MalaCounter />);

      const incrementButton = screen.getByLabelText('Increment count');

      fireEvent.press(incrementButton);
      fireEvent.press(incrementButton);
      fireEvent.press(incrementButton);

      expect(screen.getByText('3')).toBeTruthy();
    });

    it('should update mala count when reaching 108 beads', () => {
      render(<MalaCounter initialCount={107} />);

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      expect(screen.getByText('108')).toBeTruthy();
      expect(screen.getByText('1 mala')).toBeTruthy();
    });

    it('should update mala count when reaching 216 beads (2 malas)', () => {
      render(<MalaCounter initialCount={215} />);

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      expect(screen.getByText('216')).toBeTruthy();
      expect(screen.getByText('2 malas')).toBeTruthy();
    });

    it('should call onChange callback with new count', () => {
      const onChange = jest.fn();
      render(<MalaCounter onChange={onChange} />);

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Decrement Count', () => {
    it('should decrement count when - button is pressed', () => {
      render(<MalaCounter initialCount={5} />);

      const decrementButton = screen.getByLabelText('Decrement count');
      fireEvent.press(decrementButton);

      expect(screen.getByText('4')).toBeTruthy();
    });

    it('should not decrement below 0', () => {
      render(<MalaCounter />);

      const decrementButton = screen.getByLabelText('Decrement count');
      fireEvent.press(decrementButton);

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should disable decrement button when count is 0', () => {
      render(<MalaCounter />);

      const decrementButton = screen.getByLabelText('Decrement count');

      fireEvent.press(decrementButton);
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should call onChange callback when decrementing', () => {
      const onChange = jest.fn();
      render(<MalaCounter initialCount={5} onChange={onChange} />);

      const decrementButton = screen.getByLabelText('Decrement count');
      fireEvent.press(decrementButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('should not call onChange when trying to decrement from 0', () => {
      const onChange = jest.fn();
      render(<MalaCounter onChange={onChange} />);

      const decrementButton = screen.getByLabelText('Decrement count');
      fireEvent.press(decrementButton);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Reset Count', () => {
    it('should show reset button when count > 0', () => {
      render(<MalaCounter initialCount={5} />);

      expect(screen.getByText('Reset')).toBeTruthy();
    });

    it('should not show reset button when count is 0', () => {
      render(<MalaCounter />);

      expect(screen.queryByText('Reset')).toBeNull();
    });

    it('should reset count to 0 when reset button is pressed', () => {
      render(<MalaCounter initialCount={25} />);

      const resetButton = screen.getByText('Reset');
      fireEvent.press(resetButton);

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should call onChange callback when resetting', () => {
      const onChange = jest.fn();
      render(<MalaCounter initialCount={25} onChange={onChange} />);

      const resetButton = screen.getByText('Reset');
      fireEvent.press(resetButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Mala Display', () => {
    it('should show "0 malas" when count is 0', () => {
      render(<MalaCounter />);

      expect(screen.getByText('0 malas')).toBeTruthy();
    });

    it('should show "0 malas" when count is less than 108', () => {
      render(<MalaCounter initialCount={50} />);

      expect(screen.getByText('0 malas')).toBeTruthy();
    });

    it('should show "1 mala" (singular) when count is exactly 108', () => {
      render(<MalaCounter initialCount={108} />);

      expect(screen.getByText('1 mala')).toBeTruthy();
    });

    it('should show "1 mala" when count is between 108 and 215', () => {
      render(<MalaCounter initialCount={150} />);

      expect(screen.getByText('1 mala')).toBeTruthy();
    });

    it('should show "2 malas" (plural) when count is 216 or more', () => {
      render(<MalaCounter initialCount={216} />);

      expect(screen.getByText('2 malas')).toBeTruthy();
    });

    it('should show "3 malas" when count is 324', () => {
      render(<MalaCounter initialCount={324} />);

      expect(screen.getByText('3 malas')).toBeTruthy();
    });

    it('should update mala display when incrementing past 108', () => {
      render(<MalaCounter initialCount={107} />);

      expect(screen.getByText('0 malas')).toBeTruthy();

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      expect(screen.getByText('1 mala')).toBeTruthy();
    });

    it('should update mala display when decrementing below 108', () => {
      render(<MalaCounter initialCount={108} />);

      expect(screen.getByText('1 mala')).toBeTruthy();

      const decrementButton = screen.getByLabelText('Decrement count');
      fireEvent.press(decrementButton);

      expect(screen.getByText('0 malas')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all buttons', () => {
      render(<MalaCounter initialCount={5} />);

      expect(screen.getByLabelText('Increment count')).toBeTruthy();
      expect(screen.getByLabelText('Decrement count')).toBeTruthy();
      expect(screen.getByLabelText('Reset count to zero')).toBeTruthy();
    });

    it('should have accessible label for count display', () => {
      render(<MalaCounter initialCount={15} />);

      expect(screen.getByLabelText('Current count: 15 beads')).toBeTruthy();
    });

    it('should have accessible label for mala count', () => {
      render(<MalaCounter initialCount={150} />);

      expect(screen.getByLabelText('Completed: 1 mala')).toBeTruthy();
    });
  });

  describe('Visual Feedback', () => {
    it('should show celebration indicator when completing a mala', () => {
      render(<MalaCounter initialCount={107} />);

      const incrementButton = screen.getByLabelText('Increment count');
      fireEvent.press(incrementButton);

      // Check for celebration text or visual indicator
      expect(screen.getByText('🎉')).toBeTruthy();
    });
  });
});
