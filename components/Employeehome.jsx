import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Icons!
import LottieView from 'lottie-react-native';
import AdminStatsSection from './AdminStatSection';
import AdminAppointments from './AdminAppointments';
import { useNavigation } from 'expo-router';
import { useUser } from "../context/UserContext";
import { useUserProfile } from "../hooks/useUserProfile";
import AttendanceCard from './AttendenceCard';
import  Userlogo from '../assets/svg/loguser.svg';
import Felogo from '../assets/svg/Folder.svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { height, width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height * 0.27;
const HEADER_MIN_HEIGHT = height * 0.13;
const CARD_HEIGHT = height * 0.12;





const AdminDashboard = () => {
  const navigation = useNavigation();
  const { user, img } = useUser();
  const { profile, loading, error } = useUserProfile();

  const desi = user.designation;
  console.log("desi", desi);
  console.log(user.gender);
  console.log("User Profile:", profile);
   



  
  
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const cardOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - 25],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });
  const welcomeFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [36, 20],
    extrapolate: 'clamp',
  });

  const welcomeTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -width / 3 + 40], // shift to left
    extrapolate: 'clamp',
  });

  const welcomeTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -10], // reduced from -HEADER_MAX_HEIGHT / 2 + 50
    extrapolate: 'clamp',
  });

  const userIconOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - 10],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#00C897" translucent /> */}
      < LottieView
         source={require('../assets/svg/header.json')}
         autoPlay={true}
         loop={true}
         speed={0.5}
         style={styles.ani}
       />
       <Animated.View
  style={[
    styles.centerTextContainer,
    {
      transform: [
        { translateX: welcomeTranslateX },
        { translateY: welcomeTranslateY },
      ],
    },
  ]}
>
  <Animated.Text style={[styles.bigWelcome, { fontSize: welcomeFontSize }]}>
  <Animated.View style={{  opacity: userIconOpacity,}}>
   <LottieView
     source={require('../assets/svg/reales.json')}
     autoPlay={true}
     loop={true}
     speed={0.5}
     style={styles.ani2}
   />
  </Animated.View>
     Welcome <Text style={{ color: '#5aaf57', fontFamily: 'PlusR' }}>
       {profile?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'User'}
     </Text>

  </Animated.Text>
</Animated.View>

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {/* Top Row: Icons */}
      
        <View style={styles.headerTopRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
  <Ionicons name="menu" size={26} color="#000" />
</TouchableOpacity>
          <TouchableOpacity>
            <Feather name="user" size={24} color="#000" />
          </TouchableOpacity>
          
        </View>

        {/* Center Title */}
       
        {/* Small admin name when header shrinks */}
        
       
      </Animated.View>
      

      {/* Animated Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          },
        ]}
      >
        
       


  
    {img ? (
      <Image
      source={{uri:`data:image/jpeg;base64,${img}`}}
      style={styles.avatar}
      
      />
    ): user.gender==='Male'?(
      <Userlogo style={styles.svgicon} height={55} width={55} />
    ):(
       <Image
      source={require("../assets/images/woman.png")}
      style={styles.avatar}
      
      />
    )
    }
        <View style={styles.cardContent}>
          <Text style={styles.name}>
            {profile?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'User'}
          </Text>
         
          {profile?.usercode && (
            <Text style={styles.details}>{profile.usercode}</Text>
          )}
        </View>
      </Animated.View>

      {/* Scroll Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={{ height: 800, padding: 20 }}>
      
         <AdminStatsSection></AdminStatsSection>
       

         <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
  
   <AttendanceCard></AttendanceCard>

    <AdminAppointments></AdminAppointments>
    
    </SafeAreaView>

        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: wp('5%'),
    paddingTop: Platform.OS === 'android' ? hp('2%') : hp('7.5%'),
    paddingBottom: hp('2.5%'),
    zIndex: 10,
    elevation: 5,
    
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerTextContainer: {
    marginTop: HEADER_MIN_HEIGHT - 10,
    alignItems: 'center',
    width: '100%',
    zIndex: 15,
  },
  bigWelcome: {
    color: '#000',
    fontSize: wp('9%'),
    fontFamily: "PlusR"
  },
  svgicon:{
    marginLeft: wp('8%'),
    right: wp('2.5%'),
  },
 
  card: {
    position: 'absolute',
    top: HEADER_MAX_HEIGHT - CARD_HEIGHT / 1.1,
    alignSelf: 'center',
    width: width * 0.80,
    height: CARD_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    padding: wp('3%'),
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#5aaf57',
        shadowOpacity: 0.3,
        shadowRadius: wp('2%'),
        shadowOffset: { width: 0, height: hp('0.5%') },
      },
    }),
  },
  avatar: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    marginLeft: wp('12%'),
    resizeMode: 'cover',
  },
  
  cardContent: {
    marginLeft: wp('5%'),
    flexShrink: 1,
  },
  ani: {
    ...StyleSheet.absoluteFillObject,
    height: wp('50%'),
    width: wp('50%'),
    transform: [{ scale: 4.5 }],
  },
  name: {
    fontSize: wp('6.2%'),
    color: '#000',
    fontFamily: "PlusR"
  },
  designation: {
    fontSize: wp('3.5%'),
    color: '#196f3d',
    marginVertical: hp('0.3%'),
  },
  details: {
    fontSize: wp('3.2%'),
    color: '#196f3d',
    fontFamily: "PlusR",
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT - 160,
    paddingBottom: hp('18%'),
  },
});

export default AdminDashboard;
