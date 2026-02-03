import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useHr from '../../../../../hooks/useHr';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function LevelConf() {
  const navigation = useNavigation();
  const { getAllLevels, addLevel, updateLevel, deleteLevel, levels, loading, error, success } = useHr();

  const [maximumLevels, setMaximumLevels] = useState('');
  const [levelName, setLevelName] = useState('');
  const [editing, setEditing] = useState(null);

  // Fetch levels on component mount
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        await getAllLevels();
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      await getAllLevels();
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const handleSubmit = async () => {
    if (!maximumLevels.trim() || !levelName.trim()) {
      Alert.alert('Validation Error', 'Please enter both maximum levels and level name!');
      return;
    }

    try {
      const payload = {
        maximumLevels: parseInt(maximumLevels),
        levelName: levelName
      };

      if (editing) {
        // Update existing level
        await updateLevel(editing.id, payload);
        Alert.alert('Success', 'Level updated successfully!');
        setEditing(null);
      } else {
        // Add new level
        await addLevel(payload);
        Alert.alert('Success', 'Level added successfully!');
      }

      // Reset form and refresh level list
      setMaximumLevels('');
      setLevelName('');
      await fetchLevels();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save level');
    }
  };

  const handleEdit = (item) => {
    setMaximumLevels(item.maximumLevels.toString());
    setLevelName(item.levelName);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Level', 'Are you sure you want to delete this level?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLevel(id);
            Alert.alert('Success', 'Level deleted successfully!');
            await fetchLevels();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete level');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setMaximumLevels('');
    setLevelName('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Level Configuration</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Level Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Level' : 'Configure Level'}
            </Text>

            {/* Maximum Levels */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Maximum Levels <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={maximumLevels}
                onChangeText={setMaximumLevels}
                placeholder="Enter maximum levels"
                keyboardType="numeric"
              />
            </View>

            {/* Level Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Level Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={levelName}
                onChangeText={setLevelName}
                placeholder="Enter level name"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button (shown only when editing) */}
            {editing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Levels Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Levels</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Maximum Levels</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Level Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading levels...</Text>
              </View>
            ) : levels && levels.length > 0 ? (
              levels.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.maximumLevels}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.levelName}</Text>
                  <View style={[styles.actionCell, { flex: 1 }]}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                      <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No levels found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: wp('5%') },
  header: {
    paddingVertical: hp('2%'),
    marginBottom: hp('1%'),
  },
  title: {
    fontSize: hp('4%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: wp('4%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: hp('2.2%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  label: {
    width: wp('30%'),
    color: '#333',
    fontFamily: 'PlusR',
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: wp('2%'),
    borderRadius: 8,
    marginBottom: hp('0.5%'),
  },
  tableHeaderText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'PlusSB',
    fontSize: hp('1.7%'),
  },
  tableRow: {
    flexDirection: 'row',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tableCell: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: hp('1.6%'),
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('3%'),
  },
  iconBtn: {
    padding: wp('1%'),
  },
  emptyState: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('1%'),
    color: '#666',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
});
