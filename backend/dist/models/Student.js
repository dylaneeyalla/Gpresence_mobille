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
exports.Gender = exports.EducationLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var EducationLevel;
(function (EducationLevel) {
    EducationLevel["PRIMARY"] = "PRIMARY";
    EducationLevel["SECONDARY"] = "SECONDARY";
    EducationLevel["HIGHER"] = "HIGHER";
})(EducationLevel || (exports.EducationLevel = EducationLevel = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "M";
    Gender["FEMALE"] = "F";
})(Gender || (exports.Gender = Gender = {}));
const StudentSchema = new mongoose_1.Schema({
    // Informations de base
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    // Informations spécifiques aux listes d'étudiants
    matricule: {
        type: String,
        required: true,
        trim: true,
        index: true, // Pour des recherches rapides par matricule
    },
    fullName: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: true,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    birthPlace: {
        type: String,
        required: true,
        trim: true,
    },
    isRepeater: {
        type: Boolean,
        default: false,
    },
    academicYear: {
        type: String,
        required: true,
    },
    // Informations pour le niveau d'éducation
    educationLevel: {
        type: String,
        enum: Object.values(EducationLevel),
        required: true,
    },
    specialization: {
        type: String,
        trim: true,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'inscrit',
        trim: true,
    },
    // Relations
    classId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    schoolId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    institutionTypeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'InstitutionType',
        required: true,
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Parent',
    },
    image: {
        type: String,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });
// Créer un index composé sur schoolId et email pour optimiser les recherches
StudentSchema.index({ schoolId: 1, email: 1 }, { unique: true });
// Index sur matricule pour garantir son unicité dans une école
StudentSchema.index({ schoolId: 1, matricule: 1 }, { unique: true });
// Index sur classId pour faciliter les recherches d'étudiants par classe
StudentSchema.index({ classId: 1 });
// Index sur les critères de recherche courants
StudentSchema.index({ academicYear: 1, educationLevel: 1 });
StudentSchema.index({ birthPlace: 1 });
// Index pour la génération de rapports
StudentSchema.index({ gender: 1, educationLevel: 1 });
exports.default = mongoose_1.default.model('Student', StudentSchema);
