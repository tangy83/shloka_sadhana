/**
 * Audio Service Tests
 * Shloka Sadhana - Audio Playback System
 *
 * Tests for audio playback with expo-av
 */

// Mock expo-av BEFORE imports
import { Audio } from 'expo-av';
import {
  loadAudio,
  playAudio,
  pauseAudio,
  stopAudio,
  unloadAudio,
  getAudioStatus,
  seekAudio,
} from '../audio';

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

const mockAudio = Audio as jest.Mocked<typeof Audio>;

describe('Audio Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock sound object
    mockSound = {
      playAsync: jest.fn(),
      pauseAsync: jest.fn(),
      stopAsync: jest.fn(),
      unloadAsync: jest.fn(),
      getStatusAsync: jest.fn(),
      setPositionAsync: jest.fn(),
      setOnPlaybackStatusUpdate: jest.fn(),
    };

    (mockAudio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
      status: {
        isLoaded: true,
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 60000,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
  });

  describe('loadAudio', () => {
    it('should load audio from URL', async () => {
      const audioUrl = 'https://example.com/audio.mp3';
      const sound = await loadAudio(audioUrl);

      expect(sound).toBe(mockSound);
      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: audioUrl },
        { shouldPlay: false }
      );
    });

    it('should load audio from local file number (require)', async () => {
      const audioFile = 12345; // Mock require() ID
      const sound = await loadAudio(audioFile);

      expect(sound).toBe(mockSound);
      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        audioFile,
        { shouldPlay: false }
      );
    });

    it('should return null on error', async () => {
      (mockAudio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(new Error('Load error'));

      const sound = await loadAudio('https://example.com/audio.mp3');

      expect(sound).toBeNull();
    });
  });

  describe('playAudio', () => {
    it('should play audio successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockSound.playAsync.mockResolvedValue({ isPlaying: true } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await playAudio(mockSound);

      expect(result).toBe(true);
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockSound.playAsync.mockRejectedValue(new Error('Play error'));

      const result = await playAudio(mockSound);

      expect(result).toBe(false);
    });

    it('should handle null sound', async () => {
      const result = await playAudio(null);

      expect(result).toBe(false);
    });
  });

  describe('pauseAudio', () => {
    it('should pause audio successfully', async () => {
      mockSound.pauseAsync.mockResolvedValue({ isPlaying: false } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await pauseAudio(mockSound);

      expect(result).toBe(true);
      expect(mockSound.pauseAsync).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockSound.pauseAsync.mockRejectedValue(new Error('Pause error'));

      const result = await pauseAudio(mockSound);

      expect(result).toBe(false);
    });

    it('should handle null sound', async () => {
      const result = await pauseAudio(null);

      expect(result).toBe(false);
    });
  });

  describe('stopAudio', () => {
    it('should stop audio successfully', async () => {
      mockSound.stopAsync.mockResolvedValue({ isPlaying: false, positionMillis: 0 } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await stopAudio(mockSound);

      expect(result).toBe(true);
      expect(mockSound.stopAsync).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockSound.stopAsync.mockRejectedValue(new Error('Stop error'));

      const result = await stopAudio(mockSound);

      expect(result).toBe(false);
    });

    it('should handle null sound', async () => {
      const result = await stopAudio(null);

      expect(result).toBe(false);
    });
  });

  describe('unloadAudio', () => {
    it('should unload audio successfully', async () => {
      mockSound.unloadAsync.mockResolvedValue(undefined);

      await unloadAudio(mockSound);

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockSound.unloadAsync.mockRejectedValue(new Error('Unload error'));

      await expect(unloadAudio(mockSound)).resolves.not.toThrow();
    });

    it('should handle null sound', async () => {
      await expect(unloadAudio(null)).resolves.not.toThrow();
    });
  });

  describe('getAudioStatus', () => {
    it('should return audio status', async () => {
      const mockStatus = {
        isLoaded: true,
        isPlaying: true,
        positionMillis: 5000,
        durationMillis: 60000,
      };

      mockSound.getStatusAsync.mockResolvedValue(mockStatus as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const status = await getAudioStatus(mockSound);

      expect(status).toEqual(mockStatus);
      expect(mockSound.getStatusAsync).toHaveBeenCalled();
    });

    it('should return null on error', async () => {
      mockSound.getStatusAsync.mockRejectedValue(new Error('Status error'));

      const status = await getAudioStatus(mockSound);

      expect(status).toBeNull();
    });

    it('should handle null sound', async () => {
      const status = await getAudioStatus(null);

      expect(status).toBeNull();
    });
  });

  describe('seekAudio', () => {
    it('should seek to position successfully', async () => {
      mockSound.setPositionAsync.mockResolvedValue({ positionMillis: 10000 } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await seekAudio(mockSound, 10000);

      expect(result).toBe(true);
      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(10000);
    });

    it('should return false on error', async () => {
      mockSound.setPositionAsync.mockRejectedValue(new Error('Seek error'));

      const result = await seekAudio(mockSound, 10000);

      expect(result).toBe(false);
    });

    it('should handle null sound', async () => {
      const result = await seekAudio(null, 10000);

      expect(result).toBe(false);
    });
  });
});
