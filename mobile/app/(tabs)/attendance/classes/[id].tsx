import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { mockClasses, mockStudents } from '@/data/mockData';
import { ArrowLeft, Users, Clock, Calendar, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react-native';
import Card from '@/components/Card';

const ClassDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Find the class by ID
  const classItem = mockClasses.find(cls => cls.id === id) || mockClasses[0];
  
  // Filter students for this class
  const classStudents = mockStudents.filter(student => 
    student.classId === id
  );

  // Calculate attendance stats
  const presentCount = classStudents.filter(s => s.status === 'present').length;
  const absentCount = classStudents.filter(s => s.status === 'absent').length;
  const lateCount = classStudents.filter(s => s.status === 'late').length;
  const attendanceRate = Math.round((presentCount / classStudents.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{classItem.name}</Text>
            <Text style={styles.headerSubtitle}>
              {classStudents.length} students • {classItem.time}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(40, 199, 111, 0.1)' }]}>
                  <CheckCircle size={20} color={colors.success} />
                </View>
                <Text style={styles.statValue}>{presentCount}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(234, 84, 85, 0.1)' }]}>
                  <XCircle size={20} color={colors.error} />
                </View>
                <Text style={styles.statValue}>{absentCount}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 159, 67, 0.1)' }]}>
                  <AlertCircle size={20} color={colors.warning} />
                </View>
                <Text style={styles.statValue}>{lateCount}</Text>
                <Text style={styles.statLabel}>Late</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 51, 102, 0.1)' }]}>
                  <Users size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{attendanceRate}%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/attendance/classes/${id}/take-attendance`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 169, 224, 0.1)' }]}>
                <Clock size={20} color={colors.secondary} />
              </View>
              <Text style={styles.actionText}>Take Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/attendance/classes/${id}/reports`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 51, 102, 0.1)' }]}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Students</Text>
            <TouchableOpacity onPress={() => router.push(`/attendance/classes/${id}/students`)}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.studentList}
          >
            {classStudents.slice(0, 5).map(student => (
              <TouchableOpacity 
                key={student.id}
                style={styles.studentCard}
                onPress={() => router.push(`/attendance/classes/${id}/students/${student.id}`)}
              >
                <View style={styles.studentAvatarContainer}>
                  {student.avatar ? (
                    <Image 
                      source={{ uri: student.avatar }} 
                      style={styles.studentAvatar} 
                    />
                  ) : (
                    <View style={[styles.studentAvatar, styles.studentAvatarPlaceholder]}>
                      <Text style={styles.studentInitial}>
                        {student.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View 
                    style={[
                      styles.statusDot,
                      { 
                        backgroundColor: 
                          student.status === 'present' ? colors.success :
                          student.status === 'late' ? colors.warning :
                          colors.error
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.studentName} numberOfLines={1}>
                  {student.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push(`/attendance/classes/${id}/activity`)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.activityCard}>
            {classItem.recentActivity?.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  {activity.type === 'attendance' ? (
                    <CheckCircle size={18} color={colors.success} />
                  ) : activity.type === 'assignment' ? (
                    <Calendar size={18} color={colors.secondary} />
                  ) : (
                    <Users size={18} color={colors.accent} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityTime}>
                    {activity.time}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textLight} />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: colors.textDark,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  seeAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    textAlign: 'center',
  },
  studentList: {
    marginTop: 8,
  },
  studentCard: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  studentAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
  },
  studentAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
  },
  studentInitial: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  studentName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 4,
  },
  activityTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
});

export default ClassDetailScreen;
