import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ViewLeads = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>View Leads Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: wp('4.8%'),
  },
});

export default ViewLeads;
