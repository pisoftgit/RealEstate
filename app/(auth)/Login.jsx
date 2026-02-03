import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Userlogo from '../../assets/svg/loguser.svg';
import { useRouter } from 'expo-router';
import useLogin from '../../hooks/useLogin';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useLogin();
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    console.log('Logging in...');
    const result = await login(identifier, password);
    console.log('Login result:', result);

    if (result.success) {
      router.replace('/(drawer)/(tabs)/Home');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid email/usercode or password.');
      setIdentifier('');
      setPassword('');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.innerContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.Iconcontainer}>
                <Ionicons
                  onPress={() => router.push("/Onboard")}
                  style={styles.backIcon}
                  name="chevron-back-sharp"
                  size={hp('2.8%')}
                  color="black"
                />
              </View>

              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Glad to see you, <Text style={styles.textGreen}>again!</Text>
              </Text>

              <View style={styles.userIconContainer}>
                <Userlogo height={hp('10%')} width={hp('10%')} />
              </View>

              <View style={styles.centeredContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter the Email or Usercode"
                  placeholderTextColor="#444444"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordField}
                    placeholder="Enter the Password"
                    placeholderTextColor="#444444"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={passwordVisible ? 'eye-off' : 'eye'}
                      size={hp('2.5%')}
                      color="#555"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity>
                  <Text style={styles.forgetPassword}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.loginButton}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.fixedBottom}>
                  <Text style={styles.bottomText}>
                    Don't have an account?{' '}
                    <Text style={styles.contactAdmin}>Contact Admin</Text>
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp('5%'),
  },
  fixedBottom: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
    backgroundColor: 'transparent',
    marginTop: hp('0.5%'),
    borderColor: '#e0e0e0',
  },
  title: {
    fontFamily: 'PlusSB',
    fontSize: hp('3.5%'),
    color: 'black',
    marginBottom: hp('0.5%'),
  },
  subtitle: {
    fontFamily: 'PlusR',
    fontSize: hp('2.8%'),
    color: 'black',
    marginBottom: hp('6%'),
  },
  textGreen: {
    fontFamily: 'PlusSB',
    color: '#5aaf57',
  },
  Iconcontainer: {
    height: hp('4%'),
    width: hp('4%'),
    backgroundColor: '#ffff',
    marginBottom: hp('1.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: hp('1%'),
  },
  innerContainer: {},
  centeredContainer: {
    width: wp('90%'),
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    shadowColor: '#5aaf57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userIconContainer: {
    alignSelf: 'center',
    marginBottom: hp('2.5%'),
  },
  inputField: {
    width: '100%',
    height: hp('6%'),
    backgroundColor: '#f0f0f0',
    borderRadius: wp('2%'),
    borderColor: '#d3d3d3',
    borderWidth: 0.5,
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    fontSize: hp('1.8%'),
    fontFamily: 'PlusR',
  },
  passwordContainer: {
    width: '100%',
    height: hp('6%'),
    backgroundColor: '#f0f0f0',
    borderRadius: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d3d3d3',
    borderWidth: 0.5,
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1.2%'),
  },
  passwordField: {
    flex: 1,
    fontSize: hp('1.8%'),
    color: 'black',
    fontFamily: 'PlusR',
  },
  eyeIcon: {
    marginLeft: wp('2.5%'),
  },
  forgetPassword: {
    color: '#5a5a5a',
    fontSize: hp('1.7%'),
    marginBottom: hp('1.2%'),
    fontFamily: 'PlusSB',
    marginLeft: 'auto',
  },
  loginButton: {
    width: '100%',
    height: hp('6%'),
    backgroundColor: '#000',
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.2%'),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusR',
  },
  bottomText: {
    fontSize: hp('1.7%'),
    color: '#444',
    fontFamily: 'PlusR',
  },
  contactAdmin: {
    color: '#5aaf57',
    fontFamily: 'PlusSB',
  },
});

export default Login;