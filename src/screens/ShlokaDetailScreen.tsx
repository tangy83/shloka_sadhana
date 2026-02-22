/**
 * ShlokaDetailScreen
 * Shloka Sadhana - Shloka Detail View
 *
 * Screen for viewing full shloka content with Sanskrit, transliteration, and meanings
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { getShlokaById } from '@/data/shlokas';
import { isFavorite, addFavorite, removeFavorite } from '@/utils/favorites';
import { loadAudio, playAudio, pauseAudio, unloadAudio } from '@/utils/audio';
import { RootStackParamList } from '@/types';

type ShlokaDetailRouteProp = RouteProp<RootStackParamList, 'ShlokaDetail'>;

/**
 * Shloka detail screen for viewing complete shloka content
 */
export const ShlokaDetailScreen: React.FC = () => {
  const route = useRoute<ShlokaDetailRouteProp>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { shlokaId } = route.params;
  const shloka = getShlokaById(shlokaId);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Load favorite status on mount
   */
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (shloka) {
        const favorited = await isFavorite(shloka.id);
        setIsFavorited(favorited);
      }
    };
    loadFavoriteStatus();
  }, [shloka]);

  /**
   * Cleanup audio on unmount
   */
  useEffect(() => {
    return () => {
      if (sound) {
        unloadAudio(sound);
      }
    };
  }, [sound]);

  /**
   * Handle favorite toggle
   */
  const handleFavoritePress = async () => {
    if (!shloka) return;

    if (isFavorited) {
      await removeFavorite(shloka.id);
      setIsFavorited(false);
    } else {
      await addFavorite(shloka.id);
      setIsFavorited(true);
    }
  };

  /**
   * Handle YouTube link press
   */
  const handleYouTubePress = async () => {
    if (shloka?.youtubeUrl) {
      try {
        await Linking.openURL(shloka.youtubeUrl);
      } catch (error) {
        console.error('Failed to open YouTube URL:', error);
      }
    }
  };

  /**
   * Handle audio play/pause
   */
  const handleAudioPress = async () => {
    if (!shloka?.audioUrl) return;

    try {
      if (isPlaying) {
        // Pause current audio
        await pauseAudio(sound);
        setIsPlaying(false);
      } else {
        // Load and play audio
        if (!sound) {
          const audioSound = await loadAudio(shloka.audioUrl);
          if (audioSound) {
            setSound(audioSound);
            await playAudio(audioSound);
            setIsPlaying(true);

            // Listen for playback status
            audioSound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
              }
            });
          }
        } else {
          await playAudio(sound);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Failed to handle audio:', error);
      setIsPlaying(false);
    }
  };

  /**
   * Handle start practice press
   */
  const handleStartPractice = () => {
    if (!shloka) return;

    navigation.navigate('Practice', {
      shlokaId: shloka.id,
      shlokaName: shloka.name,
    });
  };

  // Handle case where shloka is not found
  if (!shloka) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Shloka not found</Text>
          <Text style={styles.errorSubtext}>
            The requested shloka could not be found. Please try another one.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        testID="shloka-detail-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{shloka.name}</Text>
              <Text style={styles.deity}>{shloka.deity}</Text>
            </View>
            <TouchableOpacity
              testID="favorite-button"
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              accessibilityRole="button"
              accessibilityLabel={`Toggle favorite for ${shloka.name}`}
            >
              <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={24} color={isFavorited ? '#E91E8C' : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{shloka.description}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.benefits}>{shloka.benefits}</Text>
        </View>

        {/* Practice Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="timer-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoValue}>{shloka.duration}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Best Time</Text>
            <Text style={styles.infoValue}>🌅 {shloka.bestTime}</Text>
          </View>
        </View>

        {/* Audio Pronunciation Button */}
        {shloka.audioUrl && (
          <TouchableOpacity
            testID="audio-button"
            style={styles.audioButton}
            onPress={handleAudioPress}
            accessibilityRole="button"
            accessibilityLabel={`${isPlaying ? 'Pause' : 'Play'} ${shloka.name} pronunciation`}
          >
            <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle-outline'} size={24} color="#FFF8E7" />
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Pause Pronunciation' : 'Listen to Pronunciation'}
            </Text>
          </TouchableOpacity>
        )}

        {/* YouTube Link Button */}
        {shloka.youtubeUrl && (
          <TouchableOpacity
            testID="youtube-button"
            style={styles.youtubeButton}
            onPress={handleYouTubePress}
            accessibilityRole="button"
            accessibilityLabel={`Watch ${shloka.name} on YouTube`}
          >
            <Ionicons name="logo-youtube" size={22} color="#FFF8E7" />
            <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
          </TouchableOpacity>
        )}

        {/* Start Practice Button */}
        <TouchableOpacity
          testID="start-practice-button"
          style={styles.startPracticeButton}
          onPress={handleStartPractice}
          accessibilityRole="button"
          accessibilityLabel={`Start practice session with ${shloka.name}`}
        >
          <MaterialCommunityIcons name="meditation" size={22} color="#FFF8E7" />
          <Text style={styles.startPracticeButtonText}>Start Practice</Text>
        </TouchableOpacity>

        {/* Shloka Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shloka</Text>
          {shloka.sections.map((section, index) => (
            <View key={section.id} style={styles.shlokaSection}>
              {/* Section Number */}
              <Text style={styles.sectionNumber}>Verse {index + 1}</Text>

              {/* Sanskrit Text */}
              <Text style={styles.sanskrit}>{section.sanskrit}</Text>

              {/* Transliteration */}
              <Text style={styles.transliteration}>{section.transliteration}</Text>

              {/* Meaning */}
              <View style={styles.meaningContainer}>
                <Text style={styles.meaningLabel}>Meaning:</Text>
                <Text style={styles.meaning}>{section.meaning}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  audioButton: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  audioButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  audioIcon: {
    fontSize: 20,
  },
  benefits: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  deity: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorSubtext: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#FFF8E7',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  infoItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoValue: {
    color: '#FFF8E7',
    fontSize: 14,
    fontWeight: '500',
  },
  meaning: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  meaningContainer: {
    marginTop: 8,
  },
  meaningLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sanskrit: {
    color: '#FFF8E7',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 36,
    marginBottom: 12,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionNumber: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#FFF8E7',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  shlokaSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  startPracticeButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startPracticeButtonText: {
    color: '#FFF8E7',
    fontSize: 18,
    fontWeight: '700',
  },
  startPracticeIcon: {
    fontSize: 20,
  },
  title: {
    color: '#FFF8E7',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  transliteration: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  youtubeButton: {
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
  },
  youtubeButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  youtubeIcon: {
    fontSize: 20,
  },
});
