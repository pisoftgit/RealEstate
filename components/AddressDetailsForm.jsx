import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import useDropdownData from "../hooks/useDropdownData";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CustomDropdown = ({ value, setValue, data, placeholder }) => {
  const [isFocus, setIsFocus] = useState(false);
  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: "#5aaf57" }]}
      placeholderStyle={styles.dropdownPlaceholder}
      selectedTextStyle={styles.dropdownPlaceholder}
      data={data}
      maxHeight={200}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        console.log(`CustomDropdown: ${placeholder} selected value:`, item.value); // ADDED: Debug log
        setValue(item.value);
        setIsFocus(false);
      }}
    />
  );
};

export default function AddressDetailsForm({ initialData, onSubmit, onBack }) {
  const [data, setData] = useState({
    country: null,
    state: null,
    district: null,
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    ...initialData,
  });

  console.log("useDropdownData inputs:", { country: data.country, state: data.state }); // ADDED: Debug log

  const { countries, states, districts } = useDropdownData(
    null, // Pass null for selectedDepartmentId (not used in this form)
    data.country,
    data.state,
    null // Pass null for selectedDesignationId (not used in this form)
  );

  const handleValueChange = (key, value) => {
    console.log(`handleValueChange: key=${key}, value=${value}`); // ADDED: Debug log
    setData((prevData) => ({
      ...prevData,
      [key]: value,
      ...(key === "country" && { state: null, district: null }),
      ...(key === "state" && { district: null }),
    }));
  };

  const validateForm = () => {
    const requiredFields = ["country", "state", "district", "addressLine1", "city", "pincode"];
    for (const key of requiredFields) {
      if (!data[key] || data[key].toString().trim() === "") {
        alert(`Please fill in the ${key.replace(/([A-Z])/g, " $1").trim()} field`);
        return false;
      }
    }
    return true;
  };

  const getRequiredMark = () => <Text style={{ color: "red", fontSize: 12, marginLeft: 2 }}>*</Text>;

  const groupedFields = [
    [
      { key: "country", placeholder: "Country" },
      { key: "state", placeholder: "State" },
    ],
    [
      { key: "district", placeholder: "District" },
  
      { key: "city", placeholder: "City" },
    ],
    [{ key: "addressLine1", placeholder: "Address Line 1" }],
    [
      { key: "addressLine2", placeholder: "Address Line 2" },
      { key: "pincode", placeholder: "Pincode" },
    ],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Address</Text>
          <Text style={styles.headerSubTitle}>Details</Text>
          <Text style={styles.headerDesc}>
            Fill out the Address Details below
          </Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.flexGrid}
      >
        {groupedFields.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[styles.rowContainer, { zIndex: 1000 - rowIndex * 10 }]}
          >
            {row.map((item, itemIndex) => (
              <View key={item.key} style={styles.inputWrapper}>
                <Text style={styles.label}>
                  {item.placeholder}
                  {getRequiredMark()}
                </Text>
                {["addressLine1", "addressLine2", "pincode", "city"].includes(item.key) ? (
                  <TextInput
                    style={styles.input}
                    placeholder={item.placeholder}
                    placeholderTextColor="#333"
                    value={data[item.key] || ""}
                    onChangeText={(text) => handleValueChange(item.key, text)}
                    keyboardType={item.key === "pincode" ? "numeric" : "default"}
                  />
                ) : (
                  <CustomDropdown
                    value={data[item.key]}
                    setValue={(val) => handleValueChange(item.key, val)}
                    data={
                      item.key === "country"
                        ? countries
                        : item.key === "state"
                        ? states
                        : item.key === "district"
                        ? districts
                        : []
                    }
                    placeholder={` ${item.placeholder}`}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button1} onPress={onBack}>
          <Ionicons
            name="chevron-back-circle-sharp"
            size={55}
            color="black"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button2}
          onPress={() => {
            if (validateForm()) {
              const finalPayload = {
                ...data,
                stateId: data.state,
              };
              delete finalPayload.state;
              console.log("Final Payload to API:", finalPayload);
              onSubmit(finalPayload);
            }
          }}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp('5%'),
    marginTop: Platform.OS === "ios" ? hp('7.5%') : hp('8.5%'),
    marginBottom: hp('2.5%'),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp('9%'),
    fontFamily: "PlusSB",
  },
  headerSubTitle: {
    fontSize: wp('7.5%'),
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginTop: -hp('0.6%'),
  },
  headerDesc: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusR",
    marginTop: hp('0.6%'),
  },
  flexGrid: {
    flexDirection: "column",
    gap: hp('2%'),
    paddingHorizontal: wp('4%'),
    marginTop: hp('1.2%'),
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp('3%'),
  },
  inputWrapper: {
    flex: 1,
    marginBottom: hp('0.5%'),
    minWidth: wp('25%'),
  },
  input: {
    height: hp('5.2%'),
    backgroundColor: "#fff",
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('3.5%'),
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.12%') },
    shadowOpacity: 0.05,
    shadowRadius: wp('0.5%'),
    elevation: 2,
  },
  label: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusSB",
    fontWeight: "600",
    marginBottom: hp('0.5%'),
    color: "#5aaf57",
  },
  dropdown: {
    height: hp('5.2%'),
    backgroundColor: "#fff",
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('3.5%'),
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    justifyContent: "center",
  },
  dropdownPlaceholder: {
    color: "#333",
    fontFamily: "PlusR",
    fontSize: wp('3.7%'),
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: wp('4%'),
  },
  button1: {
    alignSelf: "flex-start",
  },
  button2: {
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "#fff",
    backgroundColor: "#000",
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('6.5%'),
    fontFamily: "PlusSB",
    fontSize: wp('4.2%'),
    textAlign: "center",
  },
});