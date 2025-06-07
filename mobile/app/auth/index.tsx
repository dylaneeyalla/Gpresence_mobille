import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      password: '',
    };

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await login(username, password);
        router.replace('/(tabs)');
      } catch (err) {
        console.error('Login failed:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/8617742/pexels-photo-8617742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.logoBackground}
          />
          <View style={styles.overlay} />
          <View style={styles.logoContent}>
            <Image
              source={{ uri: 'https://i.ibb.co/QdnZVgV/attendance-logo.png' }} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>ClassCheck</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={<User size={18} color={colors.textMedium} />}
            error={formErrors.username}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            isPassword
            leftIcon={<Lock size={18} color={colors.textMedium} />}
            error={formErrors.password}
          />

          <View style={styles.loginButtonContainer}>
            <Button 
              title="Login" 
              onPress={handleLogin}
              loading={loading}
              fullWidth
            />
          </View>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoText}>Demo Credentials:</Text>
            <Text style={styles.demoSubText}>Username: teacher1 | Password: password123</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 51, 102, 0.7)', // Dark blue overlay
  },
  logoContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: colors.white,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEECEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.error,
  },
  loginButtonContainer: {
    marginTop: 16,
  },
  demoCredentials: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  demoSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
    textAlign: 'center',
  },
});