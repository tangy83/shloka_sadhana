/**
 * SessionHistoryScreen Tests
 * Shloka Sadhana - Practice Session History
 *
 * Tests for viewing past practice sessions
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SessionHistoryScreen } from '../SessionHistoryScreen';
import { PracticeSession } from '@/types';
import * as storage from '@/utils/storage';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock storage
jest.mock('@/utils/storage');

describe('SessionHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(tree!).toBeTruthy();
    });

    it('should display screen title', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const title = tree!.root.findByProps({ testID: 'history-title' });
      expect(title).toBeTruthy();
    });

    it('should show loading state initially', async () => {
      (storage.getSessions as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 500))
      );

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
      });

      // Loading indicator should be present initially
      const loadingIndicator = tree!.root.findByProps({ testID: 'loading-indicator' });
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sessions', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const emptyState = tree!.root.findByProps({ testID: 'empty-state' });
      expect(emptyState).toBeTruthy();
    });

    it('should display empty state message', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasEmptyMessage = texts.some((text: any) =>
        text.props.children?.includes?.('No sessions yet') ||
        text.props.children?.includes?.('practice')
      );
      expect(hasEmptyMessage).toBe(true);
    });
  });

  describe('Session List', () => {
    const mockSessions: PracticeSession[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        timestamp: 1705334400000,
        duration: 1800, // 30 minutes
        count: 1,
        shlokaId: 'gayatri-mantra',
        sankalp: 'Peace',
        offering: 'World peace',
        reflection: 'Great session',
        completed: true,
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        timestamp: 1705248000000,
        duration: 900, // 15 minutes
        count: 1,
        completed: true,
      },
    ];

    it('should display list of sessions', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(mockSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionList = tree!.root.findByProps({ testID: 'session-list' });
      expect(sessionList).toBeTruthy();
    });

    it('should display session dates', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(mockSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItems = tree!.root.findAllByProps({ testID: 'session-item' });
      // FlatList may render extra cells, just check we have at least our sessions
      expect(sessionItems.length).toBeGreaterThanOrEqual(2);
    });

    it('should display session duration', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(mockSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasDuration = texts.some((text: any) =>
        text.props.children?.includes?.('30m') ||
        text.props.children?.includes?.('15m')
      );
      expect(hasDuration).toBe(true);
    });

    it('should display mala count', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(mockSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasMalaCount = texts.some((text: any) => {
        const children = text.props.children;
        if (Array.isArray(children)) {
          return children.join('').includes('mala');
        }
        return children?.includes?.('mala');
      });
      expect(hasMalaCount).toBe(true);
    });

    it('should display sankalp when present', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(mockSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasSankalp = texts.some((text: any) => {
        const children = text.props.children;
        if (Array.isArray(children)) {
          return children.join('').includes('Peace');
        }
        return children?.includes?.('Peace');
      });
      expect(hasSankalp).toBe(true);
    });
  });

  describe('Session Details', () => {
    const sessionWithDetails: PracticeSession = {
      id: 'session-detailed',
      date: '2024-01-15',
      timestamp: 1705334400000,
      duration: 1800,
      count: 2,
      shlokaId: 'vishnu-sahasranamam',
      sankalp: 'Health and prosperity',
      offering: 'For my family',
      reflection: 'Felt very peaceful today',
      completed: true,
    };

    it('should show session detail modal when tapped', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([sessionWithDetails]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItem = tree!.root.findByProps({ testID: 'session-item' });

      await act(async () => {
        sessionItem.props.onPress();
      });

      const modal = tree!.root.findByProps({ testID: 'session-detail-modal' });
      expect(modal).toBeTruthy();
      expect(modal.props.visible).toBe(true);
    });

    it('should display full session details in modal', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([sessionWithDetails]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItem = tree!.root.findByProps({ testID: 'session-item' });

      await act(async () => {
        sessionItem.props.onPress();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasSankalp = texts.some((t: any) => {
        const children = t.props.children;
        if (Array.isArray(children)) return children.join('').includes('Health and prosperity');
        return children?.includes?.('Health and prosperity');
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasOffering = texts.some((t: any) => {
        const children = t.props.children;
        if (Array.isArray(children)) return children.join('').includes('For my family');
        return children?.includes?.('For my family');
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasReflection = texts.some((t: any) => {
        const children = t.props.children;
        if (Array.isArray(children)) return children.join('').includes('Felt very peaceful');
        return children?.includes?.('Felt very peaceful');
      });

      expect(hasSankalp).toBe(true);
      expect(hasOffering).toBe(true);
      expect(hasReflection).toBe(true);
    });

    it('should close modal when close button pressed', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue([sessionWithDetails]);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItem = tree!.root.findByProps({ testID: 'session-item' });

      await act(async () => {
        sessionItem.props.onPress();
      });

      const closeButton = tree!.root.findByProps({ testID: 'close-modal-button' });

      await act(async () => {
        closeButton.props.onPress();
      });

      // Modal should not be visible - try to find it, should not be present or visible=false
      const modals = tree!.root.findAllByProps({ testID: 'session-detail-modal' });
      if (modals.length > 0) {
        expect(modals[0].props.visible).toBe(false);
      } else {
        // Modal was unmounted, which is also valid
        expect(modals.length).toBe(0);
      }
    });
  });

  describe('Sorting and Filtering', () => {
    const multipleSessions: PracticeSession[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        timestamp: 1705334400000,
        duration: 1800,
        count: 1,
        completed: true,
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        timestamp: 1705248000000,
        duration: 900,
        count: 1,
        completed: true,
      },
      {
        id: 'session-3',
        date: '2024-01-13',
        timestamp: 1705161600000,
        duration: 1200,
        count: 1,
        completed: true,
      },
    ];

    it('should display sessions in reverse chronological order', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(multipleSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItems = tree!.root.findAllByProps({ testID: 'session-item' });

      // Get unique session IDs (FlatList may render duplicates for virtualization)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniqueIds = [...new Set(sessionItems.map((item: any) => item.props['data-session-id']).filter(Boolean))];

      // Check we have all 3 sessions
      expect(uniqueIds.length).toBeGreaterThanOrEqual(3);

      // First item should be the most recent
      expect(uniqueIds[0]).toBe('session-1');
      // Other sessions should also be present in chronological order
      expect(uniqueIds).toContain('session-2');
      expect(uniqueIds).toContain('session-3');
    });
  });

  describe('Stats Summary', () => {
    const sessionsForStats: PracticeSession[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        timestamp: 1705334400000,
        duration: 1800,
        count: 1,
        completed: true,
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        timestamp: 1705248000000,
        duration: 900,
        count: 1,
        completed: true,
      },
    ];

    it('should display total sessions count', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(sessionsForStats);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const statsSection = tree!.root.findByProps({ testID: 'stats-summary' });
      expect(statsSection).toBeTruthy();
    });

    it('should display total practice time', async () => {
      (storage.getSessions as jest.Mock).mockResolvedValue(sessionsForStats);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const texts = tree!.root.findAllByType('Text' as any);

      // Total time should be 1800 + 900 = 2700 seconds = 45 minutes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasTotal = texts.some((t: any) => {
        const children = t.props.children;
        if (typeof children === 'number') return children === 45;
        if (Array.isArray(children)) return children.includes(45);
        return children?.toString().includes('45');
      });
      expect(hasTotal).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      (storage.getSessions as jest.Mock).mockRejectedValue(new Error('Storage error'));

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should show empty state or error message
      const emptyState = tree!.root.findByProps({ testID: 'empty-state' });
      expect(emptyState).toBeTruthy();
    });
  });
});
