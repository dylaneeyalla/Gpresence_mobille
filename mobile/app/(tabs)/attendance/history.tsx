import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SectionList, TextInput, SectionListData } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { mockAttendanceHistory as mockData } from '@/data/mockData';

// Type assertion for the mock data
const mockAttendanceHistory: AttendanceRecord[] = mockData as unknown as AttendanceRecord[];
import { ArrowLeft, Search, Filter, Calendar, ChevronDown, ChevronRight } from 'lucide-react-native';
import Card from '@/components/Card';

interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  subject: string;
  time: string;
  present: number;
  absent: number;
  total: number;
  status: 'present' | 'absent' | 'late';
  absentees: string[];
  lateStudents?: number;
}

interface GroupedHistory {
  [key: string]: AttendanceRecord[];
}

const HistoryScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this_week');

  // Filter attendance history based on search and filters
  const filteredHistory = mockAttendanceHistory.filter((item: AttendanceRecord) => {
    const matchesSearch = item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'present' && item.status === 'present') ||
                         (activeFilter === 'absent' && item.status === 'absent') ||
                         (activeFilter === 'late' && item.status === 'late');
    
    return matchesSearch && matchesFilter;
  });

  // Group by date
  const groupedHistory = filteredHistory.reduce<GroupedHistory>((acc, item) => {
    const date = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(item);
    return acc;
  }, {} as GroupedHistory);

  // Convert to section list format
  const sections = Object.entries(groupedHistory).map(([title, data]) => ({
    title,
    data,
  }));

  // Date range options
  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'last_week', label: 'Last Week' },
    { id: 'this_month', label: 'This Month' },
  ];

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All', color: colors.primary },
    { id: 'present', label: 'Present', color: colors.success },
    { id: 'absent', label: 'Absent', color: colors.error },
    { id: 'late', label: 'Late', color: colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Attendance History</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Filter size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by class or subject..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Range Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRangeContainer}
        >
          {dateRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.dateRangeButton,
                dateRange === range.id && styles.dateRangeButtonActive
              ]}
              onPress={() => setDateRange(range.id)}
            >
              <Text 
                style={[
                  styles.dateRangeText,
                  dateRange === range.id && styles.dateRangeTextActive
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
                { borderColor: filter.color }
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <View 
                style={[
                  styles.filterDot, 
                  { backgroundColor: activeFilter === filter.id ? filter.color : 'transparent' }
                ]} 
              />
              <Text 
                style={[
                  styles.filterText,
                  activeFilter === filter.id && { color: filter.color }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Attendance List */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id + index}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {title.split(',')[0]}, {title.split(',')[1]}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Card style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <View>
                <Text style={styles.className}>{item.className}</Text>
                <Text style={styles.subject}>{item.subject}</Text>
              </View>
              <View style={styles.attendanceBadge}>
                <Text 
                  style={[
                    styles.attendanceStatus,
                    { 
                      color: item.status === 'present' ? colors.success :
                            item.status === 'late' ? colors.warning :
                            colors.error
                    }
                  ]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.attendanceDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{item.time}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Students</Text>
                <Text style={styles.detailValue}>
                  <Text style={{ color: colors.success }}>{item.present}</Text>/
                  <Text>{item.total}</Text>
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rate</Text>
                <Text 
                  style={[
                    styles.detailValue,
                    { 
                      color: (item.present / item.total) >= 0.9 ? colors.success :
                            (item.present / item.total) >= 0.7 ? colors.warning :
                            colors.error
                    }
                  ]}
                >
                  {Math.round((item.present / item.total) * 100)}%
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => router.push(`/(tabs)/attendance/history/${item.id}` as any)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.textLight} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 
                'Try adjusting your search or filter' : 
                'No attendance records for the selected period'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: colors.textDark,
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // Center the title by offsetting the back button
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 4,
  },
  dateRangeContainer: {
    paddingBottom: 8,
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  dateRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  dateRangeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textMedium,
  },
  dateRangeTextActive: {
    color: colors.white,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textMedium,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  attendanceCard: {
    marginBottom: 12,
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 2,
  },
  subject: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.textLight,
  },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(40, 199, 111, 0.1)',
  },
  attendanceStatus: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  attendanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textDark,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  viewDetailsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default HistoryScreen;
