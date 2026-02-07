/**
 * Timer Component Tests
 * Shloka Sadhana - Practice Timer UI
 *
 * Tests for timer display and control buttons
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Timer } from '../Timer';
import { useTimer } from '../../hooks/useTimer';

// Mock the useTimer hook
jest.mock('../../hooks/useTimer');
const mockUseTimer = useTimer as jest.MockedFunction<typeof useTimer>;

describe('Timer', () => {
  const mockStart = jest.fn();
  const mockPause = jest.fn();
  const mockResume = jest.fn();
  const mockReset = jest.fn();
  const mockComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Idle State', () => {
    it('should render timer display showing 00:00', () => {
      mockUseTimer.mockReturnValue({
        status: 'idle',
        elapsedSeconds: 0,
        formattedTime: '00:00',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('00:00')).toBeTruthy();
    });

    it('should show Start button in idle state', () => {
      mockUseTimer.mockReturnValue({
        status: 'idle',
        elapsedSeconds: 0,
        formattedTime: '00:00',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const startButton = screen.getByText('Start');
      expect(startButton).toBeTruthy();
    });

    it('should call start when Start button is pressed', () => {
      mockUseTimer.mockReturnValue({
        status: 'idle',
        elapsedSeconds: 0,
        formattedTime: '00:00',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const startButton = screen.getByText('Start');
      fireEvent.press(startButton);

      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('should not show Reset button in idle state', () => {
      mockUseTimer.mockReturnValue({
        status: 'idle',
        elapsedSeconds: 0,
        formattedTime: '00:00',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.queryByText('Reset')).toBeNull();
    });
  });

  describe('Running State', () => {
    it('should display elapsed time in MM:SS format', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 75,
        formattedTime: '01:15',
        isRunning: true,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('01:15')).toBeTruthy();
    });

    it('should show Pause button in running state', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 30,
        formattedTime: '00:30',
        isRunning: true,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const pauseButton = screen.getByText('Pause');
      expect(pauseButton).toBeTruthy();
    });

    it('should call pause when Pause button is pressed', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 30,
        formattedTime: '00:30',
        isRunning: true,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const pauseButton = screen.getByText('Pause');
      fireEvent.press(pauseButton);

      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    it('should show Reset button in running state', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 30,
        formattedTime: '00:30',
        isRunning: true,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('Reset')).toBeTruthy();
    });

    it('should call reset when Reset button is pressed', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 30,
        formattedTime: '00:30',
        isRunning: true,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const resetButton = screen.getByText('Reset');
      fireEvent.press(resetButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should show Complete button with disabled styling when canComplete is false', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 30,
        formattedTime: '00:30',
        isRunning: true,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const completeButton = screen.getByText('Complete');
      expect(completeButton).toBeTruthy();

      // Test that pressing disabled button doesn't call complete
      fireEvent.press(completeButton);
      expect(mockComplete).not.toHaveBeenCalled();
    });

    it('should show Complete button enabled when canComplete is true', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 70,
        formattedTime: '01:10',
        isRunning: true,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const completeButton = screen.getByText('Complete');
      expect(completeButton).toBeTruthy();

      // Test that pressing enabled button calls complete
      fireEvent.press(completeButton);
      expect(mockComplete).toHaveBeenCalledTimes(1);
    });

    it('should call complete when Complete button is pressed (if enabled)', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 70,
        formattedTime: '01:10',
        isRunning: true,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const completeButton = screen.getByText('Complete');
      fireEvent.press(completeButton);

      expect(mockComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Paused State', () => {
    it('should show Resume button in paused state', () => {
      mockUseTimer.mockReturnValue({
        status: 'paused',
        elapsedSeconds: 45,
        formattedTime: '00:45',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const resumeButton = screen.getByText('Resume');
      expect(resumeButton).toBeTruthy();
    });

    it('should call resume when Resume button is pressed', () => {
      mockUseTimer.mockReturnValue({
        status: 'paused',
        elapsedSeconds: 45,
        formattedTime: '00:45',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const resumeButton = screen.getByText('Resume');
      fireEvent.press(resumeButton);

      expect(mockResume).toHaveBeenCalledTimes(1);
    });

    it('should show Reset button in paused state', () => {
      mockUseTimer.mockReturnValue({
        status: 'paused',
        elapsedSeconds: 45,
        formattedTime: '00:45',
        isRunning: false,
        canComplete: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('Reset')).toBeTruthy();
    });

    it('should preserve elapsed time display when paused', () => {
      mockUseTimer.mockReturnValue({
        status: 'paused',
        elapsedSeconds: 105,
        formattedTime: '01:45',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('01:45')).toBeTruthy();
    });
  });

  describe('Completed State', () => {
    it('should display completion message', () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('Practice Complete!')).toBeTruthy();
    });

    it('should show final elapsed time in completed state', () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('02:00')).toBeTruthy();
    });

    it('should show New Session button in completed state', () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByText('New Session')).toBeTruthy();
    });

    it('should call reset when New Session button is pressed', () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      const newSessionButton = screen.getByText('New Session');
      fireEvent.press(newSessionButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for buttons', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 70,
        formattedTime: '01:10',
        isRunning: true,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByLabelText('Pause timer')).toBeTruthy();
      expect(screen.getByLabelText('Reset timer')).toBeTruthy();
      expect(screen.getByLabelText('Complete practice session')).toBeTruthy();
    });

    it('should have accessible label for timer display', () => {
      mockUseTimer.mockReturnValue({
        status: 'running',
        elapsedSeconds: 75,
        formattedTime: '01:15',
        isRunning: true,
        canComplete: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<Timer />);

      expect(screen.getByLabelText('Elapsed time: 1 minute 15 seconds')).toBeTruthy();
    });
  });
});
