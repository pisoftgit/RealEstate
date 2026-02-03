import React from "react";
import { View, TouchableOpacity, Text, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width } = Dimensions.get("window");

const tabs = [
  { name: "Home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "Notification", label: "Notifications", icon: "notifications-outline", activeIcon: "notifications" },
  { name: "Profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

const CustomTabBar = ({ state, navigation }) => {
  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "white" }}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={[styles.tabItem, isActive && styles.activeTab]}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon} // Switch to filled icon if active
                  size={24}
                  color={isActive ? "#5aaf57" : "#a6acaf"} // Green if active, gray otherwise
                />
              </View>
              {isActive && ( // Show text only when the tab is active
                <Text style={[styles.tabText, isActive && styles.activeText]}>
                  {tab.label}
                </Text>
              )}
              {isActive && <View style={styles.activeLine} />} 
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? hp('3.7%') : hp('1.8%'),
    flexDirection: "row",
    justifyContent: "center",
    height: hp('7.5%'),
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: wp('10%'),
    elevation: 5,
    bordercolor:"white",
    shadowColor: "#5aaf57",
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('1.2%'),
    width: wp('90%'),
  },
  tabItem: {
    flex: 1, // Each tab takes equal space
    alignItems: "center",
    padding: hp('1.5%'),
    position: "relative", // Required for the active line
  },
  tabText: {
    fontSize: wp('3.2%'),
    color:"#5aaf57",
    marginTop: hp('0.5%'),
  },
  activeTab: {
    // No background change for active tab
  },
  activeText: {
    color: "#5aaf57", // Green text for active tab
    fontWeight: "bold",
    fontFamily:"PlusR"
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    // Add styles for active icon container if needed
  },
  activeLine: {
    position: "absolute",
    top: 0, // Line appears above the tab
    height: hp('0.25%'),
    width: "50%",
    backgroundColor: "#4fc3f7", // Green line
    borderRadius: 2,
  },
};

export default CustomTabBar;