/**
 * LibraryScreen
 * Shloka Sadhana - Browse Shlokas
 *
 * Screen for browsing all available shlokas
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllShlokas } from '@/data/shlokas';
import { Shloka, RootStackParamList } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Library screen for browsing shlokas
 */
export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const shlokas = getAllShlokas();

  /**
   * Handle shloka card press - navigate to detail screen
   */
  const handleShlokaPress = (shlokaId: string) => {
    navigation.navigate('ShlokaDetail', { shlokaId });
  };

  /**
   * Render individual shloka card
   */
  const renderShlokaCard = ({ item }: { item: Shloka }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleShlokaPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name}`}
    >
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.deity}>{item.deity}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.duration}>⏱️ {item.duration}</Text>
          <Text style={styles.bestTime}>🌅 {item.bestTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No shlokas available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{shlokas.length} Sacred Texts</Text>
      </View>

      {/* Shloka List */}
      <FlatList
        testID="shloka-list"
        data={shlokas}
        renderItem={renderShlokaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bestTime: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  deity: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    color: '#BDBDBD',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  duration: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
