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
const ClassroomAssignmentSchema = new mongoose_1.Schema({
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
    subjectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    schoolId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    schedule: [
        {
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            startTime: String,
            endTime: String,
        },
    ],
}, { timestamps: true });
// Index pour optimiser les recherches d'affectations par enseignant
ClassroomAssignmentSchema.index({ teacherId: 1 });
// Index pour optimiser les recherches d'affectations par classe
ClassroomAssignmentSchema.index({ classroomId: 1 });
// Index pour optimiser les recherches d'affectations par matière
ClassroomAssignmentSchema.index({ subjectId: 1 });
// Index composé pour s'assurer qu'une même combinaison classe-enseignant-matière
// n'existe qu'une seule fois dans une école
ClassroomAssignmentSchema.index({ classroomId: 1, teacherId: 1, subjectId: 1, schoolId: 1 }, { unique: true });
exports.default = mongoose_1.default.model('ClassroomAssignment', ClassroomAssignmentSchema);
