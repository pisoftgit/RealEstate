import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Stepper = ({ currentStep, labels, onStepPress }) => {
  const animatedWidths = useRef(labels.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animatedWidths.forEach((animVal, index) => {
      const toValue = index < currentStep ? 1 : 0;
      Animated.timing(animVal, {
        toValue,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStep]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.stepperContainer}>
        {labels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === labels.length - 1;

          return (
            <View style={styles.stepSection} key={index}>
              <Pressable
                onPress={() => {
                  if (onStepPress) onStepPress(index);
                }}
                style={styles.stepWrapper}
              >
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: isCompleted
                        ? '#32cd32'
                        : isActive
                        ? '#5aaf57'
                        : '#ccc',
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.checkmark}>✔</Text>
                  ) : (
                    <View style={styles.innerDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    isCompleted && styles.completedLabel,
                    isActive && styles.activeLabel,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>

              {!isLast && (
    <View style={styles.lineWrapper}>
    <View style={styles.staticLine} />
    <Animated.View
      style={[
        styles.animatedLine,
        {
          width: animatedWidths[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  </View>
  
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: hp('2.5%'),
    backgroundColor: '#fff',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    marginLeft: wp('8%'),
    marginTop: hp('11.2%'),
  },
  stepSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDot: {
    width: wp('2.2%'),
    height: wp('2.2%'),
    borderRadius: wp('1.1%'),
    backgroundColor: '#fff',
  },
  checkmark: {
    fontSize: wp('3.2%'),
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: wp('2.7%'),
    color: '#666',
    textAlign: 'center',
    marginTop: hp('0.5%'),
    fontFamily: 'PlusR',
  },
  completedLabel: {
    color: '#5aaf57',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#5aaf57',
    fontWeight: '600',
  },
  line: {
    height: 2,
    marginHorizontal: wp('2%'),
    marginTop: -hp('1.8%'),
    alignSelf: 'center',
    left: -wp('6%'),
  },
  lineWrapper: {
    position: 'relative',
    flexGrow: 1,
    height: 2,
    marginHorizontal: -wp('1.2%'),
    marginTop: -hp('1.8%'),
    justifyContent: 'center',
  },
  staticLine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ccc',
    borderRadius: 1,
  },
  animatedLine: {
    height: 2,
    backgroundColor: '#32cd32',
    borderRadius: 1,
  },
  
});

export default Stepper;
