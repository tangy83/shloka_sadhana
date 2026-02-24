/**
 * ShlokaDetailScreen
 * Shloka Sadhana - Shloka Detail View
 *
 * Screen for viewing full shloka content with Sanskrit, transliteration, and meanings
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/primitives/AppText';
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
import { getShlokaById } from '@/data/shlokas';
import { isFavorite, addFavorite, removeFavorite } from '@/utils/favorites';
import { RootStackParamList } from '@/types';

type ShlokaDetailRouteProp = RouteProp<RootStackParamList, 'ShlokaDetail'>;

/**
 * Shloka detail screen for viewing complete shloka content
 */
export const ShlokaDetailScreen: React.FC = () => {
  const route = useRoute<ShlokaDetailRouteProp>();
  const { theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { shlokaId } = route.params;
  const shloka = getShlokaById(shlokaId);
  const [isFavorited, setIsFavorited] = useState(false);

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
        if (__DEV__) console.error('Failed to open YouTube URL:', error);
      }
    }
  };

  /**
   * Handle start practice press
   */
  const handleStartPractice = () => {
    if (!shloka) return;

    // Navigate to MainTabs, then to Practice screen within it
    navigation.navigate('MainTabs', {
      screen: 'Practice',
      params: {
        shlokaId: shloka.id,
        shlokaName: shloka.name,
      },
    } as never);
  };

  // Handle case where shloka is not found
  if (!shloka) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textBright }]}>Shloka not found</Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            The requested shloka could not be found. Please try another one.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        testID="shloka-detail-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.textBright }]}>{shloka.name}</Text>
              <Text style={[styles.deity, { color: theme.primary }]}>{shloka.deity}</Text>
            </View>
            <TouchableOpacity
              testID="favorite-button"
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              accessibilityRole="button"
              accessibilityLabel={`Toggle favorite for ${shloka.name}`}
            >
              <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={24} color={isFavorited ? '#E91E8C' : theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>About</Text>
          <Text style={[styles.description, { color: theme.textMeaning }]}>{shloka.description}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Benefits</Text>
          <Text style={[styles.benefits, { color: theme.textMeaning }]}>{shloka.benefits}</Text>
        </View>

        {/* Practice Info Section */}
        <View style={styles.infoSection}>
          <View style={[styles.infoItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Duration</Text>
            <View style={styles.durationRow}>
              <MaterialCommunityIcons name="timer-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.infoValue, { color: theme.textBright }]}>{shloka.duration}</Text>
            </View>
          </View>
          <View style={[styles.infoItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Best Time</Text>
            <Text style={[styles.infoValue, { color: theme.textBright }]}>🌅 {shloka.bestTime}</Text>
          </View>
        </View>


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
            <Text style={[styles.youtubeButtonText, { color: Colors.textOnColor }]}>Watch on YouTube</Text>
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
          <Text style={[styles.startPracticeButtonText, { color: theme.textBright }]}>Start Practice</Text>
        </TouchableOpacity>

        {/* Shloka Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Shloka</Text>
          {shloka.sections.map((section, index) => (
            <View key={section.id} style={[styles.shlokaSection, { backgroundColor: theme.surface }]}>
              {/* Section Number */}
              <Text style={[styles.sectionNumber, { color: theme.primary }]}>Verse {index + 1}</Text>

              {/* Sanskrit Text */}
              <AppText style={[styles.sanskrit, { color: theme.textBright }]}>{section.sanskrit}</AppText>

              {/* Transliteration */}
              <AppText style={[styles.transliteration, { color: theme.textSecondary }]}>{section.transliteration}</AppText>

              {/* Meaning */}
              <View style={styles.meaningContainer}>
                <Text style={[styles.meaningLabel, { color: theme.primary }]}>Meaning:</Text>
                <AppText style={[styles.meaning, { color: theme.textMeaning }]}>{section.meaning}</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  benefits: {
    color: Colors.textMeaning,
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
    color: Colors.textMeaning,
    fontSize: 16,
    lineHeight: 24,
  },
  durationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
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
    color: Colors.textBright,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // subtle white highlight on dark header
    borderRadius: 24,
    padding: 8,
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
    color: Colors.textBright,
    fontSize: 14,
    fontWeight: '500',
  },
  meaning: {
    color: Colors.textMeaning,
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
    color: Colors.textBright,
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
    color: Colors.textBright,
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
    color: Colors.textBright,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: Colors.textBright,
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
  // eslint-disable-next-line react-native/no-color-literals
  youtubeButton: {
    alignItems: 'center',
    backgroundColor: '#FF0000', // YouTube brand red
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
  },
  youtubeButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
});
