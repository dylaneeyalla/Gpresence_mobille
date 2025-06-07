"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherSchoolAssignment = exports.Attendance = exports.ClassroomAssignment = exports.Subject = exports.Classroom = exports.Student = exports.Teacher = exports.School = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const School_1 = __importDefault(require("./School"));
exports.School = School_1.default;
const Teacher_1 = __importDefault(require("./Teacher"));
exports.Teacher = Teacher_1.default;
const Student_1 = __importDefault(require("./Student"));
exports.Student = Student_1.default;
const Classroom_1 = __importDefault(require("./Classroom"));
exports.Classroom = Classroom_1.default;
const Subject_1 = __importDefault(require("./Subject"));
exports.Subject = Subject_1.default;
const ClassroomAssignment_1 = __importDefault(require("./ClassroomAssignment"));
exports.ClassroomAssignment = ClassroomAssignment_1.default;
const Attendance_1 = __importDefault(require("./Attendance"));
exports.Attendance = Attendance_1.default;
const TeacherSchoolAssignment_1 = __importDefault(require("./TeacherSchoolAssignment"));
exports.TeacherSchoolAssignment = TeacherSchoolAssignment_1.default;
// Export default pour faciliter l'importation globale
exports.default = {
    User: User_1.default,
    School: School_1.default,
    Teacher: Teacher_1.default,
    Student: Student_1.default,
    Classroom: Classroom_1.default,
    Subject: Subject_1.default,
    ClassroomAssignment: ClassroomAssignment_1.default,
    Attendance: Attendance_1.default,
    TeacherSchoolAssignment: TeacherSchoolAssignment_1.default,
};
