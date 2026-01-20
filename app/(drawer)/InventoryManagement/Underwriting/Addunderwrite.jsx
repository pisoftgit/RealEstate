
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import UnderwriteForm from '../../../../components/UnderwriteForm';
const Addunderwrite = () => {
  const navigation = useNavigation();
  return (
    <>
      <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 0, paddingHorizontal: 16, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 32, fontFamily: 'PlusSB', color: '#333333' }}>Underwriting</Text>
          <Text style={{ fontSize: 32, fontFamily: 'PlusSB', color: '#2e7d32' }}>Add Details</Text>
          <Text style={{ fontSize: 13, fontFamily: 'PlusL', color: '#66bb6a', marginTop: 5 }}>
            Fill property and commission details below.
          </Text>
        </View>
        <LottieView
          source={require('../../../../assets/svg/reales.json')}
          autoPlay
          loop
          style={{ width: 90, height: 90, marginTop: -40 }}
        />
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#e8f5e9' }} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ backgroundColor: '#f4fcf4', borderRadius: 16, padding: 10, marginHorizontal: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 22, fontFamily: 'PlusSB', color: '#2e7d32', marginLeft: 10 }}>Property Details</Text>
          </View>
          <UnderwriteForm level={1} />
        </View>
      </ScrollView>
    </>
  );
}

export default Addunderwrite;
