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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStatsByLevel = exports.exportStudentsByClass = exports.importStudentsFromFile = exports.upload = exports.getStudentsBySchool = exports.getStudentsByClass = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Student_1 = __importStar(require("../models/Student"));
const Classroom_1 = __importDefault(require("../models/Classroom"));
const School_1 = __importDefault(require("../models/School"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
const InstitutionType_1 = __importDefault(require("../models/InstitutionType"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const csv_parser_1 = __importDefault(require("csv-parser"));
const XLSX = __importStar(require("xlsx"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Récupère tous les étudiants
 * - SuperAdmin : Tous les étudiants
 * - Admin : Uniquement les étudiants de son école
 * - Teacher : Étudiants des classes qu'il enseigne
 */
const getAllStudents = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const { classId } = req.query;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Admin: étudiants de son école
            filter.schoolId = schoolId;
        }
        else if (role === 'teacher' && userId) {
            // Teacher: étudiants des classes qu'il enseigne
            if (classId) {
                // Si une classe spécifique est demandée, vérifier que l'enseignant y est assigné
                const isAssigned = await ClassroomAssignment_1.default.exists({
                    classroomId: classId,
                    teacherId: userId
                });
                if (!isAssigned) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cette classe'
                    });
                }
                filter.classId = classId;
            }
            else {
                // Sinon, récupérer toutes les classes assignées à l'enseignant
                const assignedClasses = await ClassroomAssignment_1.default.find({ teacherId: userId })
                    .distinct('classroomId');
                filter.classId = { $in: assignedClasses };
            }
        }
        else if (role === 'student' && userId) {
            // Un étudiant ne peut voir que son propre profil
            const student = await Student_1.default.findOne({ userId });
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil étudiant non trouvé'
                });
            }
            filter._id = student._id;
        }
        // Récupérer les étudiants avec filtrage
        const students = await Student_1.default.find(filter)
            .select('firstName lastName email phone address classId schoolId image')
            .populate('classId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des étudiants',
            error: error.message
        });
    }
};
exports.getAllStudents = getAllStudents;
/**
 * Récupère un étudiant par son ID
 */
const getStudentById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const studentId = req.params.id;
        // Récupérer l'étudiant
        const student = await Student_1.default.findById(studentId)
            .populate('classId', 'name')
            .populate('schoolId', 'name');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'student') {
            // Un étudiant ne peut accéder qu'à son propre profil
            const currentStudent = await Student_1.default.findOne({ userId });
            // Type casting explicite pour résoudre l'erreur d'unknown sur _id
            if (!currentStudent || currentStudent._id.toString() !== studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez accéder qu\'à votre propre profil'
                });
            }
        }
        else if (role === 'teacher') {
            // Un enseignant ne peut accéder qu'aux étudiants des classes qu'il enseigne
            // ou des écoles où il enseigne
            const isInSchool = await TeacherSchoolAssignment_1.default.exists({
                teacherId: userId,
                schoolId: student.schoolId
            });
            if (!isInSchool) {
                // Vérifier si l'enseignant enseigne dans la classe de l'étudiant
                const isTeachingClass = await ClassroomAssignment_1.default.exists({
                    teacherId: userId,
                    classroomId: student.classId
                });
                if (!isTeachingClass) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cet étudiant'
                    });
                }
            }
        }
        else if (role === 'admin' && schoolId) {
            // Un admin ne peut accéder qu'aux étudiants de son école
            if (student.schoolId.toString() !== schoolId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet étudiant n\'appartient pas à votre établissement'
                });
            }
        }
        return res.status(200).json({
            success: true,
            data: student
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'\u00e9tudiant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'\u00e9tudiant',
            error: error.message
        });
    }
};
exports.getStudentById = getStudentById;
/**
 * Crée un nouvel étudiant
 * - SuperAdmin : Peut créer un étudiant pour n'importe quelle école/classe
 * - Admin : Uniquement pour son école
 */
