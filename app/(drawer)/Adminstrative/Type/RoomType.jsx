import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useRoomTypes from '../../../../hooks/useRoom';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function RoomType() {
  const navigation = useNavigation();
  const {
    roomTypes,
    loading,
    error,
    saveRoomType,
    updateRoomType,
    deleteRoomType,
    fetchRoomTypes,
  } = useRoomTypes();

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomType, setRoomType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAdd = async () => {
    if (!roomType.trim()) {
      Alert.alert('Validation Error', 'Room Type is required');
      return;
    }

    try {
      await saveRoomType(roomType.trim());
      Alert.alert('Success', 'Room Type added successfully');
      setRoomType('');
    } catch (err) {
      console.error('Add error:', err.message);
      Alert.alert('Error', 'Failed to add room type');
    }
  };

  // const handleUpdate = async () => {
  //   if (!roomType.trim()) {
  //     Alert.alert('Validation Error', 'Room Type is required');
  //     return;
  //   }

  //   try {
  //     await updateRoomType(editingRoomId, roomType.trim());
  //     Alert.alert('Success', 'Room Type updated successfully');
  //     setRoomType('');
  //     setEditingRoomId(null);
  //     setIsModalVisible(false);
  //   } catch (err) {
  //     console.error('Update error:', err.message);
  //     Alert.alert('Error', 'Failed to update room type');
  //   }
  // };

  const handleUpdate = async () => {
    if (!roomType.trim()) {
      Alert.alert('Validation Error', 'Room Type is required');
      return;
    }

    try {
      if (editingRoomId) {
        await updateRoomType(editingRoomId, roomType.trim());
        Alert.alert('Success', 'Room Type updated successfully');
      } else {
        await saveRoomType(roomType.trim());
        Alert.alert('Success', 'Room Type saved successfully');
      }

      setRoomType('');
      setEditingRoomId(null);
      setIsModalVisible(false);
    } catch (err) {
      console.error('Submit error:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  const beginEdit = (item) => {
    setRoomType(item.type);
    setEditingRoomId(item.id);
    setIsModalVisible(true);
  };

  const cancelEdit = () => {
    setRoomType('');
    setEditingRoomId(null);
    setIsModalVisible(false);
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${item.type}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoomType(item.id);
              Alert.alert('Deleted', 'Room Type deleted successfully');
            } catch (err) {
              console.error('Delete error:', err.message);
              Alert.alert('Error', 'Failed to delete room type');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>
              Room <Text style={{ color: '#5aaf57' }}>Type</Text>
            </Text>
          </View>

          {loading && <ActivityIndicator size="small" color="#5aaf57" />}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}

          {/* Add New Room Type */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Room Type</Text>
            <View style={styles.formRow}>
              <Text style={styles.label}>Room Type</Text>
              <TextInput
                style={styles.input}
                value={roomType}
                onChangeText={setRoomType}
                placeholder="Enter Room Type"
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* Room Types List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Room Type List</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Room Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {roomTypes.map((item, idx) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.type}</Text>
                <View style={[styles.actionCell, { flex: 1 }]}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => beginEdit(item)}
                  >
                    <Feather name="edit" size={18} color="#5aaf57" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => confirmDelete(item)}
                  >
                    <Ionicons name="trash" size={18} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Update Modal */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={cancelEdit}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Update Room Type</Text>
                <TextInput
                  style={[styles.modalInput, { marginBottom: 16 }]}
                  value={roomType}
                  onChangeText={setRoomType}
                  placeholder="Enter Room Type"
                />
                <View style={styles.modalButtonsRow}>
                  <Pressable
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={cancelEdit}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalSubmitButton]}
                    onPress={handleUpdate}
                  >
                    <Text style={styles.modalButtonText}>Update</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: wp('5%') },
  header: {
    paddingVertical: hp('2.2%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: wp('8%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: wp('4%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
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
    fontSize: wp('3.5%'),
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('3.5%'),
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: wp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  tableHeaderText: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'PlusSB',
    fontSize: wp('3.2%'),
  },
  tableRow: {
    flexDirection: 'row',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('3%'),
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    padding: wp('2%'),
    marginHorizontal: wp('1%'),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    padding: wp('5%'),
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    marginBottom: hp('1.5%'),
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
  },
  modalSubmitButton: {
    backgroundColor: '#5aaf57',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('3.5%'),
    marginBottom: hp('2%'),
  },
});
