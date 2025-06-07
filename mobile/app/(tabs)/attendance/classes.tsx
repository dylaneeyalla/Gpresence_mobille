import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { mockClasses } from '@/data/mockData';
import { ChevronRight, Users, Clock, Calendar, BookOpen } from 'lucide-react-native';
import Card from '@/components/Card';

const ClassesScreen = () => {
  const router = useRouter();

  // Calculate total students across all classes
  const totalStudents = mockClasses.reduce((acc, cls) => acc + cls.count, 0);

  // Calculate overall attendance percentage
  const overallAttendance = Math.round(
    (mockClasses.reduce((acc, cls) => acc + (cls.attendanceRate * cls.count), 0) / totalStudents) * 10
  ) / 10;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Class List</Text>
            <Text style={styles.subtitle}>Manage your classes and attendance</Text>
          </View>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{mockClasses.length}</Text>
                <Text style={styles.overviewLabel}>Total Classes</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{totalStudents}</Text>
                <Text style={styles.overviewLabel}>Total Students</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: getAttendanceColor(overallAttendance) }]}>
                  {overallAttendance}%
                </Text>
                <Text style={styles.overviewLabel}>Avg. Attendance</Text>
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
              onPress={() => router.push('/attendance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 169, 224, 0.15)' }]}>
                <Clock size={20} color={colors.secondary} />
              </View>
              <Text style={styles.actionText}>Take Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/attendance/history')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(40, 199, 111, 0.15)' }]}>
                <Calendar size={20} color={colors.success} />
              </View>
              <Text style={styles.actionText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Classes</Text>
            <Text style={styles.seeAll}>{mockClasses.length} classes</Text>
          </View>
          
          {mockClasses.map((classItem, index) => (
            <TouchableOpacity 
              key={classItem.id}
              onPress={() => router.push(`/attendance/classes/${classItem.id}`)}
            >
              <Card style={styles.classCard}>
                <View style={styles.classInfo}>
                  <View style={styles.classIcon}>
                    <BookOpen size={20} color={colors.primary} />
                  </View>
                  <View style={styles.classDetails}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <View style={styles.classMeta}>
                      <Text style={styles.classMetaText}>
                        <Users size={14} color={colors.textLight} /> {classItem.count} students
                      </Text>
                      <Text style={styles.classMetaText}>
                        <Clock size={14} color={colors.textLight} /> {classItem.time}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.attendanceBadge}>
                    <Text style={[styles.attendanceText, { color: getAttendanceColor(classItem.attendanceRate) }]}>
                      {classItem.attendanceRate}%
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textLight} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textMedium,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  overviewCard: {
    padding: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
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
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  classCard: {
    marginBottom: 12,
    padding: 16,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classMetaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceBadge: {
    marginHorizontal: 12,
  },
  attendanceText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});

export default ClassesScreen;
