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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
    gap: wp('3%'),
  },
  iconBtn: {
    padding: wp('1%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('1.5%'),
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp('2.5%'),
    marginTop: hp('2%'),
  },
  modalButton: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
})
