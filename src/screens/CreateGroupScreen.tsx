/**
 * Create Group Screen
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Form to create a new group
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useGroupStore } from '@/stores/useGroupStore';
import { GroupPrivacy } from '@/types/groups';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;

export const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('public');
  const [creating, setCreating] = useState(false);

  const { createGroup } = useGroupStore();

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a group name');
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Group name must be at least 3 characters');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a group description');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Invalid Description', 'Description must be at least 10 characters');
      return;
    }

    setCreating(true);

    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy,
      });

      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.replace('GroupDetail', { groupId: group.id });
          },
        },
      ]);
    } catch (error) {
      console.error('[CreateGroupScreen] Error creating group:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create group');
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Group</Text>
        <Text style={styles.subtitle}>
          Practice together with friends and track your collective progress
        </Text>

        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Morning Sadhana Circle"
            placeholderTextColor={Colors.dark.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoCapitalize="words"
            accessible={true}
            accessibilityLabel="Group name input"
          />
          <Text style={styles.helperText}>{name.length}/50 characters</Text>
        </View>

        {/* Group Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your group's purpose and who should join..."
            placeholderTextColor={Colors.dark.textSecondary}
            value={description}
            onChangeText={setDescription}
            maxLength={300}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessible={true}
            accessibilityLabel="Group description input"
          />
          <Text style={styles.helperText}>{description.length}/300 characters</Text>
        </View>

        {/* Privacy Setting */}
        <View style={styles.section}>
          <Text style={styles.label}>Privacy</Text>

          <TouchableOpacity
            style={[styles.option, privacy === 'public' && styles.selectedOption]}
            onPress={() => setPrivacy('public')}
            accessible={true}
            accessibilityLabel="Public group option"
            accessibilityRole="radio"
            accessibilityState={{ checked: privacy === 'public' }}
          >
            <View style={styles.radio}>
              {privacy === 'public' && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>🌐 Public</Text>
              <Text style={styles.optionDescription}>
                Anyone can discover and join this group
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, privacy === 'private' && styles.selectedOption]}
            onPress={() => setPrivacy('private')}
            accessible={true}
            accessibilityLabel="Private group option"
            accessibilityRole="radio"
            accessibilityState={{ checked: privacy === 'private' }}
          >
            <View style={styles.radio}>
              {privacy === 'private' && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>🔒 Private</Text>
              <Text style={styles.optionDescription}>
                Only invited members can join this group
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
          accessible={true}
          accessibilityLabel="Create group button"
          accessibilityRole="button"
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Group'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={creating}
          accessible={true}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.typography.h1,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: Layout.spacing.xl,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textArea: {
    height: 100,
    paddingTop: Layout.spacing.md,
  },
  helperText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Layout.spacing.xs,
    textAlign: 'right',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
    marginTop: 2,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});
