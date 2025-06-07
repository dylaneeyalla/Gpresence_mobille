import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import { CircleUser as UserCircle, Mail, Users, CalendarClock, Clock, BookOpen, ChevronRight, TrendingUp } from 'lucide-react-native';
import { mockAttendanceHistory, mockClasses } from '@/data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const windowWidth = Dimensions.get('window').width;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Recent attendance data
  const recentAttendance = mockAttendanceHistory.slice(0, 3);

  // Calculate attendance stats
  const totalStudents = mockClasses.reduce((acc, cls) => acc + cls.count, 0);
  const presentToday = totalStudents - 8; // Mock data - 8 absent students
  const attendanceRate = Math.round((presentToday / totalStudents) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings/profile')}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <UserCircle size={42} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.todayAttendance}>
              <View style={styles.attendanceTextContainer}>
                <Text style={styles.attendanceTitle}>Today's Attendance</Text>
                <Text style={styles.attendanceRate}>{attendanceRate}%</Text>
                <Text style={styles.attendanceSubtext}>
                  {presentToday} present / {totalStudents} students
                </Text>
              </View>
              <View style={styles.attendanceGraphic}>
                <View style={styles.circleContainer}>
                  <View style={styles.circleBackground} />
                  <View 
                    style={[
                      styles.circleFill, 
                      { width: `${attendanceRate}%`, backgroundColor: getAttendanceColor(attendanceRate) }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/attendance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 169, 224, 0.15)' }]}>
                <Users size={22} color={colors.secondary} />
              </View>
              <Text style={styles.actionText}>Take Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/stats')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 51, 102, 0.15)' }]}>
                <TrendingUp size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>View Statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/attendance/classes')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 199, 44, 0.15)' }]}>
                <BookOpen size={22} color={colors.accent} />
              </View>
              <Text style={styles.actionText}>Class List</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/attendance/history')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(40, 199, 111, 0.15)' }]}>
                <CalendarClock size={22} color={colors.success} />
              </View>
              <Text style={styles.actionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/attendance/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentAttendance.map((item, index) => (
            <Card 
              key={index} 
              style={styles.activityCard}
              variant={index === 0 ? 'elevated' : 'default'}
            >
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{item.className} - {item.subject}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.activityStats}>
                  <Text style={styles.statsPrimary}>{item.present}/{item.total}</Text>
                  <Text style={styles.statsSecondary}>
                    {Math.round((item.present / item.total) * 100)}%
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textLight} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get color based on attendance rate
function getAttendanceColor(rate: number): string {
  if (rate >= 90) return colors.success;
  if (rate >= 75) return colors.secondary;
  if (rate >= 60) return colors.warning;
  return colors.error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textMedium,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statsCard: {
    padding: 16,
  },
  todayAttendance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceTextContainer: {
    flex: 1,
  },
  attendanceTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 4,
  },
  attendanceRate: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: colors.textDark,
  },
  attendanceSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
  },
  attendanceGraphic: {
    flex: 1,
    alignItems: 'flex-end',
  },
  circleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  circleBackground: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
  },
  circleFill: {
    position: 'absolute',
    height: 72,
    borderRadius: 36,
    left: 4,
  },
  quickActions: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  recentActivity: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.secondary,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  activityDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
  },
  activityStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  statsPrimary: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textDark,
  },
  statsSecondary: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.success,
  },
});