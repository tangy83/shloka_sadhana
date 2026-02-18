/**
 * Quest Flow Integration Tests
 * Shloka Sadhana - Phase 2A Week 13-14
 *
 * End-to-end tests for quest generation, completion, and rewards
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { questService } from '@/services/questService';
import { useQuestStore } from '@/stores/useQuestStore';
import { QuestType, QuestStatus } from '@/types/quests';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: {
      shlokaId: 'gayatri',
      shlokaName: 'Gayatri Mantra',
    },
  }),
}));

// Mock Firebase
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
      })),
    })),
  })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123' },
  })),
}));

describe('Quest Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuestStore.setState({
      currentQuest: null,
      completedQuests: [],
      totalXP: 0,
    });
  });

  it('should generate daily quest on app launch', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText(/Daily Quest/i)).toBeTruthy();
    });

    const state = useQuestStore.getState();
    expect(state.currentQuest).toBeDefined();
    expect(state.currentQuest?.status).toBe(QuestStatus.ACTIVE);
  });

  it('should update quest progress during practice session', async () => {
    // Set up initial quest
    const quest = {
      id: 'quest-1',
      type: QuestType.PRACTICE_ONCE,
      target: 1,
      progress: 0,
      xpReward: 10,
      status: QuestStatus.ACTIVE,
      startedAt: new Date().toISOString(),
    };

    useQuestStore.setState({ currentQuest: quest });

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <PracticeScreen />
      </NavigationContainer>
    );

    // Start timer
    const startButton = getByText(/Start Practice/i);
    fireEvent.press(startButton);

    // Wait for minimum practice time (60 seconds)
    jest.advanceTimersByTime(60000);

    // Complete practice
    const completeButton = getByTestId('complete-practice-button');
    fireEvent.press(completeButton);

    await waitFor(() => {
      const state = useQuestStore.getState();
      expect(state.currentQuest?.progress).toBe(1);
    });
  });

  it('should show quest completion modal when quest is completed', async () => {
    const quest = {
      id: 'quest-1',
      type: QuestType.PRACTICE_ONCE,
      target: 1,
      progress: 0,
      xpReward: 10,
      status: QuestStatus.ACTIVE,
      startedAt: new Date().toISOString(),
    };

    useQuestStore.setState({ currentQuest: quest });

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <PracticeScreen />
      </NavigationContainer>
    );

    // Complete practice
    fireEvent.press(getByText(/Start Practice/i));
    jest.advanceTimersByTime(60000);
    fireEvent.press(getByTestId('complete-practice-button'));

    await waitFor(() => {
      expect(getByText(/Quest Complete/i)).toBeTruthy();
      expect(getByText(/\+10 XP/i)).toBeTruthy();
    });
  });

  it('should award XP after quest completion', async () => {
    const quest = {
      id: 'quest-1',
      type: QuestType.PRACTICE_DURATION,
      target: 600, // 10 minutes
      progress: 0,
      xpReward: 20,
      status: QuestStatus.ACTIVE,
      startedAt: new Date().toISOString(),
    };

    useQuestStore.setState({ currentQuest: quest, totalXP: 0 });

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <PracticeScreen />
      </NavigationContainer>
    );

    // Complete 10-minute practice
    fireEvent.press(getByText(/Start Practice/i));
    jest.advanceTimersByTime(600000); // 10 minutes
    fireEvent.press(getByTestId('complete-practice-button'));

    await waitFor(() => {
      const state = useQuestStore.getState();
      expect(state.totalXP).toBe(20);
      expect(state.currentQuest?.status).toBe(QuestStatus.COMPLETED);
    });
  });

  it('should add completed quest to history', async () => {
    const quest = {
      id: 'quest-1',
      type: QuestType.PRACTICE_ONCE,
      target: 1,
      progress: 0,
      xpReward: 10,
      status: QuestStatus.ACTIVE,
      startedAt: new Date().toISOString(),
    };

    useQuestStore.setState({ currentQuest: quest, completedQuests: [] });

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <PracticeScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText(/Start Practice/i));
    jest.advanceTimersByTime(60000);
    fireEvent.press(getByTestId('complete-practice-button'));

    await waitFor(() => {
      const state = useQuestStore.getState();
      expect(state.completedQuests).toHaveLength(1);
      expect(state.completedQuests[0].id).toBe('quest-1');
    });
  });
});
