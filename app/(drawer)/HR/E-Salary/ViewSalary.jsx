import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ViewSalary = () => {
  const navigation = useNavigation();

  // State for salary data
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for month and year selectors
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  // Dropdown options
  const months = [
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
    { label: 'March', value: 'March' },
    { label: 'April', value: 'April' },
    { label: 'May', value: 'May' },
    { label: 'June', value: 'June' },
    { label: 'July', value: 'July' },
    { label: 'August', value: 'August' },
    { label: 'September', value: 'September' },
    { label: 'October', value: 'October' },
    { label: 'November', value: 'November' },
    { label: 'December', value: 'December' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => ({
    label: `${2025 - i}`,
    value: `${2025 - i}`,
  }));

  // Fetch salary data
  const fetchSalaryData = async (month, year) => {
    setLoading(true);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_BASE_URL}/employee/salaries/view?selectedYear=${year}&selectedMonth=${month}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'secret_key': secretKey,
        },
      });

      console.log('Fetched Salary Data:', response.data);

      // Ensure response.data is an array
      let salaryData = [];
      if (Array.isArray(response.data)) {
        salaryData = response.data;
      } else if (response.data && Array.isArray(response.data.salaries)) {
        salaryData = response.data.salaries;
      } else if (response.data && Array.isArray(response.data.data)) {
        salaryData = response.data.data;
      } else {
        throw new Error('Unexpected API response structure: salary data is not an array');
      }

      setSalaries(salaryData);
      setFilteredSalaries(salaryData);
    } catch (error) {
      console.error('Error fetching salary data:', error.message || error);
      if (error.response) {
        console.log('Error Response Data:', error.response.data);
        console.log('Error Response Status:', error.response.status);
      }
      Alert.alert('Error', 'Failed to fetch salary data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when month or year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchSalaryData(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSalaries(salaries);
    } else {
      const filtered = salaries.filter(salary => {
        const name = salary.employeeName || '';
        return name.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredSalaries(filtered);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSalaryData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Render each salary card
  const renderSalaryCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.employeeName || 'N/A'}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Email:</Text>
        <Text style={styles.cardValue}>{item.employeeEmailId || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Department:</Text>
        <Text style={styles.cardValue}>{item.departmentName || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Designation:</Text>
        <Text style={styles.cardValue}>{item.designation || 'N/A'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Basic Pay:</Text>
        <Text style={styles.cardValue}>₹{item.basicPay?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={styles.cardSection}>
        <Text style={styles.cardSubtitle}>Allowances:</Text>
        {item.allowancesWithPrice ? (
          Object.entries(item.allowancesWithPrice).map(([key, value]) => (
            <View key={key} style={styles.cardRow}>
              <Text style={styles.cardLabel}>{key}:</Text>
              <Text style={styles.cardValue}>₹{value.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.cardValue}>None</Text>
        )}
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Total Allowance:</Text>
          <Text style={styles.cardValue}>₹{item.totalAllowance?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
      <View style={styles.cardSection}>
        <Text style={styles.cardSubtitle}>Deductions:</Text>
        {item.deductionsWithPrice ? (
          Object.entries(item.deductionsWithPrice).map(([key, value]) => (
            <View key={key} style={styles.cardRow}>
              <Text style={styles.cardLabel}>{key}:</Text>
              <Text style={styles.cardValue}>₹{value.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.cardValue}>None</Text>
        )}
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Total Deduction:</Text>
          <Text style={styles.cardValue}>₹{item.totalDeduction?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Net Pay:</Text>
        <Text style={[styles.cardValue, styles.netPay]}>
          ₹{item.netPay?.toFixed(2) || '0.00'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="#5aaf57" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        View <Text style={{ color: '#5aaf57' }}>Salary</Text>
      </Text>

      {/* Month and Year Selectors */}
      <View style={styles.selectorContainer}>
        <View style={[styles.selectorWrapper, { zIndex: 2000 }]}>
          <DropDownPicker
            open={monthOpen}
            value={selectedMonth}
            items={months}
            setOpen={setMonthOpen}
            setValue={setSelectedMonth}
            setItems={() => {}}
            placeholder="Select Month"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
          />
        </View>
        <View style={[styles.selectorWrapper, { zIndex: 1000 }]}>
          <DropDownPicker
            open={yearOpen}
            value={selectedYear}
            items={years}
            setOpen={setYearOpen}
            setValue={setSelectedYear}
            setItems={() => {}}
            placeholder="Select Year"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
          />
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Salary Cards List */}
      {loading ? (
        <ActivityIndicator size="large" color="#5aaf57" style={styles.loader} />
      ) : filteredSalaries.length === 0 ? (
        <Text style={styles.noDataText}>No salary data found.</Text>
      ) : (
        <FlatList
          data={filteredSalaries}
          renderItem={renderSalaryCard}
          keyExtractor={(item) => item.employeeId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.salaryList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ViewSalary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp('5%'),
  },
  backButton: {
    marginBottom: hp('2.5%'),
  },
  title: {
    fontSize: wp('8%'),
    fontFamily: 'PlusR',
    marginBottom: hp('2.5%'),
    color: '#333',
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
  },
  selectorWrapper: {
    flex: 0.48,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    padding: wp('2.5%'),
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    padding: wp('2.5%'),
    marginBottom: hp('2.5%'),
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    backgroundColor: '#fff',
  },
  salaryList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginBottom: hp('3%'),
    elevation: 3,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: wp('5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.8%'),
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  cardSection: {
    marginVertical: hp('1.2%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: hp('1.2%'),
  },
  cardSubtitle: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
    marginBottom: hp('1%'),
  },
  cardLabel: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
  },
  cardValue: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#333',
  },
  netPay: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
  },
  loader: {
    marginTop: hp('2.5%'),
  },
  noDataText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#666',
    textAlign: 'center',
    marginTop: hp('2.5%'),
  },
});