const createStudent = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const { firstName, lastName, email, phone, address, classId, schoolId, image, userId, 
        // Nouveaux champs pour le modèle étudiant étendu
        matricule, gender, birthDate, birthPlace, isRepeater, academicYear, educationLevel, specialization, status } = req.body;
        // Vérifier que tous les champs obligatoires sont présents
        if (!firstName || !lastName || !classId || !schoolId) {
            return res.status(400).json({
                success: false,
                message: 'Les champs prénom, nom, classe et école sont obligatoires'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que l'admin crée un étudiant pour son école
            if (schoolId !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez créer des étudiants que pour votre établissement'
                });
            }
        }
        // Vérifier si l'email existe déjà dans l'école spécifiée
        const existingStudent = await Student_1.default.findOne({ email, schoolId });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Un étudiant avec cet email existe déjà dans cet établissement'
            });
        }
        // Vérifier si le matricule existe déjà s'il est fourni
        if (matricule) {
            const existingMatricule = await Student_1.default.findOne({ matricule, schoolId });
            if (existingMatricule) {
                return res.status(400).json({
                    success: false,
                    message: 'Un étudiant avec ce matricule existe déjà dans cet établissement'
                });
            }
        }
        // Vérifier si la classe existe et appartient à l'école
        const classroom = await Classroom_1.default.findById(classId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        if (classroom.schoolId.toString() !== schoolId) {
            return res.status(400).json({
                success: false,
                message: 'La classe spécifiée n\'appartient pas à l\'établissement'
            });
        }
        // Récupérer l'école et son type d'établissement
        const school = await School_1.default.findById(schoolId).populate('institutionTypeId');
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        // Déterminer les valeurs par défaut pour certains champs
        // Si educationLevel n'est pas fourni, utiliser le premier niveau par défaut de l'école
        const defaultEducationLevel = educationLevel ||
            (school.defaultEducationLevels && school.defaultEducationLevels.length > 0 ?
                school.defaultEducationLevels[0] : 'SECONDARY');
        // Année académique courante si non fournie
        const currentYear = new Date().getFullYear();
        const defaultAcademicYear = academicYear || `${currentYear}-${currentYear + 1}`;
        // Générer un matricule si non fourni
        let generatedMatricule = matricule || '';
        if (!matricule && school.institutionTypeId) {
            // Récupérer le type d'établissement complet
            const institutionType = await InstitutionType_1.default.findById(school.institutionTypeId);
            if (institutionType) {
                generatedMatricule =
                    `${institutionType.code}${currentYear.toString().substr(2, 2)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            }
            else {
                // Utiliser un code par défaut si le type d'établissement n'est pas trouvé
                generatedMatricule =
                    `STD${currentYear.toString().substr(2, 2)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            }
        }
        // Créer l'étudiant avec les informations complètes
        const student = await Student_1.default.create({
            firstName,
            lastName,
            email,
            phone,
            address,
            matricule: generatedMatricule,
            fullName: `${lastName} ${firstName}`,
            gender: gender || 'M',
            birthDate: birthDate || new Date(),
            birthPlace: birthPlace || '',
            isRepeater: isRepeater || false,
            academicYear: defaultAcademicYear,
            educationLevel: defaultEducationLevel,
            specialization: specialization || extractSpecialization(classroom.name),
            status: status || 'inscrit',
            registrationDate: new Date(),
            classId,
            schoolId,
            institutionTypeId: school.institutionTypeId ? school.institutionTypeId._id : schoolId, // Associer le type d'établissement de l'école
            image,
            userId
        });
        return res.status(201).json({
            success: true,
            data: student,
            message: 'Étudiant créé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'\u00e9tudiant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'\u00e9tudiant',
            error: error.message
        });
    }
};
exports.createStudent = createStudent;
/**
 * Met à jour un étudiant existant
 * - SuperAdmin : Peut modifier n'importe quel étudiant
 * - Admin : Uniquement les étudiants de son école
 * - Student : Uniquement son profil (champs limités)
 */
