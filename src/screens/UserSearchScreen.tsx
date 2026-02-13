/**
 * User Search Screen
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * Search for users by display name and send friend requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSocialStore } from '@/stores/useSocialStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { analyticsService } from '@/services/analytics';
import type { RootStackParamList } from '@/types/navigation';
import type { FriendSearchResult } from '@/types/social';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * UserSearchScreen Component
 */
export const UserSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    searchResults,
    searchLoading,
    searchUsers,
    clearSearch,
    sendFriendRequest,
  } = useSocialStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchUsers(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery]);

  // Track screen view
  useEffect(() => {
    analyticsService.trackEvent('user_search_opened');
  }, []);

  // Handle sending friend request
  const handleSendRequest = async (userId: string, displayName: string) => {
    try {
      await sendFriendRequest(userId);
      alert(`Friend request sent to ${displayName}!`);

      analyticsService.trackEvent('friend_request_sent', {
        to_user_id: userId,
      });
    } catch (error: any) {
      console.error('[UserSearchScreen] Error sending request:', error);
      if (error.message?.includes('already sent')) {
        alert('You have already sent a friend request to this user.');
      } else if (error.message?.includes('Already friends')) {
        alert('You are already friends with this user.');
      } else {
        alert('Failed to send friend request. Please try again.');
      }
    }
  };

  // Navigate to user profile
  const handleViewProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
    analyticsService.trackEvent('user_profile_viewed_from_search', {
      user_id: userId,
    });
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: FriendSearchResult }) => {
    const { profile, friendshipStatus, requestId } = item;

    // Determine button state
    let buttonText = 'Add Friend';
    let buttonDisabled = false;
    let buttonStyle = styles.addButton;

    if (friendshipStatus === 'friends') {
      buttonText = 'Friends';
      buttonDisabled = true;
      buttonStyle = styles.friendsButton;
    } else if (friendshipStatus === 'request_sent') {
      buttonText = 'Request Sent';
      buttonDisabled = true;
      buttonStyle = styles.requestSentButton;
    } else if (friendshipStatus === 'request_received') {
      buttonText = 'Accept';
      buttonStyle = styles.acceptButton;
    }

    return (
      <View style={styles.resultItem}>
        <TouchableOpacity
          style={styles.resultMain}
          onPress={() => handleViewProfile(profile.id)}
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.displayName}'s profile`}
        >
          <View style={styles.resultAvatar}>
            <Text style={styles.resultAvatarText}>
              {profile.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{profile.displayName}</Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultStatText}>
                🔥 {profile.currentStreak} day streak
              </Text>
              <Text style={styles.resultStatDivider}>•</Text>
              <Text style={styles.resultStatText}>
                🎯 {profile.totalPractices} practices
              </Text>
            </View>
            {profile.favoriteDeity && (
              <Text style={styles.resultDeity}>🙏 {profile.favoriteDeity}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, buttonStyle]}
          onPress={() => handleSendRequest(profile.id, profile.displayName)}
          disabled={buttonDisabled}
          accessibilityRole="button"
          accessibilityLabel={buttonText}
        >
          <Text
            style={[
              styles.actionButtonText,
              buttonDisabled && styles.actionButtonTextDisabled,
            ]}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Empty state
  const renderEmpty = () => {
    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search for friends</Text>
          <Text style={styles.emptyDescription}>
            Enter a name to find friends who practice on Shloka Sadhana
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✏️</Text>
          <Text style={styles.emptyTitle}>Keep typing...</Text>
          <Text style={styles.emptyDescription}>
            Enter at least 2 characters to search
          </Text>
        </View>
      );
    }

    if (searchLoading) {
      return null; // Loading indicator shown separately
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😔</Text>
        <Text style={styles.emptyTitle}>No users found</Text>
        <Text style={styles.emptyDescription}>
          No users found matching "{searchQuery}"
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Find Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          accessibilityLabel="Search for users"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {searchLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.profile.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  actionButton: {
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: Colors.text.secondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  backIcon: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '300',
  },
  clearButton: {
    padding: Layout.spacing.sm,
  },
  clearIcon: {
    color: Colors.text.secondary,
    fontSize: 18,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxxl,
  },
  emptyDescription: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  friendsButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.xxl,
    paddingVertical: Layout.spacing.sm,
  },
  headerSpacer: {
    width: 44, // Same width as back button for centering
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxxl,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 15,
    marginTop: Layout.spacing.md,
  },
  requestSentButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  resultAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  resultAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  resultDeity: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: Layout.spacing.xs,
  },
  resultInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  resultItem: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  resultMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  resultName: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  resultStatDivider: {
    color: Colors.text.secondary,
    marginHorizontal: Layout.spacing.sm,
  },
  resultStatText: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  resultStats: {
    flexDirection: 'row',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    color: Colors.text.primary,
    flex: 1,
    fontSize: 17,
    paddingVertical: Layout.spacing.sm,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
});
