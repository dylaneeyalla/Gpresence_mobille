"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectsBySchool = exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getSubjectById = exports.getAllSubjects = void 0;
const Subject_1 = __importDefault(require("../models/Subject"));
const School_1 = __importDefault(require("../models/School"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
/**
 * Récupère toutes les matières
 * - SuperAdmin : Toutes les matières
 * - Admin : Uniquement les matières de son école
 * - Teacher : Matières des écoles où il enseigne
 */
const getAllSubjects = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Admin: matières de son école
            filter.schoolId = schoolId;
        }
        else if (role === 'teacher' && userId) {
            // Teacher: matières des écoles où il enseigne
            const schoolAssignments = await TeacherSchoolAssignment_1.default.find({ teacherId: userId })
                .distinct('schoolId');
            if (schoolAssignments.length > 0) {
                filter.schoolId = { $in: schoolAssignments };
            }
        }
        // Pas de filtre pour superAdmin
        // Récupérer les matières avec population des écoles
        const subjects = await Subject_1.default.find(filter)
            .select('name schoolId')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des matières:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des matières',
            error: error.message
        });
    }
};
exports.getAllSubjects = getAllSubjects;
/**
 * Récupère une matière par son ID
 */
const getSubjectById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const subjectId = req.params.id;
        // Récupérer la matière
        const subject = await Subject_1.default.findById(subjectId)
            .populate('schoolId', 'name');
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Matière non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin' && schoolId) {
            // Un admin ne peut accéder qu'aux matières de son école
            if (subject.schoolId.toString() !== schoolId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette matière n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher' && userId) {
            // Un enseignant ne peut accéder qu'aux matières des écoles où il enseigne
            const isInSchool = await TeacherSchoolAssignment_1.default.exists({
                teacherId: userId,
                schoolId: subject.schoolId
            });
            if (!isInSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cette matière'
                });
            }
        }
        // Récupérer les assignations où cette matière est enseignée
        const assignments = await ClassroomAssignment_1.default.find({ subjectId })
            .populate('teacherId', 'firstName lastName')
            .populate('classroomId', 'name');
        return res.status(200).json({
            success: true,
            data: {
                ...subject.toObject(),
                assignments
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la matière:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la matière',
            error: error.message
        });
    }
};
exports.getSubjectById = getSubjectById;
/**
 * Crée une nouvelle matière
 * - SuperAdmin : Peut créer une matière pour n'importe quelle école
 * - Admin : Uniquement pour son école
 */
const createSubject = async (req, res) => {
    try {
        const { name, schoolId } = req.body;
        const { role, schoolId: adminSchoolId } = req.user;
        // Vérifier que tous les champs obligatoires sont présents
        if (!name || !schoolId) {
            return res.status(400).json({
                success: false,
                message: 'Les champs nom et école sont obligatoires'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin' && adminSchoolId?.toString() !== schoolId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer des matières que pour votre école'
            });
        }
        // Vérifier si l'école existe
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        // Vérifier si une matière avec le même nom existe déjà dans cette école
        const existingSubject = await Subject_1.default.findOne({ name, schoolId });
        if (existingSubject) {
            return res.status(409).json({
                success: false,
                message: 'Une matière avec ce nom existe déjà dans cette école'
            });
        }
        // Créer la matière
        const subject = await Subject_1.default.create({
            name,
            schoolId
        });
        return res.status(201).json({
            success: true,
            data: subject,
            message: 'Matière créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de la matière:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la matière',
            error: error.message
        });
    }
};
exports.createSubject = createSubject;
/**
 * Met à jour une matière existante
 * - SuperAdmin : Peut modifier n'importe quelle matière
 * - Admin : Uniquement les matières de son école
 */
const updateSubject = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const subjectId = req.params.id;
        const { name } = req.body;
        // Vérifier si la matière existe
        const subject = await Subject_1.default.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Matière non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (subject.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette matière n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier si une autre matière avec ce nom existe déjà dans cette école
        if (name && name !== subject.name) {
            const existingSubject = await Subject_1.default.findOne({
                name,
                schoolId: subject.schoolId,
                _id: { $ne: subjectId }
            });
            if (existingSubject) {
                return res.status(409).json({
                    success: false,
                    message: 'Une autre matière avec ce nom existe déjà dans cette école'
                });
            }
        }
        // Mettre à jour la matière
        const updatedSubject = await Subject_1.default.findByIdAndUpdate(subjectId, { name }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedSubject,
            message: 'Matière mise à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la matière:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la matière',
            error: error.message
        });
    }
};
exports.updateSubject = updateSubject;
/**
 * Supprime une matière
 * - SuperAdmin : Peut supprimer n'importe quelle matière
 * - Admin : Uniquement les matières de son école
 */
const deleteSubject = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const subjectId = req.params.id;
        // Vérifier si la matière existe
        const subject = await Subject_1.default.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Matière non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (subject.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette matière n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier s'il y a des assignations pour cette matière
        const assignmentsCount = await ClassroomAssignment_1.default.countDocuments({ subjectId });
        if (assignmentsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer cette matière car elle est utilisée dans des assignations de classes'
            });
        }
        // Supprimer la matière
        await Subject_1.default.findByIdAndDelete(subjectId);
        return res.status(200).json({
            success: true,
            message: 'Matière supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de la matière:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la matière',
            error: error.message
        });
    }
};
exports.deleteSubject = deleteSubject;
/**
 * Récupère toutes les matières d'une école spécifique
 */
const getSubjectsBySchool = async (req, res) => {
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
            // Un admin ne peut accéder qu'aux matières de son école
            if (schoolId !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cette école'
                });
            }
        }
        else if (role === 'teacher') {
            // Vérifier si l'enseignant est affecté à cette école
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
        // Récupérer les matières de l'école
        const subjects = await Subject_1.default.find({ schoolId })
            .select('name');
        return res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des matières de l\'école:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des matières de l\'école',
            error: error.message
        });
    }
};
exports.getSubjectsBySchool = getSubjectsBySchool;
exports.default = {
    getAllSubjects: exports.getAllSubjects,
    getSubjectById: exports.getSubjectById,
    createSubject: exports.createSubject,
    updateSubject: exports.updateSubject,
    deleteSubject: exports.deleteSubject,
    getSubjectsBySchool: exports.getSubjectsBySchool
};
