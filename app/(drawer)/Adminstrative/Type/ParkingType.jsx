import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Pressable,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import useParkingTypes from "../../../../hooks/useParking"

export default function ParkingType() {
  const navigation = useNavigation()
  const {
    parkingTypes,
    loading,
    error,
    fetchParkingTypes,
    saveParkingType,
    updateParkingType,
    deleteParkingType,
  } = useParkingTypes()

  const [parkingTypeInput, setParkingTypeInput] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchParkingTypes()
  }, [])

  const handleSubmit = async () => {
    if (!parkingTypeInput.trim()) return

    try {
      await saveParkingType(parkingTypeInput.trim())
      setParkingTypeInput('')
      await fetchParkingTypes()
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong')
    }
  }

  const openEditModal = (item) => {
    setEditId(item.id)
    setParkingTypeInput(item.type)
    setModalVisible(true)
  }

  const handleUpdate = async () => {
    if (!parkingTypeInput.trim()) return

    try {
      await updateParkingType(editId, parkingTypeInput.trim())
      setModalVisible(false)
      setEditId(null)
      setParkingTypeInput('')
      await fetchParkingTypes()
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update parking type')
    }
  }

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this parking type?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParkingType(id)
            await fetchParkingTypes()
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete parking type')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Parking <Text style={{ color: '#5aaf57' }}>Type</Text>
          </Text>
        </View>

        {/* Add Parking Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Parking Type</Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Parking Type</Text>
            <TextInput
              style={styles.input}
              value={parkingTypeInput}
              onChangeText={setParkingTypeInput}
              placeholder="Enter Parking Type"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Parking Types List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parking Type List</Text>
          {loading && <Text>Loading...</Text>}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Parking Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>

          {parkingTypes.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.type}</Text>
              <View style={[styles.actionCell, { flex: 1 }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
                  <Feather name="edit" size={18} color="#5aaf57" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Parking Type</Text>
              <TextInput
                style={styles.modalInput}
                value={parkingTypeInput}
                onChangeText={setParkingTypeInput}
                placeholder="Enter Parking Type"
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: '#d32f2f' }]}
                  onPress={() => {
                    setModalVisible(false)
                    setEditId(null)
                    setParkingTypeInput('')
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#5aaf57' }]} onPress={handleUpdate}>
                  <Text style={styles.modalButtonText}>Update</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: {
    paddingVertical: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 120,
    color: '#333',
    fontFamily: 'PlusR',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'PlusSB',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 13,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
   modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 16,
    marginBottom: 16,
  },
})