const updateStudent = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const studentId = req.params.id;
        const { firstName, lastName, email, phone, address, classId, image } = req.body;
        // Récupérer l'étudiant
        const student = await Student_1.default.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'student') {
            // Un étudiant ne peut modifier que son propre profil et seulement certains champs
            const currentStudent = await Student_1.default.findOne({ userId });
            // Type casting explicite pour résoudre l'erreur d'unknown sur _id
            if (!currentStudent || currentStudent._id.toString() !== studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez modifier que votre propre profil'
                });
            }
            // Un étudiant ne peut pas changer sa classe ou son école
            if (classId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez pas changer votre classe'
                });
            }
        }
        else if (role === 'admin') {
            // Un admin ne peut modifier que les étudiants de son école
            if (student.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet étudiant n\'appartient pas à votre établissement'
                });
            }
            // Si l'admin change la classe, vérifier qu'elle appartient à son école
            if (classId && classId !== student.classId.toString()) {
                const classroom = await Classroom_1.default.findById(classId);
                if (!classroom) {
                    return res.status(404).json({
                        success: false,
                        message: 'Classe non trouvée'
                    });
                }
                if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: 'La classe n\'appartient pas à votre établissement'
                    });
                }
            }
        }
        // Vérifier si l'email n'est pas déjà utilisé par un autre étudiant
        if (email && email !== student.email) {
            const existingStudent = await Student_1.default.findOne({ email, _id: { $ne: studentId } });
            if (existingStudent) {
                return res.status(409).json({
                    success: false,
                    message: 'Un autre étudiant avec cet email existe déjà'
                });
            }
        }
        // Mise à jour des champs
        const updateData = {};
        if (firstName)
            updateData.firstName = firstName;
        if (lastName)
            updateData.lastName = lastName;
        if (email)
            updateData.email = email;
        if (phone)
            updateData.phone = phone;
        if (address)
            updateData.address = address;
        if (image)
            updateData.image = image;
        if (classId && (role === 'admin' || role === 'superAdmin'))
            updateData.classId = classId;
        const updatedStudent = await Student_1.default.findByIdAndUpdate(studentId, updateData, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedStudent,
            message: 'Étudiant mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'\u00e9tudiant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'\u00e9tudiant',
            error: error.message
        });
    }
};
exports.updateStudent = updateStudent;
/**
 * Supprime un étudiant
 * - SuperAdmin : Peut supprimer n'importe quel étudiant
 * - Admin : Uniquement les étudiants de son école
 */
const deleteStudent = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const studentId = req.params.id;
        // Vérifier si l'étudiant existe
        const student = await Student_1.default.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (student.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet étudiant n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier s'il y a des enregistrements de présence pour cet étudiant
        const attendanceRecords = await mongoose_1.default.model('Attendance').countDocuments({
            'records.studentId': studentId
        });
        if (attendanceRecords > 0) {
            // Option 1: Empêcher la suppression
            // return res.status(400).json({
            //   success: false,
            //   message: 'Impossible de supprimer cet étudiant car il a des enregistrements de présence'
            // });
            // Option 2: Permettre la suppression mais anonymiser les enregistrements de présence
            await mongoose_1.default.model('Attendance').updateMany({ 'records.studentId': studentId }, { $set: { 'records.$.isAnonymized': true } });
        }
        // Supprimer l'étudiant
        await Student_1.default.findByIdAndDelete(studentId);
        return res.status(200).json({
            success: true,
            message: 'Étudiant supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'\u00e9tudiant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'\u00e9tudiant',
            error: error.message
        });
    }
};
exports.deleteStudent = deleteStudent;
/**
 * Récupère tous les étudiants d'une classe spécifique
 */
const getStudentsByClass = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const classId = req.params.classId;
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que la classe appartient à l'école de l'admin
            if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            // Vérifier que l'enseignant enseigne dans cette classe
            const isTeachingClass = await ClassroomAssignment_1.default.exists({
                teacherId: userId,
                classroomId: classId
            });
            if (!isTeachingClass) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'enseignez pas dans cette classe'
                });
            }
        }
        // Récupérer les étudiants de la classe
        const students = await Student_1.default.find({ classId })
            .select('firstName lastName email phone image')
            .sort({ lastName: 1, firstName: 1 });
        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des étudiants de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des étudiants de la classe',
            error: error.message
        });
    }
};
exports.getStudentsByClass = getStudentsByClass;
/**
 * Récupère tous les étudiants d'une école spécifique
 */
const getStudentsBySchool = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const schoolId = req.params.schoolId;
        // Vérifier si l'école existe
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que c'est l'école de l'admin
            if (schoolId !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cette école'
                });
            }
        }
        else if (role === 'teacher') {
            // Vérifier que l'enseignant est affecté à cette école
            const isAssignedToSchool = await TeacherSchoolAssignment_1.default.exists({
                teacherId: userId,
                schoolId
            });
            if (!isAssignedToSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'enseignez pas dans cette école'
                });
            }
        }
        // Récupérer les étudiants de l'école
        const students = await Student_1.default.find({ schoolId })
            .select('firstName lastName email classId')
            .populate('classId', 'name')
            .sort({ lastName: 1, firstName: 1 });
        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des étudiants de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des étudiants de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.getStudentsBySchool = getStudentsBySchool;
