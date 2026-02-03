// components/ReusableDropdown.js
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ReusableDropdown = ({ label, data, value, onChange }) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      {value || isFocus ? (
        <Text style={[styles.label, isFocus && { color: '#5aaf57' }]}>
          {label}
        </Text>
      ) : null}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: '#5aaf57' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? label : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? '#5aaf57' : '#888'}
            name="caretdown"
            size={16}
          />
        )}
      />
    </View>
  );
};

export default ReusableDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('1.5%'),
  },
  dropdown: {
    height: hp('6.5%'),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2.5%'),
    backgroundColor: '#fafafa',
  },
  icon: {
    marginRight: wp('1.2%'),
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: wp('3.5%'),
    top: -hp('1%'),
    zIndex: 999,
    paddingHorizontal: wp('1.5%'),
    fontSize: wp('3.2%'),
    color: '#444',
  },
  placeholderStyle: {
    fontSize: wp('3.5%'),
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: wp('3.5%'),
    color: '#000',
  },
  iconStyle: {
    width: wp('5%'),
    height: wp('5%'),
  },
  inputSearchStyle: {
    height: hp('5.2%'),
    fontSize: wp('3.5%'),
  },
});
