/**
 * Practice Store Tests
 * Tests for session lifecycle, mala counter, modal state, and persistence
 */

import { usePracticeStore } from '@/stores/usePracticeStore';
import * as practiceStorage from '@/utils/practiceStorage';

jest.mock('@/utils/practiceStorage');

const mockPracticeStorage = practiceStorage as jest.Mocked<typeof practiceStorage>;

function resetPracticeStore() {
  usePracticeStore.setState({
    malaCount: 0,
    sankalp: '',
    offering: '',
    sessionStartTime: null,
    selectedShlokaId: null,
    selectedShlokaName: null,
    showSankalpModal: false,
    showOfferingModal: false,
    hasShownSankalp: false,
  });
}

describe('usePracticeStore — Mala Counter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPracticeStore();
    mockPracticeStorage.saveActivePractice.mockResolvedValue(undefined);
    // Seed a session so saveSessionToStorage actually saves
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });
  });

  it('should start with malaCount of 0', () => {
    usePracticeStore.setState({ malaCount: 0 });
    expect(usePracticeStore.getState().malaCount).toBe(0);
  });

  it('should increment malaCount by 1', () => {
    usePracticeStore.getState().incrementMala();
    expect(usePracticeStore.getState().malaCount).toBe(1);
  });

  it('should increment malaCount multiple times correctly', () => {
    usePracticeStore.getState().incrementMala();
    usePracticeStore.getState().incrementMala();
    usePracticeStore.getState().incrementMala();
    expect(usePracticeStore.getState().malaCount).toBe(3);
  });

  it('should decrement malaCount by 1', () => {
    usePracticeStore.setState({ malaCount: 5 });
    usePracticeStore.getState().decrementMala();
    expect(usePracticeStore.getState().malaCount).toBe(4);
  });

  it('should NOT decrement below 0 (floor at 0)', () => {
    usePracticeStore.setState({ malaCount: 0 });
    usePracticeStore.getState().decrementMala();
    expect(usePracticeStore.getState().malaCount).toBe(0);
  });

  it('should reset malaCount to 0', () => {
    usePracticeStore.setState({ malaCount: 108 });
    usePracticeStore.getState().resetMala();
    expect(usePracticeStore.getState().malaCount).toBe(0);
  });

  it('should set malaCount directly', () => {
    usePracticeStore.getState().setMalaCount(27);
    expect(usePracticeStore.getState().malaCount).toBe(27);
  });

  it('should floor setMalaCount at 0 for negative values', () => {
    usePracticeStore.getState().setMalaCount(-5);
    expect(usePracticeStore.getState().malaCount).toBe(0);
  });
});

describe('usePracticeStore — Session Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPracticeStore();
    mockPracticeStorage.saveActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.clearActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.savePracticeToHistory.mockResolvedValue(undefined);
  });

  it('should start session with correct initial state', () => {
    usePracticeStore.getState().startSession('gayatri', 'Gayatri Mantra');

    const state = usePracticeStore.getState();
    expect(state.selectedShlokaId).toBe('gayatri');
    expect(state.selectedShlokaName).toBe('Gayatri Mantra');
    expect(state.malaCount).toBe(0);
    expect(state.sankalp).toBe('');
    expect(state.offering).toBe('');
    expect(state.hasShownSankalp).toBe(false);
    expect(state.sessionStartTime).not.toBeNull();
  });

  it('should start session without a shloka (free practice)', () => {
    usePracticeStore.getState().startSession();

    const state = usePracticeStore.getState();
    expect(state.selectedShlokaId).toBeNull();
    expect(state.selectedShlokaName).toBeNull();
    expect(state.sessionStartTime).not.toBeNull();
  });

  it('should reset mala and sankalp when starting new session', () => {
    // Simulate leftover from previous session
    usePracticeStore.setState({ malaCount: 5, sankalp: 'Old sankalp' });

    usePracticeStore.getState().startSession();

    expect(usePracticeStore.getState().malaCount).toBe(0);
    expect(usePracticeStore.getState().sankalp).toBe('');
  });

  it('should end session and save to history', async () => {
    usePracticeStore.setState({
      sessionStartTime: new Date().toISOString(),
      malaCount: 3,
      selectedShlokaId: 'gayatri',
      selectedShlokaName: 'Gayatri Mantra',
      sankalp: 'World peace',
      offering: 'Flowers',
    });

    await usePracticeStore.getState().endSession();

    expect(mockPracticeStorage.savePracticeToHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        malaCount: 3,
        shlokaId: 'gayatri',
        shlokaName: 'Gayatri Mantra',
        sankalp: 'World peace',
        offering: 'Flowers',
      })
    );
  });

  it('should clear active practice from storage on end session', async () => {
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });

    await usePracticeStore.getState().endSession();

    expect(mockPracticeStorage.clearActivePractice).toHaveBeenCalled();
  });

  it('should reset session state after endSession', async () => {
    usePracticeStore.setState({
      sessionStartTime: new Date().toISOString(),
      malaCount: 10,
      sankalp: 'Test',
    });

    await usePracticeStore.getState().endSession();

    const state = usePracticeStore.getState();
    expect(state.malaCount).toBe(0);
    expect(state.sankalp).toBe('');
    expect(state.sessionStartTime).toBeNull();
  });

  it('should generate practice with id and date in endSession', async () => {
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });

    await usePracticeStore.getState().endSession();

    expect(mockPracticeStorage.savePracticeToHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^practice_\d+$/),
        date: expect.any(String),
      })
    );
  });
});

