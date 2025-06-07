export const mockUsers = [
  {
    id: '1',
    username: 'teacher1',
    password: 'password123',
    name: 'John Smith',
    role: 'teacher',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    email: 'john.smith@school.edu'
  },
  {
    id: '2',
    username: 'admin1',
    password: 'admin123',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    email: 'sarah.johnson@school.edu'
  }
];

export const mockClasses = [
  { id: '1', name: 'Class 6A', count: 32 },
  { id: '2', name: 'Class 7B', count: 28 },
  { id: '3', name: 'Class 8C', count: 30 },
  { id: '4', name: 'Class 9A', count: 25 },
  { id: '5', name: 'Class 10D', count: 27 },
  { id: '6', name: 'Class 11F', count: 24 },
];

export const mockSubjects = [
  { id: '1', name: 'Mathematics', color: '#FF6B6B' },
  { id: '2', name: 'Science', color: '#4ECDC4' },
  { id: '3', name: 'History', color: '#FFD166' },
  { id: '4', name: 'English', color: '#6B5CA5' },
  { id: '5', name: 'Physics', color: '#118AB2' },
  { id: '6', name: 'Chemistry', color: '#073B4C' },
  { id: '7', name: 'Biology', color: '#06D6A0' },
  { id: '8', name: 'Computer Science', color: '#EF476F' },
];

export const mockStudents = [
  { id: '1', name: 'Alex Johnson', rollNumber: '001', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '2', name: 'Maria Garcia', rollNumber: '002', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '3', name: 'James Wilson', rollNumber: '003', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '4', name: 'Sophia Lee', rollNumber: '004', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '5', name: 'Daniel Brown', rollNumber: '005', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '6', name: 'Emma Davis', rollNumber: '006', avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '7', name: 'Miguel Sanchez', rollNumber: '007', avatar: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '8', name: 'Aisha Khan', rollNumber: '008', avatar: 'https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '9', name: 'Ryan Patel', rollNumber: '009', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '10', name: 'Olivia Kim', rollNumber: '010', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '11', name: 'Ethan Chen', rollNumber: '011', avatar: 'https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: '12', name: 'Zoe Wong', rollNumber: '012', avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
];

export const mockAttendanceStats = {
  weeklyAttendance: [95, 92, 88, 96, 90],
  monthlyAttendance: [
    { name: 'Jan', attendance: 95 },
    { name: 'Feb', attendance: 92 },
    { name: 'Mar', attendance: 88 },
    { name: 'Apr', attendance: 91 },
    { name: 'May', attendance: 89 },
    { name: 'Jun', attendance: 94 },
  ],
  classAttendance: [
    { name: 'Class 6A', attendance: 92 },
    { name: 'Class 7B', attendance: 88 },
    { name: 'Class 8C', attendance: 95 },
    { name: 'Class 9A', attendance: 90 },
    { name: 'Class 10D', attendance: 93 },
  ],
};

export const mockAttendanceHistory = [
  {
    id: '1',
    date: '2023-05-15',
    className: 'Class 6A',
    subject: 'Mathematics',
    time: '09:00 - 10:00',
    present: 28,
    absent: 4,
    total: 32,
    status: 'present',
    absentees: ['Emma Davis', 'Miguel Sanchez', 'Aisha Khan', 'Ryan Patel']
  },
  {
    id: '2',
    date: '2023-05-15',
    className: 'Class 7B',
    subject: 'Science',
    time: '11:00 - 12:00',
    present: 24,
    absent: 4,
    total: 28,
    status: 'present',
    absentees: ['James Wilson', 'Sophia Lee', 'Daniel Brown', 'Olivia Kim']
  },
  {
    id: '3',
    date: '2023-05-14',
    className: 'Class 8C',
    subject: 'History',
    time: '10:00 - 11:00',
    present: 25,
    absent: 5,
    total: 30,
    status: 'late',
    lateStudents: 3,
    absentees: ['Alex Johnson', 'Maria Garcia', 'Ethan Chen', 'Zoe Wong']
  },
  {
    id: '4',
    date: '2023-05-14',
    className: 'Class 9A',
    subject: 'English',
    time: '13:00 - 14:00',
    present: 20,
    absent: 5,
    total: 25,
    status: 'absent',
    absentees: ['Emma Davis', 'Miguel Sanchez', 'Aisha Khan', 'Ryan Patel', 'Olivia Kim']
  },
  {
    id: '5',
    date: '2023-05-13',
    className: 'Class 10D',
    subject: 'Physics',
    time: '14:00 - 15:00',
    present: 25,
    absent: 2,
    total: 27,
    status: 'present',
    absentees: ['James Wilson', 'Sophia Lee']
  },
  {
    id: '6',
    date: '2023-05-13',
    className: 'Class 6A',
    subject: 'Chemistry',
    time: '15:00 - 16:00',
    present: 30,
    absent: 2,
    total: 32,
    status: 'present',
    absentees: ['Daniel Brown', 'Emma Davis']
  },
  {
    id: '7',
    date: '2023-05-12',
    className: 'Class 7B',
    subject: 'Biology',
    time: '09:00 - 10:00',
    present: 26,
    absent: 2,
    total: 28,
    status: 'present',
    absentees: ['Miguel Sanchez', 'Aisha Khan']
  }
];

export const mockNotifications = [
  { 
    id: '1', 
    title: 'Low Attendance Alert', 
    message: 'Class 7B has below 85% attendance this week', 
    date: '2023-05-15T09:30:00', 
    read: false,
    type: 'alert'
  },
  { 
    id: '2', 
    title: 'New Student Added', 
    message: 'Emma Wilson has been added to Class 9A', 
    date: '2023-05-14T14:45:00', 
    read: true,
    type: 'info'
  },
  { 
    id: '3', 
    title: 'Attendance Report Ready', 
    message: 'Monthly attendance report for April is ready to view', 
    date: '2023-05-10T11:20:00', 
    read: true,
    type: 'info'
  },
  { 
    id: '4', 
    title: 'System Maintenance', 
    message: 'The system will be down for maintenance on Sunday from 2-4 AM', 
    date: '2023-05-08T16:00:00', 
    read: false,
    type: 'system'
  },
  { 
    id: '5', 
    title: 'Consecutive Absence', 
    message: 'Student James Wilson has been absent for 3 consecutive days', 
    date: '2023-05-05T10:15:00', 
    read: true,
    type: 'alert'
  },
];

// Historique des présences