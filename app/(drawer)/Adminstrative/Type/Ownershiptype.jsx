import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import useOwnershipTypes from "../../../../hooks/useOwnership"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Ownershiptype() {
  const navigation = useNavigation()

  const {
    ownershipTypes,
    loading,
    error,
    fetchOwnershipTypes,
    saveOwnershipType,
    updateOwnershipType,
    deleteOwnershipType,
  } = useOwnershipTypes()

  // Inline input for adding new ownership type
  const [ownershipType, setOwnershipType] = useState('')

  // Modal for editing existing ownership type
  const [modalVisible, setModalVisible] = useState(false)
  const [editType, setEditType] = useState('')
  const [editId, setEditId] = useState(null)

  // Handle add new ownership type (inline)
  const handleAdd = async () => {
    if (!ownershipType.trim()) return

    try {
      await saveOwnershipType(ownershipType)
      Alert.alert('Success', 'Ownership type added successfully')
      setOwnershipType('')
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong')
    }
  }

  // Handle submit update from modal
  const handleUpdate = async () => {
    if (!editType.trim()) return

    try {
      await updateOwnershipType(editId, editType)
      Alert.alert('Success', 'Ownership type updated successfully')
      setEditType('')
      setEditId(null)
      setModalVisible(false)
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong')
    }
  }

  const openEditModal = (item) => {
    setEditType(item.type)
    setEditId(item.id)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this ownership type?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOwnershipType(id)
              Alert.alert('Deleted', 'Ownership type deleted')
            } catch {
              Alert.alert('Error', 'Failed to delete ownership type')
            }
          },
        },
      ]
    )
  }

  useEffect(() => {
    fetchOwnershipTypes()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Ownership <Text style={{ color: '#5aaf57' }}>Type</Text>
          </Text>
        </View>

        {/* Inline Add Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Ownership Type</Text>
          <TextInput
            style={styles.input}
            value={ownershipType}
            onChangeText={setOwnershipType}
            placeholder="Enter Ownership Type"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.cardTitle}>Edit Ownership Type</Text>
              <TextInput
                style={styles.modalInput}
                value={editType}
                onChangeText={setEditType}
                placeholder="Enter Ownership Type"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.submitButton, { flex: 1, marginRight: 8 }]}
                  onPress={handleUpdate}
                >
                  <Text style={styles.submitButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { flex: 1, backgroundColor: '#ccc' }]}
                  onPress={() => {
                    setModalVisible(false)
                    setEditId(null)
                    setEditType('')
                  }}
                >
                  <Text style={[styles.submitButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Ownership Types List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ownership Type List</Text>

          {loading && <Text>Loading...</Text>}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ownership Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>

          {ownershipTypes.length === 0 && !loading && <Text>No ownership types found.</Text>}

          {ownershipTypes.map((item, idx) => (
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('3.5%'),
    marginBottom: hp('1.5%'),
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    elevation: 10,
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