/**
 * Configure multer pour l'upload de fichiers
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Créer le dossier uploads s'il n'existe pas
        const uploadDir = path_1.default.join(__dirname, '../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Vérifier que le fichier est un CSV ou Excel
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
            cb(null, true);
        }
        else {
            cb(new Error('Seuls les fichiers CSV et Excel sont acceptés'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // Limite à 10 MB
});
/**
 * Calcule l'âge à partir de la date de naissance
 */
const calculateAge = (birthDate) => {
    return (0, date_fns_1.differenceInYears)(new Date(), birthDate);
};
/**
 * Convertit une chaîne de date au format français en objet Date
 */
const parseFrenchDate = (dateStr) => {
    // Gérer différents formats de date possibles
    try {
        // Format JJ/MM/AAAA
        if (dateStr.includes('/')) {
            return (0, date_fns_1.parse)(dateStr, 'dd/MM/yyyy', new Date());
        }
        // Format avec tirets JJ-MM-AAAA
        else if (dateStr.includes('-')) {
            return (0, date_fns_1.parse)(dateStr, 'dd-MM-yyyy', new Date());
        }
        // Autres formats possibles...
        else {
            throw new Error(`Format de date non reconnu: ${dateStr}`);
        }
    }
    catch (error) {
        console.error(`Erreur de conversion de date: ${dateStr}`, error);
        throw new Error(`Format de date non valide: ${dateStr}`);
    }
};
/**
 * Déterminer le niveau d'éducation en fonction de la classe
 */
const determineEducationLevel = (className) => {
    className = className.toLowerCase();
    // Classes du secondaire (patterns comme '2e A', 'FP1', etc.)
    if (/^\d+(er|e|ème)/i.test(className) || /^[fs]p\d+/i.test(className) || /term/i.test(className)) {
        return Student_1.EducationLevel.SECONDARY;
    }
    // Classes du supérieur (patterns comme 'L1', 'M2', 'BTS', 'DUT', etc.)
    else if (/^[lm]\d+/i.test(className) || /bts|dut|licence|master|doctorat/i.test(className)) {
        return Student_1.EducationLevel.HIGHER;
    }
    // Par défaut, considérer comme secondaire
    else {
        return Student_1.EducationLevel.SECONDARY;
    }
};
/**
 * Extraire la spécialisation du nom de la classe (pour le niveau supérieur)
 */
const extractSpecialization = (className) => {
    // Pour les classes du secondaire avec spécialisation
    const match = className.match(/[A-Z]+\s([A-Z]+)$/);
    if (match && match[1]) {
        return match[1]; // Extraire la partie après le dernier espace (ex: 'ELEQ' dans '2e A ELEQ')
    }
    return undefined;
};
/**
 * Importe des étudiants à partir d'un fichier CSV ou Excel
 */
const importStudentsFromFile = async (req, res) => {
    try {
        const { role, schoolId } = req.user;
        // Vérification du rôle (seuls les admins et superadmins peuvent importer des étudiants)
        if (role !== 'admin' && role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas les droits pour importer des étudiants'
            });
        }
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }
        // Vérifier le format du fichier
        const filePath = req.file.path;
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        // Paramètres supplémentaires
        // Récupération des paramètres nécessaires
        const classId = req.body.classId;
        const academicYear = req.body.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classId);
        if (!classroom) {
            // Supprimer le fichier téléchargé
            fs_1.default.unlinkSync(filePath);
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier que la classe appartient à l'école de l'admin
        if (role === 'admin' && classroom.schoolId.toString() !== schoolId?.toString()) {
            // Supprimer le fichier téléchargé
            fs_1.default.unlinkSync(filePath);
            return res.status(403).json({
                success: false,
                message: 'Cette classe n\'appartient pas à votre établissement'
            });
        }
        let students = [];
        let errors = [];
        // Traiter le fichier selon son type
        if (fileExtension === '.csv') {
            // Lire le fichier CSV
            const results = [];
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                await processImportedStudents(results, classId, schoolId.toString(), academicYear, classroom.name, res, filePath);
            });
        }
        else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            // Lire le fichier Excel
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const results = XLSX.utils.sheet_to_json(worksheet);
            await processImportedStudents(results, classId, schoolId.toString(), academicYear, classroom.name, res, filePath);
        }
        else {
            // Supprimer le fichier téléchargé
            fs_1.default.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Format de fichier non supporté'
            });
        }
    }
    catch (error) {
        console.error('Erreur lors de l\'importation des étudiants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'importation des étudiants',
            error: error.message
        });
    }
};
exports.importStudentsFromFile = importStudentsFromFile;
/**
 * Traite les données d'étudiants importées
 */
