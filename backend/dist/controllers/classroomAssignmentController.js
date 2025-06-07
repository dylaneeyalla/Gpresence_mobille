"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignmentsByClassroom = exports.getAssignmentsByTeacher = exports.deleteAssignment = exports.updateAssignment = exports.createAssignment = exports.getAssignmentById = exports.getAllAssignments = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
const Classroom_1 = __importDefault(require("../models/Classroom"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const Subject_1 = __importDefault(require("../models/Subject"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
/**
 * Récupère toutes les assignations de classes
 * - SuperAdmin : Toutes les assignations
 * - Admin : Uniquement les assignations de son école
 * - Teacher : Ses propres assignations
 */
const getAllAssignments = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Admin: assignations de son école
            filter.schoolId = schoolId;
        }
        else if (role === 'teacher' && userId) {
            // Teacher: ses propres assignations
            filter.teacherId = userId;
        }
        // Pas de filtre pour superAdmin
        // Récupérer les assignations avec population des références
        const assignments = await ClassroomAssignment_1.default.find(filter)
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des assignations de classes:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des assignations de classes',
            error: error.message
        });
    }
};
exports.getAllAssignments = getAllAssignments;
/**
 * Récupère une assignation de classe par son ID
 */
const getAssignmentById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const assignmentId = req.params.id;
        // Récupérer l'assignation
        const assignment = await ClassroomAssignment_1.default.findById(assignmentId)
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignation de classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin' && schoolId) {
            // Un admin ne peut accéder qu'aux assignations de son école
            if (assignment.schoolId.toString() !== schoolId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette assignation n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher' && userId) {
            // Un enseignant ne peut accéder qu'à ses propres assignations
            if (assignment.teacherId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cette assignation'
                });
            }
        }
        return res.status(200).json({
            success: true,
            data: assignment
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'assignation de classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'assignation de classe',
            error: error.message
        });
    }
};
exports.getAssignmentById = getAssignmentById;
/**
 * Crée une nouvelle assignation de classe
 * - SuperAdmin : Peut créer une assignation pour n'importe quelle école
 * - Admin : Uniquement pour son école
 */
const createAssignment = async (req, res) => {
    try {
        const { classroomId, teacherId, subjectId, schoolId, schedule } = req.body;
        const { role, schoolId: adminSchoolId } = req.user;
        // Vérifier que tous les champs obligatoires sont présents
        if (!classroomId || !teacherId || !subjectId || !schoolId) {
            return res.status(400).json({
                success: false,
                message: 'Les champs classe, enseignant, matière et école sont obligatoires'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin' && adminSchoolId?.toString() !== schoolId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer des assignations que pour votre école'
            });
        }
        // Vérifier si la classe existe et appartient à l'école
        const classroom = await Classroom_1.default.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        if (classroom.schoolId.toString() !== schoolId) {
            return res.status(400).json({
                success: false,
                message: 'La classe n\'appartient pas à l\'école spécifiée'
            });
        }
        // Vérifier si l'enseignant existe et est assigné à l'école
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        const isTeacherInSchool = await TeacherSchoolAssignment_1.default.exists({
            teacherId,
            schoolId
        });
        if (!isTeacherInSchool) {
            return res.status(400).json({
                success: false,
                message: 'L\'enseignant n\'est pas assigné à l\'école spécifiée'
            });
        }
        // Vérifier si la matière existe et appartient à l'école
        const subject = await Subject_1.default.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Matière non trouvée'
            });
        }
        if (subject.schoolId.toString() !== schoolId) {
            return res.status(400).json({
                success: false,
                message: 'La matière n\'appartient pas à l\'école spécifiée'
            });
        }
        // Vérifier si une assignation avec la même combinaison existe déjà
        const existingAssignment = await ClassroomAssignment_1.default.findOne({
            classroomId,
            teacherId,
            subjectId,
            schoolId
        });
        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: 'Une assignation avec cette combinaison de classe, enseignant et matière existe déjà'
            });
        }
        // Valider le format du planning (schedule) s'il est fourni
        if (schedule) {
            for (const item of schedule) {
                if (!item.day || !item.startTime || !item.endTime) {
                    return res.status(400).json({
                        success: false,
                        message: 'Chaque élément du planning doit contenir les champs jour, heure de début et heure de fin'
                    });
                }
                // Vérifier que les formats des heures sont corrects
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(item.startTime) || !timeRegex.test(item.endTime)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Les heures doivent être au format HH:MM (de 00:00 à 23:59)'
                    });
                }
                // Vérifier que l'heure de fin est après l'heure de début
                const [startHour, startMinute] = item.startTime.split(':').map(Number);
                const [endHour, endMinute] = item.endTime.split(':').map(Number);
                if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'heure de fin doit être après l\'heure de début'
                    });
                }
            }
        }
        // Créer l'assignation
        const assignment = await ClassroomAssignment_1.default.create({
            classroomId,
            teacherId,
            subjectId,
            schoolId,
            schedule
        });
        // Récupérer l'assignation avec les références populées
        const populatedAssignment = await ClassroomAssignment_1.default.findById(assignment._id)
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(201).json({
            success: true,
            data: populatedAssignment,
            message: 'Assignation de classe créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'assignation de classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'assignation de classe',
            error: error.message
        });
    }
};
exports.createAssignment = createAssignment;
/**
 * Met à jour une assignation de classe existante
 * - SuperAdmin : Peut modifier n'importe quelle assignation
 * - Admin : Uniquement les assignations de son école
 */
