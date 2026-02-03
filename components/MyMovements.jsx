import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const MyMovements= ({ goBack }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [movementHistory, setMovementHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { user } = useUser();



  const fetchMovements = async () => {
    try {
      const userId = user.id;
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/employee/my-movements/employeeId/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey,
          },
        }
      );
    //   setMovements(response.data);
    setMovements(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovementHistory = async (mId) => {
    try {
      setHistoryLoading(true);
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/employee/getMovementHistories/movementId/${mId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey,
          },
        }
      );
      setMovementHistory(response.data);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error('Error fetching movement history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const renderMovementCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.movementType}>
          {item['Movement Reason ']?.trim()}
        </Text>
        <View
          style={[
            styles.statusBadge,
            item.Status === 'Initiated' ? styles.initiated : styles.otherStatus,
          ]}
        >
          <Text style={styles.statusText}>{item.Status}</Text>
        </View>
      </View>
  
  
      <View style={styles.cardContent}>
        <View style={styles.dateRow}>
          <Text style={[styles.cardText, styles.label]}>From: </Text>
          <Text style={styles.cardText}>{item.fromTime}</Text>
          <Text style={[styles.cardText, styles.label]}>To: </Text>
          <Text style={styles.cardText}>{item.toTime}</Text>
        </View>
        <Text style={[styles.cardText, styles.label]}>
          Requested On: <Text style={styles.cardText}>{item['Movement Requested Date']}</Text>
        </Text>
        <Text style={[styles.cardText, styles.label]}>
          Reason: <Text style={styles.cardText}>{item['Movement Reason ']?.trim()}</Text>
        </Text>
      </View>
  
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => fetchMovementHistory(item.mId)}
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
        <Text style={styles.headerTitle}>My <Text style={{ color: "#5aaf57" }}>Movements</Text></Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={movements}
          keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
          renderItem={renderMovementCard}
          ListEmptyComponent={<Text>No movements found.</Text>}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        />
      )}

      {/* Movement History Modal */}
      <Modal
  visible={historyModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setHistoryModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.updatedModalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Movement History</Text>
        <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {historyLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {movementHistory.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No history found.</Text>
          ) : (
            <View style={styles.timelineContainer}>
              {movementHistory.map((historyItem, index) => (
                <View key={index} style={styles.timelineItem}>
                  {/* Vertical Line */}
                  {index !== 0 && <View style={styles.timelineLine} />}
                  
                  {/* Card */}
                  <View style={styles.historyCard}>
                    <Text style={styles.historyLabel}>Updated On: <Text style={styles.historyValue}>{historyItem['Updated On ']}</Text></Text>
                    <Text style={styles.historyLabel}>Movement Status: <Text style={styles.historyValue}>{historyItem['Movement Status ']}</Text></Text>
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

export default MyMovements;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp('2.5%'),
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
    marginTop: hp('1.2%'),
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
  movementType: {
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