const processImportedStudents = async (data, classId, schoolId, academicYear, className, res, filePath) => {
    try {
        const students = [];
        const errors = [];
        const educationLevel = determineEducationLevel(className);
        const specialization = extractSpecialization(className);
        // Mapper les champs des données importées vers notre modèle d'étudiant
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Mapper les champs en fonction des en-têtes de colonne
                // Ces noms de champs doivent correspondre aux en-têtes du fichier importé
                const matricule = row['Matricule'] || '';
                let name = row['Nom(s) et prénom(s)'] || '';
                const sex = row['Sx'] || '';
                const birthDateStr = row['Né(e) le'] || '';
                const birthPlace = row['Lieu de naissance'] || '';
                const isRepeater = row['Red'] === 'OUI';
                // Séparer nom et prénom(s) si nécessaire
                let firstName = '', lastName = '';
                if (name.includes(' ')) {
                    const nameParts = name.split(' ');
                    lastName = nameParts[0]; // Premier élément comme nom de famille
                    firstName = nameParts.slice(1).join(' '); // Le reste comme prénom(s)
                }
                else {
                    // Si pas d'espace, considérer toute la chaîne comme nom de famille
                    lastName = name;
                }
                // Convertir la date de naissance
                let birthDate;
                let age = 0;
                try {
                    birthDate = parseFrenchDate(birthDateStr);
                    age = calculateAge(birthDate);
                }
                catch (error) {
                    throw new Error(`Date de naissance invalide: ${birthDateStr}`);
                }
                // Générer un email à partir du nom et prénom
                // Format: première lettre du prénom + nom + @ecole.edu
                const emailPrefix = (firstName ? firstName.charAt(0).toLowerCase() : '') + lastName.toLowerCase().replace(/\s+/g, '');
                const email = `${emailPrefix}@student.edu`;
                // Créer l'étudiant
                const student = {
                    matricule,
                    firstName,
                    lastName,
                    fullName: name,
                    email,
                    gender: sex === 'M' ? Student_1.Gender.MALE : Student_1.Gender.FEMALE,
                    birthDate,
                    birthPlace,
                    isRepeater,
                    academicYear,
                    educationLevel,
                    specialization,
                    status: 'inscrit',
                    registrationDate: new Date(),
                    classId: new mongoose_1.default.Types.ObjectId(classId),
                    schoolId: new mongoose_1.default.Types.ObjectId(schoolId)
                };
                students.push(student);
            }
            catch (error) {
                errors.push({
                    row: i + 1,
                    message: error.message
                });
            }
        }
        // Insérer les étudiants en base de données
        if (students.length > 0) {
            await Student_1.default.insertMany(students, { ordered: false })
                .then(result => {
                // Supprimer le fichier téléchargé
                fs_1.default.unlinkSync(filePath);
                return res.status(201).json({
                    success: true,
                    message: `${result.length} étudiants importés avec succès`,
                    errors: errors.length > 0 ? errors : undefined,
                    data: result
                });
            })
                .catch(error => {
                // Des erreurs peuvent survenir pour des doublons (matricule unique)
                console.error('Erreur lors de l\'insertion des étudiants:', error);
                // Supprimer le fichier téléchargé
                fs_1.default.unlinkSync(filePath);
                return res.status(207).json({
                    success: true,
                    message: 'Import partiellement réussi',
                    errors: [{
                            message: 'Certains étudiants n\'ont pas pu être importés (matricules en doublon possible)',
                            details: error.message
                        }, ...errors]
                });
            });
        }
        else {
            // Supprimer le fichier téléchargé
            fs_1.default.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Aucun étudiant valide trouvé dans le fichier',
                errors
            });
        }
    }
    catch (error) {
        // Supprimer le fichier téléchargé
        fs_1.default.unlinkSync(filePath);
        console.error('Erreur lors du traitement des données d\'étudiants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement des données d\'étudiants',
            error: error.message
        });
    }
};
/**
 * Exporter la liste des étudiants d'une classe au format Excel ou CSV
 */
