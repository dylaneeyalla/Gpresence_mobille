"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AttendanceSchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
    },
    classroomAssignmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ClassroomAssignment',
        required: true,
    },
    subjectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    classroomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    schoolId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    records: [
        {
            studentId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Student',
                required: true,
            },
            status: {
                type: String,
                enum: ['present', 'absent', 'late'],
                required: true,
            },
            remarks: {
                type: String,
            },
        },
    ],
}, { timestamps: true });
// Index pour rechercher les présences par date
AttendanceSchema.index({ date: 1 });
// Index pour rechercher les présences par classe
AttendanceSchema.index({ classroomId: 1 });
// Index pour rechercher les présences par enseignant
AttendanceSchema.index({ teacherId: 1 });
// Index composé pour s'assurer qu'il n'y a qu'un seul enregistrement par jour,
// par matière et par classe
AttendanceSchema.index({ date: 1, classroomAssignmentId: 1 }, { unique: true });
// Index pour accélérer les recherches par établissement
AttendanceSchema.index({ schoolId: 1 });
exports.default = mongoose_1.default.model('Attendance', AttendanceSchema);
