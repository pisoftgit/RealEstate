import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const StatCard = ({ title, value, percentage, iconName, gradientColors }) => {
  return (
    
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={16} color="#fff" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.percentage}>{percentage}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: wp('6%'),
    padding: wp('3%'),
    height: hp('12%'),
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily:"PlusSB"
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: wp('1.5%'),
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 0,
  },
  value: {
    color: '#fff',
    fontSize: wp('5.5%'),
    fontFamily:"PlusB"
  },
  percentage: {
    color: '#fff',
    fontSize: wp('3.5%'),
    marginTop: -hp('1.7%'),
    marginLeft: "auto",
    fontFamily:"PlusSB"
  },
});

export default StatCard;
