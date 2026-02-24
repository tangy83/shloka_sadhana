/**
 * Timer Component Tests
 * Shloka Sadhana - Practice Timer UI
 *
 * Tests for timer display and control buttons
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Timer } from '../Timer';

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
      render(
        <Timer
          status="idle"
          elapsedSeconds={0}
          formattedTime="00:00"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByText('00:00')).toBeTruthy();
    });

    it('should show Start button in idle state', () => {
      render(
        <Timer
          status="idle"
          elapsedSeconds={0}
          formattedTime="00:00"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const startButton = screen.getByText('Start');
      expect(startButton).toBeTruthy();
    });

    it('should call start when Start button is pressed', () => {
      render(
        <Timer
          status="idle"
          elapsedSeconds={0}
          formattedTime="00:00"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const startButton = screen.getByText('Start');
      fireEvent.press(startButton);

      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('should not show Reset button in idle state', () => {
      render(
        <Timer
          status="idle"
          elapsedSeconds={0}
          formattedTime="00:00"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.queryByText('Reset')).toBeNull();
      expect(screen.queryByText('Complete')).toBeNull();
    });
  });

  describe('Running State', () => {
    it('should display elapsed time in MM:SS format', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByText('01:15')).toBeTruthy();
    });

    it('should show Pause button in running state', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const pauseButton = screen.getByText('Pause');
      expect(pauseButton).toBeTruthy();
    });

    it('should call pause when Pause button is pressed', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const pauseButton = screen.getByText('Pause');
      fireEvent.press(pauseButton);

      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    it('should show Reset button in running state', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeTruthy();
    });

    it('should call reset when Reset button is pressed', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const resetButton = screen.getByText('Reset');
      fireEvent.press(resetButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should show Complete button with disabled styling when canComplete is false', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={30}
          formattedTime="00:30"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const completeButton = screen.getByLabelText('Complete practice session');
      expect(completeButton).toBeTruthy();
      expect(completeButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should show Complete button enabled when canComplete is true', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const completeButton = screen.getByLabelText('Complete practice session');
      expect(completeButton).toBeTruthy();
      expect(completeButton.props.accessibilityState.disabled).toBe(false);
    });

    it('should call complete when Complete button is pressed (if enabled)', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const completeButton = screen.getByLabelText('Complete practice session');
      fireEvent.press(completeButton);

      expect(mockComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Paused State', () => {
    it('should show Resume button in paused state', () => {
      render(
        <Timer
          status="paused"
          elapsedSeconds={45}
          formattedTime="00:45"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const resumeButton = screen.getByText('Resume');
      expect(resumeButton).toBeTruthy();
    });

    it('should call resume when Resume button is pressed', () => {
      render(
        <Timer
          status="paused"
          elapsedSeconds={45}
          formattedTime="00:45"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const resumeButton = screen.getByText('Resume');
      fireEvent.press(resumeButton);

      expect(mockResume).toHaveBeenCalledTimes(1);
    });

    it('should show Reset button in paused state', () => {
      render(
        <Timer
          status="paused"
          elapsedSeconds={45}
          formattedTime="00:45"
          canComplete={false}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeTruthy();
    });

    it('should preserve elapsed time display when paused', () => {
      render(
        <Timer
          status="paused"
          elapsedSeconds={105}
          formattedTime="01:45"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByText('01:45')).toBeTruthy();
    });
  });

  describe('Completed State', () => {
    it('should display completion message', () => {
      render(
        <Timer
          status="completed"
          elapsedSeconds={120}
          formattedTime="02:00"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByText('Practice Complete!')).toBeTruthy();
    });

    it('should show final elapsed time in completed state', () => {
      render(
        <Timer
          status="completed"
          elapsedSeconds={120}
          formattedTime="02:00"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByText('02:00')).toBeTruthy();
    });

    it('should show New Session button in completed state', () => {
      render(
        <Timer
          status="completed"
          elapsedSeconds={120}
          formattedTime="02:00"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const newSessionButton = screen.getByText('New Session');
      expect(newSessionButton).toBeTruthy();
    });

    it('should call reset when New Session button is pressed', () => {
      render(
        <Timer
          status="completed"
          elapsedSeconds={120}
          formattedTime="02:00"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      const newSessionButton = screen.getByText('New Session');
      fireEvent.press(newSessionButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for buttons', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByLabelText('Pause timer')).toBeTruthy();
      expect(screen.getByLabelText('Reset timer')).toBeTruthy();
      expect(screen.getByLabelText('Complete practice session')).toBeTruthy();
    });

    it('should have accessible label for timer display', () => {
      render(
        <Timer
          status="running"
          elapsedSeconds={75}
          formattedTime="01:15"
          canComplete={true}
          onStart={mockStart}
          onPause={mockPause}
          onResume={mockResume}
          onReset={mockReset}
          onComplete={mockComplete}
        />
      );

      expect(screen.getByLabelText('Elapsed time: 1 minute 15 seconds')).toBeTruthy();
    });
  });
});
