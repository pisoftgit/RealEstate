import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useCRM from '../../../../hooks/useCRM';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function DocumentName() {
  const navigation = useNavigation();
  const {
    customerDocumentNames,
    isLoadingCustomerDocuments,
    customerDocumentsError,
    handleAddCustomerDocumentName,
    handleUpdateCustomerDocumentName,
    handleDeleteCustomerDocumentName,
  } = useCRM();

  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!documentName.trim()) {
      Alert.alert('Validation Error', 'Please enter document name!');
      return;
    }

    setIsSubmitting(true);
    try {
      const documentData = {
        documentName: documentName.trim(),
        description: description.trim() || null,
      };

      if (editing) {
        // Update existing document
        documentData.id = editing.id;
        await handleUpdateCustomerDocumentName(documentData, () => {
          setEditing(null);
          setDocumentName('');
          setDescription('');
        });
      } else {
        // Add new document
        await handleAddCustomerDocumentName(documentData, () => {
          setDocumentName('');
          setDescription('');
        });
      }
    } catch (error) {
      console.error('Error submitting document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setDocumentName(item.documentName);
    setDescription(item.description || '');
    setEditing(item);
  };

  const handleDelete = (id, documentName) => {
    handleDeleteCustomerDocumentName(id, documentName);
  };

  const handleCancel = () => {
    setEditing(null);
    setDocumentName('');
    setDescription('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Customer Document Name</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Customer Document Name Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Document' : 'Configure Customer Document Name'}
            </Text>

            {/* Document Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Document Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Enter document name"
              />
            </View>

            {/* Description */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || isLoadingCustomerDocuments) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting || isLoadingCustomerDocuments}
            >
              {isSubmitting ? (
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

          {/* Existing Documents Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Documents</Text>

            {isLoadingCustomerDocuments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading documents...</Text>
              </View>
            ) : customerDocumentsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{customerDocumentsError}</Text>
              </View>
            ) : (
              <>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Document Name</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Description</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {customerDocumentNames.length > 0 ? (
                  customerDocumentNames.map((item, idx) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 0.5 }]}>{idx + 1}</Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.documentName}</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>{item.description || 'N/A'}</Text>
                      <View style={[styles.actionCell, { flex: 1 }]}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                          <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.documentName)}>
                          <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No documents found</Text>
                  </View>
                )}
              </>
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
  textArea: {
    height: hp('10%'),
    textAlignVertical: 'top',
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
    marginTop: hp('1.2%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  errorContainer: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontFamily: 'PlusR',
    textAlign: 'center',
  },
});
