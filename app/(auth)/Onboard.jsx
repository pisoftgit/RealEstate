import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useTestAPIs from "../../hooks/useTestAPIs";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { height } = Dimensions.get("window");

const Onboard = () => {
  const Router = useRouter();
  // useTestAPIs();

  return (
    <>
      <ImageBackground
        source={require("../../assets/images/onboard.jpg")}
        style={[styles.imageBackground, { height: hp('79%') }]}
        resizeMode="cover"
      >
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />
          <View style={styles.wrapper}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.description}>Discover Your Dream</Text>
          </View>
        </SafeAreaView>

        {/* White container at the bottom */}
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>Welcome!</Text>
          <Text style={styles.bottomText2}>
            Let's <Text style={styles.greenText}>Work</Text>
          </Text>

          <View style={styles.bottomView}>
            <View style={styles.rowContainer}>
              <Text style={styles.bottomText3}>
                Click here to proceed for Login
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  Router.push("/(auth)/Login");
                }}
              >
                <Ionicons
                  name="chevron-forward-circle-sharp"
                  size={hp('8%')}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default Onboard;

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
  },
  wrapper: {
    paddingBottom: hp('6%'),
    paddingHorizontal: wp('5%'),
    alignItems: "center",
  },
  title: {
    fontSize: hp('4%'),
    color: "#fff",
    letterSpacing: wp('0.6%'),
    marginTop: hp('-15%'),
    fontFamily: "PlusB",
  },
  description: {
    fontSize: hp('1.6%'),
    color: "#fff",
    letterSpacing: wp('0.2%'),
    lineHeight: hp('2.5%'),
    top: hp('1.8%'),
    fontFamily: "PlusR",
    marginTop: hp('-2%'),
    marginLeft: wp('2%'),
  },
  bottomContainer: {
    position: "relative",
    backgroundColor: "#fff",
    height: hp('30%'),
    justifyContent: "center",
    paddingHorizontal: wp('8%'),
    marginBottom: hp('1.2%'),
    alignItems: "flex-start",
    width: "100%",
    borderTopLeftRadius: wp('10%'),
    borderTopRightRadius: wp('10%'),
    minHeight: hp('20%'),

  },
  bottomText: {
    fontSize: hp('4.2%'),
    color: Colors.black,
    fontFamily: "PlusSB",
    marginBottom: hp('0.8%'),

  },
  bottomText2: {
    fontSize: hp('3%'),
    color: "Colors.black",
    fontFamily: "PlusR",
    marginBottom: hp('0.5%'),

  },

  greenText: {
    color: "green",
  },
  button: {
    right: 1,
  },

  bottomView: {
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    width: '100%',
  },

  rowContainer: {
    flexDirection: 'row',
    gap: Platform.OS === 'ios' ? wp('12%') : wp('8%'),
    justifyContent: 'space-between',
    alignItems: 'center',
    left: wp('-4%'),
  },

  bottomText3: {
    fontSize: hp('1.8%'),
    color: 'black',
    fontFamily: 'PlusR',

  },
});
