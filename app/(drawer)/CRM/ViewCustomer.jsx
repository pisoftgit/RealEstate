import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image, Dimensions, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const ViewCustomer = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams(); // Get customer ID from params
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDocModalVisible, setDocModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Fetch customer data from API
  const fetchCustomerData = async (customerId) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/realestateCustomer/realEstateCustomerObj/${customerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'secret_key': secretKey,
          },
        }
      );
      setCustomerData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      Alert.alert('Error', 'Failed to fetch customer data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      try {
        const parsedId = JSON.parse(id);
        setCustomerId(parsedId);
        fetchCustomerData(parsedId);
      } catch (error) {
        console.error('Error parsing customer ID:', error);
        Alert.alert('Error', 'Invalid customer ID.');
        navigation.goBack();
      }
    } else {
      Alert.alert('Error', 'Customer ID is missing.');
      navigation.goBack();
    }
  }, [id]);

  // Open document in modal for in-app viewing (images only)
  const openDocumentInModal = (base64Data, documentType) => {
    if (documentType === 'image/jpeg' || documentType === 'image/jpg' || documentType === 'image/png') {
      setSelectedDocument(base64Data);
      setSelectedDocumentType(documentType);
      setDocModalVisible(true);
    } else {
      Alert.alert(
        'Info',
        'This document type cannot be viewed in-app. Please use the Share option to view it.'
      );
    }
  };

  // Share document (open in device's default viewer)
  const shareDocument = async (base64Data, fileName, documentType) => {
    try {
      let extension = 'dat';
      if (documentType === 'application/pdf') {
        extension = 'pdf';
      } else if (documentType === 'image/jpeg' || documentType === 'image/jpg') {
        extension = 'jpg';
      } else if (documentType === 'image/png') {
        extension = 'png';
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName || 'document'}.${extension}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert('Error', 'Failed to open document. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!customerData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No customer data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Icon */}
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#5aaf57" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>
          Customer <Text style={{ color: '#5aaf57' }}>Details</Text>
        </Text>

        {/* Customer Info Card (ID Card Style) */}
        <TouchableOpacity
          style={styles.idCard}
          onPress={() => setBottomSheetVisible(true)}
        >
          <View style={styles.idCardHeader}>
            <Image
              source={
                customerData.dp
                  ? { uri: `data:image/jpeg;base64,${customerData.dp}` }
                  : require('../../../assets/images/onboard.jpg')
              }
              style={styles.profilePic}
            />
            <Text style={styles.cardTitle}>{customerData.name}</Text>
          </View>
          <View style={styles.idCardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{customerData.contact || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email ID:</Text>
              <Text style={styles.infoValue}>{customerData.email_Id || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address :</Text>
              <Text style={styles.infoValue}> {customerData.addressDetails.address1 || ''} {customerData.addressDetails.address2 || ''},{' '}
                  {customerData.addressDetails.city || ''}, {customerData.addressDetails.district?.district || ''},{' '}
                  {customerData.addressDetails.pincode || 'N/A'}</Text>
            </View>
          </View>
          <Text style={styles.tapPrompt}>Tap to view full details</Text>
        </TouchableOpacity>

        {/* Uploaded Documents Section */}
        <Text style={styles.sectionTitle}>Uploaded Documents</Text>
        {customerData.docList && customerData.docList.length > 0 ? (
          customerData.docList.map((doc, index) => (
            <View style={styles.documentItem} key={doc.id}>
              <TouchableOpacity
                style={styles.documentContent}
                onPress={() => openDocumentInModal(doc.document, doc.documentType)}
              >
                <Ionicons name="document-outline" size={34} color="#5aaf57" style={styles.documentIcon} />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {doc.realEstateCustomerDocumentName?.documentName || `Document ${index + 1}`}
                  </Text>
                  <Text style={styles.documentDescription}>
                    {doc.realEstateCustomerDocumentName?.description || 'No description available'}
                  </Text>
                  <Text style={styles.documentNo}>No: {doc.documentNo || 'N/A'}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.documentActions}>
                <TouchableOpacity
                  onPress={() =>
                    shareDocument(
                      doc.document,
                      doc.realEstateCustomerDocumentName?.documentName || `document-${index}`,
                      doc.documentType
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons name="share-outline" size={20} color="#5aaf57" />
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDocumentsText}>No documents uploaded.</Text>
        )}
      </ScrollView>

      {/* Modal for In-App Document Viewing (Images Only) */}
      <Modal
        visible={isDocModalVisible}
        onRequestClose={() => setDocModalVisible(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Preview</Text>
              <TouchableOpacity onPress={() => setDocModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            {selectedDocument && selectedDocumentType ? (
              selectedDocumentType === 'image/jpeg' || selectedDocumentType === 'image/jpg' || selectedDocumentType === 'image/png' ? (
                <Image
                  source={{ uri: `data:${selectedDocumentType};base64,${selectedDocument}` }}
                  style={styles.imageViewer}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.unsupportedText}>
                  This document type is not supported for in-app viewing.
                </Text>
              )
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet Modal for Full Customer Details */}
      <Modal
        visible={isBottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{customerData.name}</Text>
              <TouchableOpacity onPress={() => setBottomSheetVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bottomSheetScroll}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact:</Text>
                <Text style={styles.infoValue}>{customerData.contact || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Official Contact:</Text>
                <Text style={styles.infoValue}>{customerData.officialContact || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Official Email:</Text>
                <Text style={styles.infoValue}>{customerData.officialEmail || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PAN No:</Text>
                <Text style={styles.infoValue}>{customerData.panNo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aadhaar No:</Text>
                <Text style={styles.infoValue}>{customerData.aaddharNo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Marital Status:</Text>
                <Text style={styles.infoValue}>{customerData.maritalStatus || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Father's Name:</Text>
                <Text style={styles.infoValue}>{customerData.father_Name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mother's Name:</Text>
                <Text style={styles.infoValue}>{customerData.mother_Name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email ID:</Text>
                <Text style={styles.infoValue}>{customerData.email_Id || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>{customerData.dateOfBirth || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{customerData.age || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {customerData.addressDetails.address1 || ''} {customerData.addressDetails.address2 || ''},{' '}
                  {customerData.addressDetails.city || ''}, {customerData.addressDetails.district?.district || ''},{' '}
                  {customerData.addressDetails.pincode || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CRC Address:</Text>
                <Text style={styles.infoValue}>
                  {customerData.crcAddressDetails.address1 || ''} {customerData.crcAddressDetails.address2 || ''},{' '}
                  {customerData.crcAddressDetails.city || ''}, {customerData.crcAddressDetails.district?.district || ''},{' '}
                  {customerData.crcAddressDetails.pincode || 'N/A'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('5%'),
  },
  backIcon: {
    marginBottom: hp('2.5%'),
  },
  title: {
    fontSize: wp('8%'),
    fontFamily: 'PlusR',
    marginBottom: hp('1.2%'),
    color: '#333',
  },
  idCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginBottom: hp('2.5%'),
    elevation: 6,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  idCardHeader: {
    alignItems: 'center',
    paddingTop: hp('1.8%'),
    paddingBottom: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: wp('5.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    textAlign: 'center',
    marginTop: hp('1.2%'),
  },
  idCardContent: {
    padding: wp('4%'),
  },
  profilePic: {
    width: wp('24%'),
    height: wp('24%'),
    borderRadius: wp('12%'),
    borderColor: '#5aaf57',
  },
  tapPrompt: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
    textAlign: 'center',
    paddingBottom: hp('1.2%'),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: hp('1.8%'),
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
    width: wp('35%'),
  },
  infoValue: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#333',
    flex: 1,
    lineHeight: wp('5.5%'),
  },
  sectionTitle: {
    fontSize: wp('5.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: hp('1.8%'),
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
    padding: wp('4%'),
    elevation: 4,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    marginRight: wp('4%'),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: hp('0.3%'),
  },
  documentDescription: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
    marginBottom: hp('0.3%'),
  },
  documentNo: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp('4%'),
  },
  actionText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#5aaf57',
    marginLeft: wp('1.2%'),
  },
  noDocumentsText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    textAlign: 'center',
    marginTop: hp('2.5%'),
  },
  errorText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusR',
    color: 'red',
    textAlign: 'center',
    marginTop: hp('2.5%'),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: wp('3%'),
    height: height * 0.8,
    width: width * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#fff',
  },
  imageViewer: {
    flex: 1,
    width: '100%',
  },
  unsupportedText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#fff',
    textAlign: 'center',
    margin: wp('5%'),
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    height: height * 0.7,
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    paddingTop: hp('1.2%'),
  },
  bottomSheetHandle: {
    width: wp('10%'),
    height: hp('0.6%'),
    backgroundColor: '#ccc',
    borderRadius: wp('1.2%'),
    alignSelf: 'center',
    marginBottom: hp('1.2%'),
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetTitle: {
    fontSize: wp('5%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  bottomSheetScroll: {
    padding: wp('5%'),
  },
});