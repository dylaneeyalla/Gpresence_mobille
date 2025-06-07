"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassroomsBySchool = exports.deleteClassroom = exports.updateClassroom = exports.createClassroom = exports.getClassroomById = exports.getAllClassrooms = void 0;
const Classroom_1 = __importDefault(require("../models/Classroom"));
const School_1 = __importDefault(require("../models/School"));
const Student_1 = __importDefault(require("../models/Student"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
/**
 * Récupère toutes les classes
 * - SuperAdmin : Toutes les classes
 * - Admin : Uniquement les classes de son école
 * - Teacher : Classes auxquelles il est assigné
 */
const getAllClassrooms = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Admin: classes de son école
            filter.schoolId = schoolId;
        }
        else if (role === 'teacher' && userId) {
            // Teacher: classes auxquelles il est assigné
            const assignedClasses = await ClassroomAssignment_1.default.find({ teacherId: userId })
                .distinct('classroomId');
            if (assignedClasses.length > 0) {
                filter._id = { $in: assignedClasses };
            }
            else {
                // Si aucune classe assignée, récupérer les classes des écoles où l'enseignant est affecté
                const schoolAssignments = await TeacherSchoolAssignment_1.default.find({ teacherId: userId })
                    .distinct('schoolId');
                if (schoolAssignments.length > 0) {
                    filter.schoolId = { $in: schoolAssignments };
                }
            }
        }
        // Pas de filtre pour superAdmin
        // Récupérer les classes avec population des écoles
        const classrooms = await Classroom_1.default.find(filter)
            .select('name schoolId')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            count: classrooms.length,
            data: classrooms
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des classes',
            error: error.message
        });
    }
};
exports.getAllClassrooms = getAllClassrooms;
/**
 * Récupère une classe par son ID
 */
const getClassroomById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const classroomId = req.params.id;
        // Récupérer la classe
        const classroom = await Classroom_1.default.findById(classroomId)
            .populate('schoolId', 'name address');
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin' && schoolId) {
            // Un admin ne peut accéder qu'aux classes de son école
            if (classroom.schoolId.toString() !== schoolId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher' && userId) {
            // Un enseignant ne peut accéder qu'aux classes auxquelles il est assigné
            // ou des écoles où il enseigne
            const isAssignedToClass = await ClassroomAssignment_1.default.exists({
                teacherId: userId,
                classroomId
            });
            if (!isAssignedToClass) {
                // Vérifier si l'enseignant est affecté à l'école de cette classe
                const isInSchool = await TeacherSchoolAssignment_1.default.exists({
                    teacherId: userId,
                    schoolId: classroom.schoolId
                });
                if (!isInSchool) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cette classe'
                    });
                }
            }
        }
        // Compter le nombre d'étudiants dans cette classe
        const studentCount = await Student_1.default.countDocuments({ classId: classroomId });
        // Récupérer les enseignants assignés à cette classe
        const assignments = await ClassroomAssignment_1.default.find({ classroomId })
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name');
        return res.status(200).json({
            success: true,
            data: {
                ...classroom.toObject(),
                studentCount,
                assignments
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la classe',
            error: error.message
        });
    }
};
exports.getClassroomById = getClassroomById;
/**
 * Crée une nouvelle classe
 * - SuperAdmin : Peut créer une classe pour n'importe quelle école
 * - Admin : Uniquement pour son école
 */
const createClassroom = async (req, res) => {
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
                message: 'Vous ne pouvez créer des classes que pour votre école'
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
        // Vérifier si une classe avec le même nom existe déjà dans cette école
        const existingClassroom = await Classroom_1.default.findOne({ name, schoolId });
        if (existingClassroom) {
            return res.status(409).json({
                success: false,
                message: 'Une classe avec ce nom existe déjà dans cette école'
            });
        }
        // Créer la classe
        const classroom = await Classroom_1.default.create({
            name,
            schoolId
        });
        return res.status(201).json({
            success: true,
            data: classroom,
            message: 'Classe créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la classe',
            error: error.message
        });
    }
};
exports.createClassroom = createClassroom;
/**
 * Met à jour une classe existante
 * - SuperAdmin : Peut modifier n'importe quelle classe
 * - Admin : Uniquement les classes de son école
 */
const updateClassroom = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const classroomId = req.params.id;
        const { name } = req.body;
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier si une autre classe avec ce nom existe déjà dans cette école
        if (name && name !== classroom.name) {
            const existingClassroom = await Classroom_1.default.findOne({
                name,
                schoolId: classroom.schoolId,
                _id: { $ne: classroomId }
            });
            if (existingClassroom) {
                return res.status(409).json({
                    success: false,
                    message: 'Une autre classe avec ce nom existe déjà dans cette école'
                });
            }
        }
        // Mettre à jour la classe
        const updatedClassroom = await Classroom_1.default.findByIdAndUpdate(classroomId, { name }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedClassroom,
            message: 'Classe mise à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la classe',
            error: error.message
        });
    }
};
exports.updateClassroom = updateClassroom;
/**
 * Supprime une classe
 * - SuperAdmin : Peut supprimer n'importe quelle classe
 * - Admin : Uniquement les classes de son école
 */
const deleteClassroom = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const classroomId = req.params.id;
        // Vérifier si la classe existe
        const classroom = await Classroom_1.default.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        // Vérifier s'il y a des étudiants dans cette classe
        const studentsCount = await Student_1.default.countDocuments({ classId: classroomId });
        if (studentsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer cette classe car elle contient des étudiants'
            });
        }
        // Vérifier s'il y a des assignations de classe pour cette classe
        const assignmentsCount = await ClassroomAssignment_1.default.countDocuments({ classroomId });
        if (assignmentsCount > 0) {
            // Supprimer d'abord toutes les assignations
            await ClassroomAssignment_1.default.deleteMany({ classroomId });
        }
        // Supprimer la classe
        await Classroom_1.default.findByIdAndDelete(classroomId);
        return res.status(200).json({
            success: true,
            message: 'Classe supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de la classe:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la classe',
            error: error.message
        });
    }
};
exports.deleteClassroom = deleteClassroom;
/**
 * Récupère toutes les classes d'une école spécifique
 */
const getClassroomsBySchool = async (req, res) => {
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
            // Un admin ne peut accéder qu'aux classes de son école
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
        // Récupérer les classes de l'école
        const classrooms = await Classroom_1.default.find({ schoolId })
            .select('name');
        // Ajouter le nombre d'étudiants pour chaque classe
        const classroomsWithStudentCount = await Promise.all(classrooms.map(async (classroom) => {
            const studentCount = await Student_1.default.countDocuments({ classId: classroom._id });
            return {
                ...classroom.toObject(),
                studentCount
            };
        }));
        return res.status(200).json({
            success: true,
            count: classroomsWithStudentCount.length,
            data: classroomsWithStudentCount
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des classes de l\'école:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des classes de l\'école',
            error: error.message
        });
    }
};
exports.getClassroomsBySchool = getClassroomsBySchool;
exports.default = {
    getAllClassrooms: exports.getAllClassrooms,
    getClassroomById: exports.getClassroomById,
    createClassroom: exports.createClassroom,
    updateClassroom: exports.updateClassroom,
    deleteClassroom: exports.deleteClassroom,
    getClassroomsBySchool: exports.getClassroomsBySchool
};