const updateAssignment = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const assignmentId = req.params.id;
        const { schedule } = req.body;
        // Vérifier si l'assignation existe
        const assignment = await ClassroomAssignment_1.default.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignation de classe non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (assignment.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette assignation n\'appartient pas à votre établissement'
                });
            }
        }
        // Valider le format du planning (schedule) s'il est fourni
        if (schedule) {
            for (const item of schedule) {
                if (!item.day || !item.startTime || !item.endTime) {
                    return res.status(400).json({
                        success: false,
                        message: 'Chaque élément du planning doit contenir les champs jour, heure de début et heure de fin'
                    });
                }
                // Vérifier que les formats des heures sont corrects
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(item.startTime) || !timeRegex.test(item.endTime)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Les heures doivent être au format HH:MM (de 00:00 à 23:59)'
                    });
                }
                // Vérifier que l'heure de fin est après l'heure de début
                const [startHour, startMinute] = item.startTime.split(':').map(Number);
                const [endHour, endMinute] = item.endTime.split(':').map(Number);
                if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'heure de fin doit être après l\'heure de début'
                    });
                }
            }
        }
        // Mettre à jour l'assignation (seul le planning peut être modifié)
        const updatedAssignment = await ClassroomAssignment_1.default.findByIdAndUpdate(assignmentId, { schedule }, { new: true, runValidators: true })
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            data: updatedAssignment,
            message: 'Assignation de classe mise à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'assignation de classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'assignation de classe',
            error: error.message
        });
    }
};
exports.updateAssignment = updateAssignment;
/**
 * Supprime une assignation de classe
 * - SuperAdmin : Peut supprimer n'importe quelle assignation
 * - Admin : Uniquement les assignations de son école
 */
const deleteAssignment = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const assignmentId = req.params.id;
        // Vérifier si l'assignation existe
        const assignment = await ClassroomAssignment_1.default.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignation de classe non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (assignment.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette assignation n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier s'il y a des enregistrements de présence liés à cette assignation
        const attendanceCount = await mongoose_1.default.model('Attendance').countDocuments({
            classroomAssignmentId: assignmentId
        });
        if (attendanceCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer cette assignation car elle a des enregistrements de présence associés'
            });
        }
        // Supprimer l'assignation
        await ClassroomAssignment_1.default.findByIdAndDelete(assignmentId);
        return res.status(200).json({
            success: true,
            message: 'Assignation de classe supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'assignation de classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'assignation de classe',
            error: error.message
        });
    }
};
exports.deleteAssignment = deleteAssignment;
/**
 * Récupère toutes les assignations d'un enseignant
 */
const getAssignmentsByTeacher = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const teacherId = req.params.teacherId;
        // Vérifier si l'enseignant existe
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que l'enseignant est assigné à l'école de l'admin
            const isTeacherInSchool = await TeacherSchoolAssignment_1.default.exists({
                teacherId,
                schoolId: adminSchoolId
            });
            if (!isTeacherInSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enseignant n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher' && userId?.toString() !== teacherId?.toString()) {
            // Un enseignant ne peut accéder qu'à ses propres assignations
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez consulter que vos propres assignations'
            });
        }
        // Récupérer les assignations de l'enseignant
        const assignments = await ClassroomAssignment_1.default.find({ teacherId })
            .populate('classroomId', 'name')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des assignations de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des assignations de l\'enseignant',
            error: error.message
        });
    }
};
exports.getAssignmentsByTeacher = getAssignmentsByTeacher;
/**
 * Récupère toutes les assignations d'une classe
 */
const getAssignmentsByClassroom = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const classroomId = req.params.classroomId;
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classroomId);
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
            // Vérifier si l'enseignant est assigné à cette classe ou à l'école de cette classe
            const isTeachingClass = await ClassroomAssignment_1.default.exists({
                teacherId: userId,
                classroomId
            });
            if (!isTeachingClass) {
                const isTeacherInSchool = await TeacherSchoolAssignment_1.default.exists({
                    teacherId: userId,
                    schoolId: classroom.schoolId
                });
                if (!isTeacherInSchool) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cette classe'
                    });
                }
            }
        }
        // Récupérer les assignations de la classe
        const assignments = await ClassroomAssignment_1.default.find({ classroomId })
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des assignations de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des assignations de la classe',
            error: error.message
        });
    }
};
exports.getAssignmentsByClassroom = getAssignmentsByClassroom;
exports.default = {
    getAllAssignments: exports.getAllAssignments,
    getAssignmentById: exports.getAssignmentById,
    createAssignment: exports.createAssignment,
    updateAssignment: exports.updateAssignment,
    deleteAssignment: exports.deleteAssignment,
    getAssignmentsByTeacher: exports.getAssignmentsByTeacher,
    getAssignmentsByClassroom: exports.getAssignmentsByClassroom
};
