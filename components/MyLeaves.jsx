import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const MyLeaves = ({ goBack }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { user } = useUser();

  const fetchLeaves = async () => {
    try {
      const userId = user.id;
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/employee/my-leave/employeeId/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey,
          },
        }
      );
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveHistory = async (leaveId) => {
    try {
      setHistoryLoading(true);
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/employee/getMyLeaveHistories/id/${leaveId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey,
          },
        }
      );
      setLeaveHistory(response.data);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const renderLeaveCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.leaveType}>{item['Leave Type']}</Text>
        <View style={[styles.statusBadge, item.Status === 'Initiated' ? styles.initiated : styles.otherStatus]}>
          <Text style={styles.statusText}>{item.Status}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.dateRow}>
          <Text style={[styles.cardText, styles.label]}>From: </Text>
          <Text style={styles.cardText}>{item.From}</Text>
          <Text style={[styles.cardText, styles.label]}>To: </Text>
          <Text style={styles.cardText}>{item.To}</Text>
        </View>
        <Text style={[styles.cardText, styles.label]}>
          Requested On: <Text style={styles.cardText}>{item['Leave Requested Date']}</Text>
        </Text>
        <Text style={[styles.cardText, styles.label]}>
          Reason: <Text style={styles.cardText}>{item.Reason?.trim()}</Text>
        </Text>
      </View>

      {/* Leave History Button */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => fetchLeaveHistory(item.id)}
      >
        <Text style={styles.historyButtonText}>History</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My <Text style={{ color: "#5aaf57" }}>Leaves</Text></Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaveCard}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        />
      )}

      {/* Leave History Modal */}
      <Modal
  visible={historyModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setHistoryModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.updatedModalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Leave History</Text>
        <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {historyLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {leaveHistory.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No history found.</Text>
          ) : (
            <View style={styles.timelineContainer}>
              {leaveHistory.map((historyItem, index) => (
                <View key={index} style={styles.timelineItem}>
                  {/* Vertical Line */}
                  {index !== 0 && <View style={styles.timelineLine} />}
                  
                  {/* Card */}
                  <View style={styles.historyCard}>
                    <Text style={styles.historyLabel}>Updated On: <Text style={styles.historyValue}>{historyItem['Updated On ']}</Text></Text>
                    <Text style={styles.historyLabel}>Leave Status: <Text style={styles.historyValue}>{historyItem['Leave Status ']}</Text></Text>
                    <Text style={styles.historyLabel}>Updated By: <Text style={styles.historyValue}>{historyItem['Updated By ']}</Text></Text>
                    <Text style={styles.historyLabel}>Remarks: <Text style={styles.historyValue}>{historyItem['Remarks ']}</Text></Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
};

export default MyLeaves;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: wp('5.5%'),
    paddingTop: hp('1.2%'),
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: hp('1%'),
  },
  headerTitle: {
    fontSize: wp('8%'),
    fontFamily: "PlusR",
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginVertical: hp('2%'),
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 5,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: hp('0.37%') },
    shadowOpacity: 0.2,
    shadowRadius: wp('1%'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  leaveType: {
    fontSize: wp('5.2%'),
    color: '#000',
    fontFamily: "PlusR",
  },
  statusBadge: {
    borderRadius: wp('3%'),
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2.5%'),
    marginLeft: wp('2.5%'),
  },
  initiated: {
    backgroundColor: '#ffcc00',
  },
  otherStatus: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontFamily: "PlusSB",
  },
  cardContent: {
    marginTop: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  cardText: {
    fontSize: wp('3.5%'),
    color: '#111',
    marginVertical: hp('0.7%'),
    fontFamily: "PlusR",
  },
  label: {
    fontWeight: 'bold',
    color: '#5aaf57',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyButton: {
    flex: 1,
    position: 'absolute',
    bottom: hp('2.5%'),
    right: wp('4%'),
    borderColor: '#007bff',
    borderWidth: 1,
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
  },
  historyButtonText: {
    color: '#007bff',
    fontSize: wp('3.5%'),
    fontFamily: "PlusSB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    padding: wp('5%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    fontFamily: "PlusSB",
  },
  historyItem: {
    marginBottom: hp('2%'),
  },
  historyLabel: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#5aaf57',
    fontFamily: "PlusSB",
  },
  historyValue: {
    fontSize: wp('3.5%'),
    color: '#111',
    fontFamily: "PlusR",
  },
  historyDivider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: hp('1.2%'),
  },
  historyCard: {
    width: '90%',
    backgroundColor: '#f7f7f7',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 3,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('1%'),
  },
  updatedModalContent: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: wp('4%'),
    padding: wp('5%'),
  },
  timelineContainer: {
    marginTop: hp('1.2%'),
    paddingVertical: hp('1.2%'),
  },
  
  timelineItem: {
    alignItems: 'center',
    marginBottom: hp('3.7%'),
    position: 'relative',
  },
  
  timelineLine: {
    position: 'absolute',
    top: -hp('3.7%'),
    height: hp('3.7%'),
    width: 2,
    backgroundColor: '#5aaf57',
    zIndex: -1,
  },
});
