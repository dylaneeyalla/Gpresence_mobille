import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { User, ChevronRight, Bell, Shield, Moon, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import Card from '@/components/Card';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  
  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push('/settings/profile')}
        >
          <Card variant="elevated">
            <View style={styles.profileContent}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={30} color={colors.primary} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Teacher'}</Text>
              </View>
              <ChevronRight size={20} color={colors.textMedium} />
            </View>
          </Card>
        </TouchableOpacity>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <Card variant="flat">
            <View style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Bell size={20} color={colors.secondary} />
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive alerts and notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={notifications ? colors.primary : colors.white}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(255, 171, 0, 0.1)' }]}>
                <Moon size={20} color="#FFAB00" />
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch to dark theme</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={darkMode ? colors.primary : colors.white}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          
          <Card variant="flat">
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(0, 51, 102, 0.1)' }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <View style={styles.menuDetails}>
                <Text style={styles.menuTitle}>Privacy & Security</Text>
              </View>
              <ChevronRight size={20} color={colors.textMedium} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(40, 199, 111, 0.1)' }]}>
                <HelpCircle size={20} color={colors.success} />
              </View>
              <View style={styles.menuDetails}>
                <Text style={styles.menuTitle}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color={colors.textMedium} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>ClassCheck v1.0.0</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
  },
  profileCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  userRole: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textMedium,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: colors.textDark,
  },
  settingDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.textMedium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuDetails: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: colors.textDark,
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(234, 84, 85, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.error,
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
});