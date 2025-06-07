import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import Card from '@/components/Card';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { mockAttendanceStats } from '@/data/mockData';
import { ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const [timeRange, setTimeRange] = useState('This Week');
  const [showTimeRangeMenu, setShowTimeRangeMenu] = useState(false);
  
  const timeRangeOptions = ['Today', 'This Week', 'This Month', 'This Year'];

  // Mock attendance percentage data
  const weeklyAttendance = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        data: mockAttendanceStats.weeklyAttendance
      }
    ]
  };

  // Monthly attendance data
  const monthlyAttendance = {
    labels: mockAttendanceStats.monthlyAttendance.map(m => m.name),
    datasets: [
      {
        data: mockAttendanceStats.monthlyAttendance.map(m => m.attendance)
      }
    ]
  };

  // Class attendance data for comparison
  const classAttendance = mockAttendanceStats.classAttendance;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Statistics</Text>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={styles.timeRangeSelector} 
            onPress={() => setShowTimeRangeMenu(!showTimeRangeMenu)}
          >
            <Text style={styles.timeRangeText}>{timeRange}</Text>
            <ChevronDown size={16} color={colors.textDark} />
          </TouchableOpacity>
          
          {showTimeRangeMenu && (
            <View style={styles.timeRangeMenu}>
              {timeRangeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timeRangeOption}
                  onPress={() => {
                    setTimeRange(option);
                    setShowTimeRangeMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeOptionText,
                      option === timeRange && styles.selectedTimeRangeOption
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard} variant="elevated">
            <Text style={styles.summaryTitle}>Overall Attendance</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>92%</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.changeIndicator}>
                  <ArrowUpRight size={14} color={colors.success} />
                  <Text style={[styles.changeText, { color: colors.success }]}>+2.5%</Text>
                </View>
                <Text style={styles.statLabel}>vs Last Week</Text>
              </View>
            </View>
          </Card>
          
          <View style={styles.row}>
            <Card style={[styles.miniCard, { marginRight: 8 }]} variant="default">
              <Text style={styles.miniTitle}>Highest</Text>
              <Text style={styles.miniValue}>Class 8C</Text>
              <Text style={styles.miniSubvalue}>95%</Text>
            </Card>
            <Card style={[styles.miniCard, { marginLeft: 8 }]} variant="default">
              <Text style={styles.miniTitle}>Lowest</Text>
              <Text style={styles.miniValue}>Class 7B</Text>
              <Text style={styles.miniSubvalue}>88%</Text>
            </Card>
          </View>
        </View>
        
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <Card style={styles.chartCard} variant="default">
            <LineChart
              data={weeklyAttendance}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(26, 33, 56, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary
                }
              }}
              bezier
              style={styles.chart}
            />
          </Card>
        </View>
        
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Overview</Text>
          <Card style={styles.chartCard} variant="default">
            <BarChart
              data={monthlyAttendance}
              width={screenWidth - 48}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 169, 224, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(26, 33, 56, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                barPercentage: 0.6,
              }}
              style={styles.chart}
            />
          </Card>
        </View>
        
        <View style={styles.classSection}>
          <Text style={styles.sectionTitle}>Class Comparison</Text>
          {classAttendance.map((item, index) => (
            <Card key={index} style={styles.classCard} variant={index === 0 ? 'elevated' : 'default'}>
              <View style={styles.classItem}>
                <View>
                  <Text style={styles.className}>{item.name}</Text>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${item.attendance}%`, backgroundColor: getAttendanceColor(item.attendance) }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.attendancePercentage}>{item.attendance}%</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
  },
  timeRangeContainer: {
    position: 'relative',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    marginRight: 8,
  },
  timeRangeMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    width: 150,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  timeRangeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timeRangeOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
  },
  selectedTimeRangeOption: {
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: colors.textDark,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textMedium,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  changeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    flex: 1,
    padding: 16,
  },
  miniTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 8,
  },
  miniValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: colors.textDark,
  },
  miniSubvalue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  chartSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
  },
  chartCard: {
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  classSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  classCard: {
    marginBottom: 12,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  className: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
  },
  progressContainer: {
    height: 8,
    width: screenWidth - 100,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  attendancePercentage: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: colors.textDark,
  },
});