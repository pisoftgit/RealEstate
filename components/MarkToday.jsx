import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  TextInput,
  Keyboard,
  InteractionManager,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import useAttendanceNotations from '../hooks/useAttendanceNotations';
import useEmployeeList from '../hooks/useEmployeeList';
import useSaveAttendance from '../hooks/useSaveAttendence';
import { Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const MarkToday = ({ onBack }) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [search, setSearch] = useState('');
  const { employees, loading: empLoading } = useEmployeeList();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const { notations, loading } = useAttendanceNotations();
  const saveAttendance = useSaveAttendance();

  useEffect(() => {
    setFilteredEmployees(employees || []);
  }, [employees]);

  const handleSearch = (query) => {
    setSearch(query);
    if (!employees) {
      setFilteredEmployees([]);
      return;
    }

    if (query.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = employees.filter((emp) => {
        if (!emp || !emp.name) {
          return false;
        }
        return emp.name.toLowerCase().includes(lowerQuery);
      });
      setFilteredEmployees(filtered);
    }
  };

  useEffect(() => {
    if (!loading && employees?.length && notations?.length) {
      const mappedAttendance = {};
      employees.forEach((emp) => {
        if (!emp || !emp.attendance) {
          return;
        }
        const matchedNotation = notations.find(
          (note) => note?.color?.toLowerCase() === emp.attendance?.toLowerCase()
        );
        if (matchedNotation) {
          mappedAttendance[emp.id] = matchedNotation.description;
        }
      });
      setAttendanceData(mappedAttendance);
    }
  }, [employees, notations, loading]);

  const handleStatusSelect = (empId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [empId]: status,
    }));
  };

  const handleSubmit = async () => {
    try {
      const attendanceList = Object.entries(attendanceData)
        .map(([empId, statusDesc]) => {
          const matchedNotation = notations.find(
            (note) => note?.description?.toLowerCase() === statusDesc?.toLowerCase()
          );
          if (!matchedNotation) {
            console.warn(`No matching notation for status: ${statusDesc}`);
            return null;
          }
          return {
            employeeId: empId,
            colorCode: matchedNotation.color,
          };
        })
        .filter(Boolean);

      await saveAttendance(attendanceList);
      InteractionManager.runAfterInteractions(() => {
        Alert.alert('Success', 'Attendance saved successfully!');
      });
    } catch (error) {
      console.error('Failed to save all attendance:', error);
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    }
  };

  const renderLegend = () => (
    <View style={styles.legendRow}>
      {notations?.map((item) => (
        <View key={item?.id} style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: item?.color }]} />
          <Text style={styles.legendText}>{item?.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderEmployeeRow = ({ item }) => {
    const currentStatus = attendanceData[item?.id];
    return (
      <View style={styles.tableRow}>
        <View style={{ flex: 3 }}>
          <Text style={styles.nameText}>{item?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.statusGroup} pointerEvents="box-none">
          {notations?.map((statusItem) => (
            <TouchableOpacity
              key={statusItem?.description}
              style={[
                styles.statusCircle,
                {
                  backgroundColor: statusItem?.color,
                  opacity: currentStatus === statusItem?.description ? 1 : 0.4,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handleStatusSelect(item?.id, statusItem?.description)}
            >
              {currentStatus === statusItem?.description && (
                <Ionicons name="checkmark" size={26} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons style={styles.backText} name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.header}>
          Mark <Text style={styles.highlight}>Attendance</Text>
        </Text>
        <Text style={{ color: '#444', marginBottom: 20, fontFamily: 'PlusR' }}>
          Mark Today's Attendance
        </Text>

        <TouchableOpacity onPress={Keyboard.dismiss} activeOpacity={1}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name"
              value={search}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>
        </TouchableOpacity>

        <Modal visible={showPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
              <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.doneBtn}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {renderLegend()}

        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.list}
          data={filteredEmployees}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          renderItem={renderEmployeeRow}
          initialNumToRender={10}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
          onStartShouldSetResponder={() => true}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Attendance</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: wp('4.5%'), backgroundColor: '#fff' },
  backButton: { marginBottom: hp('1.2%') },
  backText: { color: '#000', fontSize: wp('6.8%'), fontWeight: '1200' },
  header: { fontSize: wp('8%'), color: '#111', marginBottom: hp('1.2%'), fontFamily: 'PlusSB' },
  highlight: { fontFamily: 'PlusSB', color: '#5aaf57' },
  dateBtn: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#fff',
    borderRadius: wp('2.5%'),
    alignSelf: 'center',
    marginBottom: hp('1.5%'),
  },
  dateText: { fontSize: wp('4.5%'), fontFamily: 'PlusSB', color: '#111' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    width: wp('75%'),
    alignItems: 'center',
  },
  doneBtn: {
    marginTop: hp('1.5%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('6%'),
    backgroundColor: '#007AFF',
    borderRadius: wp('2%'),
  },
  doneText: { color: '#fff', fontWeight: '600' },
  list: {
    marginTop: hp('5%'),
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp('1.2%'),
    paddingHorizontal: wp('2.5%'),
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('1%'),
    marginVertical: hp('0.7%'),
  },
  legendBox: {
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('1%'),
    marginRight: wp('2%'),
  },
  legendText: { fontSize: wp('3.5%'), fontFamily: 'PlusR', color: '#222' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    alignItems: 'center',
    width: '100%',
  },
  nameText: {
    fontSize: wp('4.2%'),
    color: '#222',
    fontFamily: 'PlusR',
  },
  statusGroup: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.25,
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.2%') : hp('0.7%'),
    marginBottom: hp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#111',
    fontFamily: 'PlusR',
  },
  submitBtn: {
    position: 'absolute',
    bottom: hp('1.8%'),
    left: wp('4%'),
    right: wp('4%'),
    padding: hp('1.8%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  submitText: {
    color: '#000',
    fontSize: wp('4.8%'),
    fontFamily: 'PlusR',
  },
});

export default MarkToday;