const exportStudentsByClass = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const { classId } = req.params;
        const { format = 'xlsx' } = req.query; // Format par défaut: xlsx
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que la classe appartient à l'école de l'admin
            if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        // Récupérer les étudiants de la classe
        const students = await Student_1.default.find({ classId })
            .sort({ lastName: 1, firstName: 1 })
            .lean();
        if (!students.length) {
            return res.status(404).json({
                success: false,
                message: 'Aucun étudiant trouvé dans cette classe'
            });
        }
        // Préparer les données pour l'export
        const exportData = students.map((student, index) => ({
            'N°': index + 1,
            'Matricule': student.matricule,
            'Nom(s) et prénom(s)': student.fullName || `${student.lastName} ${student.firstName}`,
            'Sx': student.gender,
            'Né(e) le': student.birthDate ? (0, date_fns_1.format)(new Date(student.birthDate), 'dd/MM/yyyy', { locale: locale_1.fr }) : '',
            'Age': calculateAge(student.birthDate),
            'Lieu de naissance': student.birthPlace,
            'Red': student.isRepeater ? 'OUI' : 'NON'
        }));
        // Créer le dossier d'exports s'il n'existe pas
        const exportDir = path_1.default.join(__dirname, '../exports');
        if (!fs_1.default.existsSync(exportDir)) {
            fs_1.default.mkdirSync(exportDir, { recursive: true });
        }
        // Générer le nom du fichier
        const timestamp = (0, date_fns_1.format)(new Date(), 'yyyyMMdd_HHmmss', { locale: locale_1.fr });
        const className = classroom.name.replace(/\s+/g, '_');
        const fileName = `Liste_Classe_${className}_${timestamp}`;
        let filePath;
        // Exporter selon le format demandé
        if (format === 'csv') {
            filePath = path_1.default.join(exportDir, `${fileName}.csv`);
            // Générer le contenu CSV
            const headers = Object.keys(exportData[0]).join(',') + '\n';
            const rows = exportData.map(row => Object.values(row).join(',')).join('\n');
            fs_1.default.writeFileSync(filePath, headers + rows);
        }
        else {
            filePath = path_1.default.join(exportDir, `${fileName}.xlsx`);
            // Générer le fichier Excel
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Classe ${classroom.name}`);
            XLSX.writeFile(workbook, filePath);
        }
        // Renvoyer le fichier
        res.download(filePath, path_1.default.basename(filePath), (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du fichier:', err);
            }
            // Supprimer le fichier après envoi
            fs_1.default.unlinkSync(filePath);
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'exportation des étudiants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'exportation des étudiants',
            error: error.message
        });
    }
};
exports.exportStudentsByClass = exportStudentsByClass;
/**
 * Récupère les statistiques des étudiants par niveau d'éducation
 */
const getStudentStatsByLevel = async (req, res) => {
    try {
        const { role, schoolId } = req.user;
        let filter = {};
        // Filtrer par école si l'utilisateur est un admin
        if (role === 'admin' && schoolId) {
            filter.schoolId = schoolId;
        }
        // Regrouper les étudiants par niveau d'éducation et par genre
        const stats = await Student_1.default.aggregate([
            { $match: filter },
            { $group: {
                    _id: {
                        educationLevel: '$educationLevel',
                        gender: '$gender'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.educationLevel': 1, '_id.gender': 1 } }
        ]);
        // Restructurer les données pour une meilleure lisibilité côté client
        const result = Student_1.EducationLevel ? Object.values(Student_1.EducationLevel).reduce((acc, level) => {
            acc[level] = {
                total: 0,
                male: 0,
                female: 0
            };
            return acc;
        }, {}) : {};
        // Remplir les statistiques
        stats.forEach(stat => {
            const level = stat._id.educationLevel;
            const gender = stat._id.gender;
            if (result[level]) {
                result[level].total += stat.count;
                if (gender === Student_1.Gender.MALE) {
                    result[level].male = stat.count;
                }
                else if (gender === Student_1.Gender.FEMALE) {
                    result[level].female = stat.count;
                }
            }
        });
        return res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques des étudiants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques des étudiants',
            error: error.message
        });
    }
};
exports.getStudentStatsByLevel = getStudentStatsByLevel;
exports.default = {
    getAllStudents: exports.getAllStudents,
    getStudentById: exports.getStudentById,
    createStudent: exports.createStudent,
    updateStudent: exports.updateStudent,
    deleteStudent: exports.deleteStudent,
    getStudentsByClass: exports.getStudentsByClass,
    getStudentsBySchool: exports.getStudentsBySchool,
    importStudentsFromFile: exports.importStudentsFromFile,
    exportStudentsByClass: exports.exportStudentsByClass,
    getStudentStatsByLevel: exports.getStudentStatsByLevel
};
