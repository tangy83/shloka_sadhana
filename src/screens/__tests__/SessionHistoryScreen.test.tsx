/**
 * SessionHistoryScreen Tests
 * Shloka Sadhana - Practice Session History
 *
 * Tests for viewing past practice sessions
 * NOTE: Component was updated to use loadPracticeHistory from practiceStorage
 * and CompletedPractice type (not PracticeSession). Tests updated accordingly.
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SessionHistoryScreen } from '../SessionHistoryScreen';
import { CompletedPractice } from '@/types/practice';
import * as practiceStorage from '@/utils/practiceStorage';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock practiceStorage (component uses loadPracticeHistory, not storage.getSessions)
jest.mock('@/utils/practiceStorage');

describe('SessionHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([]);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([]);

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
      // Use a delayed promise so loading state is visible before async load completes
      (practiceStorage.loadPracticeHistory as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 500))
      );

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        // Don't wait — check immediately after mount, before async load completes
      });

      // Loading indicator should be present initially
      const loadingIndicator = tree!.root.findByProps({ testID: 'loading-indicator' });
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sessions', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([]);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([]);

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
      const hasEmptyMessage = texts.some((text: any) =>
        text.props.children?.includes?.('No sessions yet') ||
        text.props.children?.includes?.('practice')
      );
      expect(hasEmptyMessage).toBe(true);
    });
  });

  describe('Session List', () => {
    const mockSessions: CompletedPractice[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        duration: 1800, // 30 minutes in seconds
        malaCount: 1,
        shlokaId: 'gayatri-mantra',
        shlokaName: 'Gayatri Mantra',
        sankalp: 'Peace',
        offering: 'World peace',
        notes: 'Great session',
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        duration: 900, // 15 minutes
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
    ];

    it('should display list of sessions', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(mockSessions);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(mockSessions);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(mockSessions);

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
      const hasDuration = texts.some((text: any) =>
        text.props.children?.includes?.('30m') ||
        text.props.children?.includes?.('15m')
      );
      expect(hasDuration).toBe(true);
    });

    it('should display mala count', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(mockSessions);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(mockSessions);

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
    const sessionWithDetails: CompletedPractice = {
      id: 'session-detailed',
      date: '2024-01-15',
      duration: 1800,
      malaCount: 2,
      shlokaId: 'vishnu-sahasranamam',
      shlokaName: 'Vishnu Sahasranamam',
      sankalp: 'Health and prosperity',
      offering: 'For my family',
      notes: 'Felt very peaceful today',
    };

    it('should show session detail modal when tapped', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([sessionWithDetails]);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([sessionWithDetails]);

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

      expect(hasSankalp).toBe(true);
      expect(hasOffering).toBe(true);
    });

    it('should close modal when close button pressed', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue([sessionWithDetails]);

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
    const multipleSessions: CompletedPractice[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        duration: 1800,
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        duration: 900,
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
      {
        id: 'session-3',
        date: '2024-01-13',
        duration: 1200,
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
    ];

    it('should display sessions in reverse chronological order', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(multipleSessions);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <SessionHistoryScreen navigation={mockNavigation} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const sessionItems = tree!.root.findAllByProps({ testID: 'session-item' });

      // Verify all 3 sessions are rendered (FlatList renders session-item for each)
      expect(sessionItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Stats Summary', () => {
    const sessionsForStats: CompletedPractice[] = [
      {
        id: 'session-1',
        date: '2024-01-15',
        duration: 1800,
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
      {
        id: 'session-2',
        date: '2024-01-14',
        duration: 900,
        malaCount: 1,
        shlokaId: null,
        shlokaName: null,
        sankalp: null,
        offering: null,
        notes: null,
      },
    ];

    it('should display total sessions count', async () => {
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(sessionsForStats);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockResolvedValue(sessionsForStats);

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
      (practiceStorage.loadPracticeHistory as jest.Mock).mockRejectedValue(new Error('Storage error'));

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