describe('usePracticeStore — Modal State', () => {
  beforeEach(() => {
    resetPracticeStore();
  });

  it('should toggle sankalp modal on/off', () => {
    expect(usePracticeStore.getState().showSankalpModal).toBe(false);

    usePracticeStore.getState().toggleSankalpModal();
    expect(usePracticeStore.getState().showSankalpModal).toBe(true);

    usePracticeStore.getState().toggleSankalpModal();
    expect(usePracticeStore.getState().showSankalpModal).toBe(false);
  });

  it('should force-show sankalp modal with explicit true', () => {
    usePracticeStore.getState().toggleSankalpModal(true);
    expect(usePracticeStore.getState().showSankalpModal).toBe(true);
  });

  it('should force-hide sankalp modal with explicit false', () => {
    usePracticeStore.setState({ showSankalpModal: true });
    usePracticeStore.getState().toggleSankalpModal(false);
    expect(usePracticeStore.getState().showSankalpModal).toBe(false);
  });

  it('should toggle offering modal on/off', () => {
    expect(usePracticeStore.getState().showOfferingModal).toBe(false);

    usePracticeStore.getState().toggleOfferingModal();
    expect(usePracticeStore.getState().showOfferingModal).toBe(true);

    usePracticeStore.getState().toggleOfferingModal();
    expect(usePracticeStore.getState().showOfferingModal).toBe(false);
  });

  it('should set hasShownSankalp flag', () => {
    expect(usePracticeStore.getState().hasShownSankalp).toBe(false);
    usePracticeStore.getState().setHasShownSankalp(true);
    expect(usePracticeStore.getState().hasShownSankalp).toBe(true);
  });
});

describe('usePracticeStore — Session Data Setters', () => {
  beforeEach(() => {
    resetPracticeStore();
    mockPracticeStorage.saveActivePractice.mockResolvedValue(undefined);
  });

  it('should set sankalp text', () => {
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });
    usePracticeStore.getState().setSankalp('For the good of all');
    expect(usePracticeStore.getState().sankalp).toBe('For the good of all');
  });

  it('should set offering text', () => {
    usePracticeStore.getState().setOffering('Incense and flowers');
    expect(usePracticeStore.getState().offering).toBe('Incense and flowers');
  });

  it('should set session start time', () => {
    const time = '2026-02-17T06:00:00.000Z';
    usePracticeStore.getState().setSessionStartTime(time);
    expect(usePracticeStore.getState().sessionStartTime).toBe(time);
  });
});

describe('usePracticeStore — Reset Session', () => {
  beforeEach(() => {
    resetPracticeStore();
  });

  it('should reset all session state to defaults', () => {
    usePracticeStore.setState({
      malaCount: 108,
      sankalp: 'Test sankalp',
      offering: 'Flowers',
      sessionStartTime: '2026-02-17T06:00:00.000Z',
      selectedShlokaId: 'gayatri',
      selectedShlokaName: 'Gayatri Mantra',
      showSankalpModal: true,
      showOfferingModal: true,
      hasShownSankalp: true,
    });

    usePracticeStore.getState().resetSession();

    const state = usePracticeStore.getState();
    expect(state.malaCount).toBe(0);
    expect(state.sankalp).toBe('');
    expect(state.offering).toBe('');
    expect(state.sessionStartTime).toBeNull();
    expect(state.selectedShlokaId).toBeNull();
    expect(state.selectedShlokaName).toBeNull();
    expect(state.showSankalpModal).toBe(false);
    expect(state.showOfferingModal).toBe(false);
    expect(state.hasShownSankalp).toBe(false);
  });
});
