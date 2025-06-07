import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { ChevronLeft, AtSign, User, Phone, MapPin, Upload, Camera } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567', // Mock data
    address: '123 School Street, Education City, ST 12345', // Mock data
  });
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      Alert.alert(
        "Profile Updated",
        "Your profile information has been updated successfully.",
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      address: '123 School Street, Education City, ST 12345',
    });
    setIsEditing(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={50} color={colors.primary} />
              </View>
            )}
            
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={18} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileRole}>{user?.role === 'admin' ? 'Administrator' : 'Teacher'}</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            leftIcon={<User size={18} color={colors.textMedium} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            leftIcon={<AtSign size={18} color={colors.textMedium} />}
            editable={isEditing}
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            leftIcon={<Phone size={18} color={colors.textMedium} />}
            editable={isEditing}
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            leftIcon={<MapPin size={18} color={colors.textMedium} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
        </View>
        
        {isEditing && (
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
            <Button
              title="Save Changes"
              icon={<Upload size={18} color="white" />}
              iconPosition="right"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.secondary,
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
  },
  profileRole: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textMedium,
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});