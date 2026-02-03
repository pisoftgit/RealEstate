import { View, Alert, Text, SafeAreaView, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../context/UserContext';
import Malelogo from "../../../assets/svg/loguser.svg";
import { LinearGradient } from 'expo-linear-gradient';
import useLogin from '../../../hooks/useLogin';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Profile = () => {
  const Router = useRouter();
  const { user, img } = useUser() || {};
  const { logout, loading } = useLogin();
  console.log(user)

  const renderProfileImage = () => {
    if (user.userCategoryCode === '0') {
      if (user.gender === 'Female') {
        return <Femalelogo height={wp('21.3%')} width={wp('21.3%')} />;
      } else {
        return <Malelogo height={wp('21.3%')} width={wp('21.3%')} />;
      }
    } else if (!img) {
      if (user.gender === 'Female') {
        return <Image
          source={require("../../../assets/images/woman.png")}
          style={Styles.img2}
        />;
      } else {
        return <Malelogo height={wp('21.3%')} width={wp('21.3%')} />;
      }
    } else {
      return (
        <Image
          source={{ uri: `data:image/jpeg;base64,${img}` }}
          style={Styles.img}
        />
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure to Logout?",
      [
        {
          text: "cancel", style: "cancel"
        },
        {
          text: "Log-Out", style: "destructive",
          onPress: async () => {
            await logout();
            Router.replace("(auth)/Login")

          },

        },
      ],
      { cancelable: true }

    );



  }

  return (
    <SafeAreaView style={Styles.container}>
      {/* Header */}
      <View style={Styles.header}>
        <Ionicons name="menu" size={hp('3%')} color="black" />
        <Text style={Styles.title}>My  <Text style={{ color: "#5aaf57" }}>Profile</Text> </Text>
      </View>

      {/* Profile Card with Image */}
      <View style={Styles.cardWrapper}>
        <View style={Styles.profileImageContainer}>
          {renderProfileImage()}
        </View>

        <LinearGradient
          colors={['#5AAF57', '#8DDC85']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 3 }}
          style={Styles.card}
        >
          <View style={Styles.infoSection}>
            <Text style={Styles.name}>{user.name}</Text>
            <Text style={Styles.info}>
              {user.userCategoryCode === "0" ? 'Admin' : user.designation?.name}
            </Text>
            <Text style={Styles.info}>
              {user.userCategoryCode === "0" ? "Land Twisters Pvt .Ltd" : user.designation?.department?.department}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <Text style={Styles.divcont}>

      </Text>
      <Text style={Styles.set} >

        <Ionicons ></Ionicons>

        Settings</Text>

      {/* Menu */}
      <View style={Styles.menuWrapper}>
        <TouchableOpacity style={Styles.menuButton}>
          <Ionicons name="lock-closed-outline" size={hp('2.5%')} color="#333" />
          <Text style={Styles.menuText}>Change Password</Text>
          <Ionicons name="chevron-forward" style={Styles.chevy} size={hp('2.5%')} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity

          onPress={handleLogout}
          disabled={loading}

          style={Styles.menuButton}>



          <Ionicons name="log-out-outline" size={hp('2.5%')} color="#333" />
          <Text style={Styles.menuText}>{loading ? "Logging out..." : "Logout"}</Text>
          <Ionicons name="chevron-forward" style={Styles.chevy} size={hp('2.5%')} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
  },
  title: {
    marginTop: hp('1.8%'),
    fontSize: hp('4%'),
    color: '#333',
    fontFamily: 'PlusSB',
    
  },
  divcont: {
    height: 1,
    backgroundColor: "#ccc",
    width: wp('80%'),
    marginVertical: hp('1.2%'),
    bottom: hp('1.2%'),
    alignSelf: "center"
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  card: {
    width: wp('75%'),
    height: hp('12.3%'),
    borderRadius: 12,
    paddingLeft: wp('13.3%'),
    justifyContent: 'center',
    marginTop: hp('2.5%'),
    ...Platform.select({
      ios: {
        shadowColor: "#5aaf57",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileImageContainer: {
    position: 'absolute',
    left: wp('5.3%'),
    top: hp('1.8%'),
    backgroundColor: 'white',
    borderRadius: 60,
    padding: wp('4%'),
    zIndex: 10,
  },
  set: {
    padding: wp('2.6%'),
    paddingLeft: wp('8%'),
    fontSize: hp('2.5%'),
    fontFamily: "PlusSB",
    color: "#5aaf57"
  },
  img: {
    height: wp('21.3%'),
    width: wp('21.3%'),
    borderRadius: 70,
  },
  img2: {
    height: wp('21.3%'),
    width: wp('18.6%'),
    borderRadius: 80,
  },
  infoSection: {
    alignSelf: "center"
  },
  name: {
    color: '#fff',
    fontSize: hp('2.7%'),
    marginBottom: hp('0.5%'),
    fontFamily: "PlusSB",
  },
  info: {
    color: 'white',
    fontSize: hp('1.5%'),
    fontFamily: "PlusSB",
  },
  chevy: {
    marginLeft: "auto"
  },
  menuWrapper: {
    backgroundColor: 'white',
    marginHorizontal: wp('5.3%'),
    borderRadius: 12,
    paddingVertical: hp('0.6%'),
    ...Platform.select({
      ios: {
        shadowColor: "#5aaf57",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('5.3%'),
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: hp('2%'),
    fontFamily: "PlusR",
    color: '#333',
    marginLeft: wp('4%'),
  },
});
