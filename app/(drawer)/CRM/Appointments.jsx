import { StyleSheet, Text, View, SectionList, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment';
import { API_BASE_URL } from '../../../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Appointments = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRemarks, setNewRemarks] = useState({}); // Store remarks for each appointment

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/realestateCustomerLead/realestateCustomerLeadApointments/${user.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'secret_key': secretKey,
          },
        }
      );

      // Sort and group appointments by date
      const sortedAppointments = response.data.sort((a, b) =>
        moment(a.appointmentDate).diff(moment(b.appointmentDate))
      );

      const groupedByDate = sortedAppointments.reduce((acc, item) => {
        const date = moment(item.appointmentDate).format('YYYY-MM-DD');
        const existingSection = acc.find((section) => section.title === date);
        if (existingSection) {
          existingSection.data.push(item);
        } else {
          acc.push({
            title: date,
            data: [item],
          });
        }
        return acc;
      }, []);

      setSections(groupedByDate);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update remark
  const updateRemark = async (followUpId, remark) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      await axios.post(
        `${API_BASE_URL}/realestateCustomerLead/updateFollowUpRemarks`,
        {
          followUpId,
          remarks: remark,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'secret_key': secretKey,
          },
        }
      );
      Alert.alert('Success', 'Remark updated successfully!');
      await fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating remark:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update remark. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Render address
  const renderAddress = (item) => {
    const fields = [item.address1, item.address2, item.city, item.district, item.state, item.country];
    const validFields = fields.filter((field) => field && field !== 'null').join(', ');
    return validFields || 'Not provided';
  };

  // Render each appointment card
  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <Ionicons name="person" size={20} color="#5aaf57" style={styles.icon} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <View style={styles.headerRow2}>
          <Ionicons name="call" size={20} color="#5aaf57" style={styles.icon} />
          <Text style={styles.mobile}>{item.mobileNo}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        
        <Text style={styles.detail}>
          <Text style={styles.label}>Address: </Text>
          {renderAddress(item)}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Description: </Text>
          {item.description || 'None'}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Remark: </Text>
          {item.lastFollowUpRemarks ? (
            item.lastFollowUpRemarks
          ) : (
            <View style={styles.remarkInputContainer}>
              <TextInput
                style={styles.remarkInput}
                placeholder="Add remark"
                value={newRemarks[item.id] || ''}
                onChangeText={(text) =>
                  setNewRemarks((prev) => ({ ...prev, [item.id]: text }))
                }
                multiline
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  const remark = newRemarks[item.id]?.trim();
                  if (!remark) {
                    Alert.alert('Error', 'Please enter a remark.');
                    return;
                  }
                  updateRemark(item.id, remark);
                }}
              >
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </Text>
      </View>
    </View>
  );

  // Render section header
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {moment(title).format('ddd, MMM D, YYYY')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Drawer Button */}
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Text style={styles.header}>
        My <Text style={{ color: '#5aaf57' }}>Appointments</Text>
      </Text>

      {/* Appointment List */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : sections.length === 0 ? (
        <Text style={styles.emptyText}>No appointments found.</Text>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderAppointment}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp('5%'),
  },
  menuContainer: {
    marginBottom: hp('1.2%'),
  },
  header: {
    fontSize: wp('8%'),
    fontFamily: 'PlusR',
    marginVertical: hp('1.2%'),
  },
  loadingText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusR',
    textAlign: 'center',
    marginTop: hp('2.5%'),
  },
  emptyText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusR',
    textAlign: 'center',
    marginTop: hp('2.5%'),
    color: '#555',
  },
  listContainer: {
    paddingBottom: hp('2.5%'),
  },
  sectionHeader: {
    backgroundColor: '#f0f9f0',
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    marginVertical: hp('1%'),
    borderLeftWidth: 4,
    borderLeftColor: '#5aaf57',
  },
  sectionHeaderText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginVertical: hp('1%'),
    marginHorizontal: wp('1%'),
    padding: wp('4%'),
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: hp('1.2%'),
    marginBottom: hp('1.2%'),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('0.3%'),
  },
  headerRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('0.3%'),
  },
  icon: {
    marginRight: wp('2%'),
  },
  name: {
    fontSize: wp('5%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  mobile: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#555',
  },
  cardBody: {
    gap: hp('1%'),
  },
  detail: {
    fontSize: wp('3.8%'),
    fontFamily: 'PlusR',
    color: '#333',
  },
  label: {
    fontFamily: 'PlusSB',
    color: '#5aaf57',
  },
  remarkInputContainer: {
    marginTop: hp('1%'),
    gap: hp('1.2%'),
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: wp('2.5%'),
    fontSize: wp('3.8%'),
    fontFamily: 'PlusR',
    minHeight: hp('7%'),
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#5aaf57',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.2%'),
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#fff',
  },
});