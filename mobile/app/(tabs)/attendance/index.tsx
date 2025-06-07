import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookOpen, School, Clock, Save as SaveIcon } from 'lucide-react-native';
import { mockClasses, mockSubjects } from '@/data/mockData';

export default function AttendanceScreen() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const handleContinue = () => {
    if (selectedClass && selectedSubject) {
      router.push({
        pathname: '/attendance/take-attendance',
        params: { 
          classId: selectedClass, 
          subjectId: selectedSubject,
          className: mockClasses.find(c => c.id === selectedClass)?.name,
          subjectName: mockSubjects.find(s => s.id === selectedSubject)?.name
        }
      });
    } else {
      Alert.alert(
        "Selection Required",
        "Please select both a class and subject before continuing.",
        [{ text: "OK" }]
      );
    }
  };

  const renderClassItem = ({ item }: { item: typeof mockClasses[0] }) => (
    <TouchableOpacity
      style={[
        styles.classItem,
        selectedClass === item.id && styles.selectedClassItem
      ]}
      onPress={() => setSelectedClass(item.id)}
    >
      <View style={styles.classIconContainer}>
        <School size={24} color={selectedClass === item.id ? colors.white : colors.primary} />
      </View>
      <View style={styles.classInfo}>
        <Text style={[
          styles.className,
          selectedClass === item.id && styles.selectedText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.classCount,
          selectedClass === item.id && styles.selectedSubText
        ]}>
          {item.count} students
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSubjectItem = ({ item }: { item: typeof mockSubjects[0] }) => (
    <TouchableOpacity
      style={[
        styles.subjectItem,
        { backgroundColor: selectedSubject === item.id ? item.color : `${item.color}20` },
      ]}
      onPress={() => setSelectedSubject(item.id)}
    >
      <View style={styles.subjectIconContainer}>
        <BookOpen 
          size={18} 
          color={selectedSubject === item.id ? colors.white : item.color} 
        />
      </View>
      <Text 
        style={[
          styles.subjectName,
          { color: selectedSubject === item.id ? colors.white : colors.textDark }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Attendance</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Class</Text>
          <FlatList
            data={mockClasses}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesList}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subject</Text>
          <FlatList
            data={mockSubjects}
            renderItem={renderSubjectItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.subjectColumns}
            contentContainerStyle={styles.subjectsList}
          />
        </View>
        
        <View style={styles.dateSection}>
          <Card variant="flat" style={styles.dateCard}>
            <View style={styles.dateRow}>
              <Clock size={20} color={colors.primary} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Date & Time</Text>
                <Text style={styles.dateValue}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })} | {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.continueContainer}>
          <Button
            title="Continue to Attendance"
            icon={<SaveIcon size={18} color="white" />}
            iconPosition="right"
            onPress={handleContinue}
            fullWidth
            disabled={!selectedClass || !selectedSubject}
          />
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
  },
  classesList: {
    paddingRight: 16,
  },
  classItem: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedClassItem: {
    backgroundColor: colors.primary,
  },
  classIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textDark,
  },
  classCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textMedium,
  },
  selectedText: {
    color: colors.white,
  },
  selectedSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subjectsList: {
    paddingBottom: 8,
  },
  subjectColumns: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  subjectName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    flex: 1,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateCard: {
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfo: {
    marginLeft: 12,
  },
  dateLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  dateValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.textMedium,
  },
  continueContainer: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
});