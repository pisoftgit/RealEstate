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
import { useUserProfile } from '../hooks/useUserProfile';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { height, width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height * 0.27;
const HEADER_MIN_HEIGHT = height * 0.13;
const CARD_HEIGHT = height * 0.12;





const AdminDashboard = () => {
  const navigation = useNavigation();
  const { profile, loading, error } = useUserProfile();

  console.log("Admin Profile:", profile);





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
                    {/* <Animated.View style={{  opacity: userIconOpacity,}}>
            <LottieView
              source={require('../assets/svg/reales.json')}
              autoPlay={true}
              loop={true}
              speed={0.5}
              style={styles.ani2}
            />
            </Animated.View> */}
          Welcome <Text style={{ color: '#5aaf57', fontFamily: 'PlusR', }}>
            {profile?.name?.split(' ')[0] || 'Admin'}
          </Text>
        </Animated.Text>
      </Animated.View>

      

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={26} color="#000" />
          </TouchableOpacity>

        </View>
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
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.avatar}
        />
        <View style={styles.cardContent}>
          <Text style={styles.name}>
            {profile?.name || 'John Doe'}
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
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerTextContainer: {
    marginTop: Platform.OS === 'ios' ? HEADER_MIN_HEIGHT - 10 : HEADER_MIN_HEIGHT - 40,
    alignItems: 'center',
    width: '100%',
    zIndex: 15,
  },
  bigWelcome: {
    color: '#000',
    fontSize: wp('9%'),
    fontFamily: "PlusR"
  },

  card: {
    position: 'absolute',
    top: Platform.OS === 'ios'
      ? HEADER_MAX_HEIGHT - CARD_HEIGHT / 1.2
      : HEADER_MAX_HEIGHT - CARD_HEIGHT / 1,
    alignSelf: 'center',
    width: width * 0.75,
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
    resizeMode: 'cover',
  },
  cardContent: {
    marginLeft: wp('8%'),
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
    paddingTop: Platform.OS === 'ios'
      ? HEADER_MAX_HEIGHT - 160
      : HEADER_MAX_HEIGHT - 120,
  },
});

export default AdminDashboard;
