import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to ClassCheck',
    description: 'The smart attendance management system for educational institutions',
    image: 'https://i.ibb.co/QdnZVgV/attendance-logo.png'
  },
  {
    id: '2',
    title: 'Track Attendance Easily',
    description: 'Quickly mark attendance for any class or subject with just a few taps',
    image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '3',
    title: 'Insightful Analytics',
    description: 'Get detailed insights and statistics about student attendance patterns',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  
  const viewConfigRef = { viewAreaCoveragePercentThreshold: 50 };
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const goToNextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      router.replace('/auth');
    }
  };

  const skipOnboarding = () => {
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
      />
      
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <PaginationDot 
              key={index} 
              isActive={index === currentIndex}
            />
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
            icon={<ArrowRight size={18} color="white" />}
            iconPosition="right"
            onPress={goToNextSlide}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

interface PaginationDotProps {
  isActive: boolean;
}

const PaginationDot = ({ isActive }: PaginationDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 8, {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }),
      opacity: withTiming(isActive ? 1 : 0.5, {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }),
    };
  });

  return (
    <Animated.View
      style={[
        styles.paginationDot,
        animatedStyle,
        isActive && styles.activePaginationDot,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  skipContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '60%',
    borderRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    padding: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});