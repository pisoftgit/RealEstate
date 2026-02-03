import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../../../services/api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GeneratedSalary = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  // Extract and parse the stringified 'data' parameter
  const { data } = params;
  let parsedParams;
  try {
    parsedParams = data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error parsing navigation params:', error);
    parsedParams = {};
  }

  // Destructure the parsed params
  const { salaryData, selectedMonth, selectedYear, selectedEmployeeIds } = parsedParams;

  // State for salary data
  const [salaries, setSalaries] = useState(salaryData || []);
  const [filteredSalaries, setFilteredSalaries] = useState(salaryData || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch salary data (for refresh)
  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const url = `${API_BASE_URL}/employee/salaries/calculate?selectedYear=${selectedYear}&selectedMonth=${selectedMonth}&selectedEmployeeIds=${selectedEmployeeIds?.join(',') || ''}`;

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
      Alert.alert('Error', 'Failed to fetch salary data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
    fetchSalaryData();
  }, [selectedMonth, selectedYear, selectedEmployeeIds]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_BASE_URL}/employee/salaries/save?selectedYear=${selectedYear || '2025'}&selectedMonth=${selectedMonth || 'March'}&selectedEmployeeIds=${selectedEmployeeIds?.join(',')}`;
      
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
          'secret_key': secretKey,
        },
      });

      console.log('Submit Salary Response:', response.data);

      Alert.alert(
        'Success',
        `Salary details for ${selectedMonth || 'N/A'} ${selectedYear || 'N/A'} have been submitted successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting salary:', error.message || error);
      if (error.response) {
        console.log('Error Response Data:', error.response.data);
        console.log('Error Response Status:', error.response.status);
      }
      Alert.alert('Error', 'Failed to submit salary. Please try again.');
    }
  };

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
        Generated <Text style={{ color: '#5aaf57' }}>Salary</Text>
      </Text>

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
        <>
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
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default GeneratedSalary;

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
  submitButton: {
    backgroundColor: '#5aaf57',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  submitButtonText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#fff',
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