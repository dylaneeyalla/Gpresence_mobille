import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import Button from '@/components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Check, User, CircleAlert as AlertCircle, Save as SaveIcon } from 'lucide-react-native';
import { mockStudents } from '@/data/mockData';
import Card from '@/components/Card';

export default function TakeAttendanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { className, subjectName } = params;
  
  const [attendanceData, setAttendanceData] = useState<{
    id: string;
    name: string;
    isPresent: boolean;
    rollNumber: string;
    avatar: string;
  }[]>([]);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize attendance data with all students marked present by default
    setAttendanceData(
      mockStudents.map(student => ({
        ...student,
        isPresent: true
      }))
    );
  }, []);

  const toggleAttendance = (id: string) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === id 
          ? { ...student, isPresent: !student.isPresent } 
          : student
      )
    );
  };

  const presentCount = attendanceData.filter(student => student.isPresent).length;
  const absentCount = attendanceData.length - presentCount;

  const saveAttendance = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      Alert.alert(
        "Attendance Saved",
        `Successfully saved attendance for ${className} - ${subjectName}`,
        [
          {
            text: "OK",
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    }, 1500);
  };

  const renderStudentItem = ({ item }: { item: typeof attendanceData[0] }) => (
    <Card style={styles.studentCard} variant="flat">
      <TouchableOpacity 
        style={styles.studentItem}
        onPress={() => toggleAttendance(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.studentInfo}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.studentAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={20} color={colors.textMedium} />
            </View>
          )}
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.attendanceStatus,
            { backgroundColor: item.isPresent ? 'rgba(40, 199, 111, 0.1)' : 'rgba(234, 84, 85, 0.1)' }
          ]}
          onPress={() => toggleAttendance(item.id)}
        >
          {item.isPresent ? (
            <>
              <View style={styles.statusIcon}>
                <Check size={16} color={colors.success} />
              </View>
              <Text style={[styles.statusText, { color: colors.success }]}>Present</Text>
            </>
          ) : (
            <>
              <View style={styles.statusIcon}>
                <AlertCircle size={16} color={colors.error} />
              </View>
              <Text style={[styles.statusText, { color: colors.error }]}>Absent</Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.classInfo}>
        <Text style={styles.classTitle}>{className}</Text>
        <View style={styles.subjectChip}>
          <Text style={styles.subjectText}>{subjectName}</Text>
        </View>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{attendanceData.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.error }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Student List</Text>
      
      <FlatList
        data={attendanceData}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.studentList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.actionContainer}>
        <Button
          title="Save Attendance"
          icon={<SaveIcon size={18} color="white" />}
          iconPosition="right"
          onPress={saveAttendance}
          loading={saving}
          fullWidth
        />
      </View>
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
  placeholder: {
    width: 40,
  },
  classInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
  },
  subjectChip: {
    backgroundColor: 'rgba(0, 169, 224, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  subjectText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.secondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: colors.textDark,
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  studentList: {
    padding: 16,
    paddingTop: 8,
  },
  studentCard: {
    marginBottom: 12,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  studentRoll: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});