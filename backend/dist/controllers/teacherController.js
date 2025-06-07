"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachersBySchool = exports.manageTeacherSchools = exports.deleteTeacher = exports.updateTeacher = exports.createTeacher = exports.getTeacherById = exports.getAllTeachers = void 0;
const Teacher_1 = __importDefault(require("../models/Teacher"));
const User_1 = __importDefault(require("../models/User"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
const School_1 = __importDefault(require("../models/School"));
/**
 * Récupère tous les enseignants
 * - SuperAdmin : Tous les enseignants
 * - Admin : Uniquement les enseignants de son école
 * - Teacher : Uniquement son profil
 */
const getAllTeachers = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Pour admin: tous les enseignants de son école (principale ou secondaire)
            const teacherIds = await TeacherSchoolAssignment_1.default.find({ schoolId })
                .distinct('teacherId');
            filter = { _id: { $in: teacherIds } };
        }
        else if (role === 'teacher' && userId) {
            // Pour teacher: uniquement son profil
            filter = { _id: userId };
        }
        // Pas de filtre pour superAdmin
        const teachers = await Teacher_1.default.find(filter)
            .select('firstName lastName email phone schoolId image')
            .populate('schoolId', 'name');
        // Récupérer les affectations aux écoles pour chaque enseignant
        const teachersWithAssignments = await Promise.all(teachers.map(async (teacher) => {
            const assignments = await TeacherSchoolAssignment_1.default.find({ teacherId: teacher._id })
                .populate('schoolId', 'name address');
            return {
                ...teacher.toObject(),
                schoolAssignments: assignments.map(a => ({
                    schoolId: a.schoolId,
                    isPrimary: a.isPrimary
                }))
            };
        }));
        return res.status(200).json({
            success: true,
            count: teachersWithAssignments.length,
            data: teachersWithAssignments
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des enseignants',
            error: error.message
        });
    }
};
exports.getAllTeachers = getAllTeachers;
/**
 * Récupère un enseignant par son ID
 */
const getTeacherById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const teacherId = req.params.id;
        // Vérifier les permissions
        if (role === 'teacher' && userId?.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez accéder qu\'à votre propre profil'
            });
        }
        if (role === 'admin') {
            // Vérifier si l'enseignant est affecté à l'école de l'admin
            const isTeacherInSchool = await TeacherSchoolAssignment_1.default.exists({
                teacherId,
                schoolId
            });
            if (!isTeacherInSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enseignant n\'appartient pas à votre établissement'
                });
            }
        }
        // Récupérer l'enseignant avec ses informations
        const teacher = await Teacher_1.default.findById(teacherId)
            .populate('schoolId', 'name address');
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Récupérer les affectations aux écoles
        const schoolAssignments = await TeacherSchoolAssignment_1.default.find({ teacherId })
            .populate('schoolId', 'name address');
        // Récupérer les assignations de classes
        const classAssignments = await ClassroomAssignment_1.default.find({ teacherId })
            .populate('classroomId', 'name')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name');
        return res.status(200).json({
            success: true,
            data: {
                ...teacher.toObject(),
                schoolAssignments,
                classAssignments
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'enseignant',
            error: error.message
        });
    }
};
exports.getTeacherById = getTeacherById;
/**
 * Crée un nouvel enseignant
 * - SuperAdmin : Peut créer un enseignant pour n'importe quelle école
 * - Admin : Peut créer un enseignant pour son école uniquement
 */
const createTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, schoolId, image, userId } = req.body;
        const { role, schoolId: adminSchoolId } = req.user;
        // Vérifier que tous les champs obligatoires sont présents
        if (!firstName || !lastName || !email || !schoolId) {
            return res.status(400).json({
                success: false,
                message: 'Les champs prénom, nom, email et école sont obligatoires'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin' && adminSchoolId?.toString() !== schoolId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer des enseignants que pour votre école'
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
        // Vérifier si un enseignant avec cet email existe déjà
        const existingTeacher = await Teacher_1.default.findOne({ email });
        if (existingTeacher) {
            return res.status(409).json({
                success: false,
                message: 'Un enseignant avec cet email existe déjà'
            });
        }
        // Si un userId est fourni, vérifier qu'il existe et a le rôle 'teacher'
        if (userId) {
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }
            if (user.role !== 'teacher') {
                return res.status(400).json({
                    success: false,
                    message: 'L\'utilisateur doit avoir le rôle "teacher"'
                });
            }
        }
        // Créer l'enseignant
        const teacher = await Teacher_1.default.create({
            firstName,
            lastName,
            email,
            phone,
            address,
            schoolId,
            image,
            userId
        });
        // Créer l'assignation d'école principale
        await TeacherSchoolAssignment_1.default.create({
            teacherId: teacher._id,
            schoolId,
            isPrimary: true
        });
        return res.status(201).json({
            success: true,
            data: teacher,
            message: 'Enseignant créé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'enseignant',
            error: error.message
        });
    }
};
exports.createTeacher = createTeacher;
/**
 * Met à jour un enseignant existant
 * - SuperAdmin : Peut modifier n'importe quel enseignant
 * - Admin : Uniquement les enseignants de son école
 * - Teacher : Uniquement son profil (champs limités)
 */
const updateTeacher = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const teacherId = req.params.id;
        const { firstName, lastName, email, phone, address, image } = req.body;
        // Vérifier les permissions
        if (role === 'teacher') {
            // Un enseignant ne peut modifier que son propre profil
            if (userId?.toString() !== teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez modifier que votre propre profil'
                });
            }
        }
        else if (role === 'admin') {
            // Vérifier si l'enseignant est affecté à l'école de l'admin
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
        // Vérifier si l'enseignant existe
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Vérifier si l'email n'est pas déjà utilisé par un autre enseignant
        if (email && email !== teacher.email) {
            const existingTeacher = await Teacher_1.default.findOne({ email, _id: { $ne: teacherId } });
            if (existingTeacher) {
                return res.status(409).json({
                    success: false,
                    message: 'Un autre enseignant avec cet email existe déjà'
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
        // Note: On ne permet pas de changer schoolId ici, cela doit passer par la fonction d'affectation multiple
        const updatedTeacher = await Teacher_1.default.findByIdAndUpdate(teacherId, updateData, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedTeacher,
            message: 'Enseignant mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'enseignant',
            error: error.message
        });
    }
};
exports.updateTeacher = updateTeacher;
/**
 * Supprime un enseignant
 * - SuperAdmin : Peut supprimer n'importe quel enseignant
 * - Admin : Uniquement les enseignants de son école
 */
const deleteTeacher = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId } = req.user;
        const teacherId = req.params.id;
        // Vérifier si l'enseignant existe
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Vérifier les permissions pour un admin
        if (role === 'admin') {
            // Vérifier si l'enseignant est affecté à l'école de l'admin
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
            // Un admin ne peut pas supprimer un enseignant affecté à plusieurs écoles
            const assignmentCount = await TeacherSchoolAssignment_1.default.countDocuments({ teacherId });
            if (assignmentCount > 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enseignant est affecté à plusieurs écoles. Seul un superAdmin peut le supprimer.'
                });
            }
        }
        // Vérifier s'il y a des assignations de classes pour cet enseignant
        const classAssignments = await ClassroomAssignment_1.default.countDocuments({ teacherId });
        if (classAssignments > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer cet enseignant car il a des classes assignées'
            });
        }
        // Supprimer d'abord les assignations d'écoles
        await TeacherSchoolAssignment_1.default.deleteMany({ teacherId });
        // Supprimer l'enseignant
        await Teacher_1.default.findByIdAndDelete(teacherId);
        return res.status(200).json({
            success: true,
            message: 'Enseignant supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'enseignant',
            error: error.message
        });
    }
};
exports.deleteTeacher = deleteTeacher;
/**
 * Gère les affectations d'un enseignant à plusieurs écoles
 * Seuls les superAdmin peuvent affecter un enseignant à plusieurs écoles
 */
const manageTeacherSchools = async (req, res) => {
    try {
        const { teacherId, schoolIds, primarySchoolId } = req.body;
        // Vérifier que les paramètres nécessaires sont fournis
        if (!teacherId || !schoolIds || !schoolIds.length || !primarySchoolId) {
            return res.status(400).json({
                success: false,
                message: 'Les paramètres teacherId, schoolIds et primarySchoolId sont obligatoires'
            });
        }
        // Vérifier que l'enseignant existe
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Vérifier que les écoles existent
        const schoolsCount = await School_1.default.countDocuments({ _id: { $in: schoolIds } });
        if (schoolsCount !== schoolIds.length) {
            return res.status(404).json({
                success: false,
                message: 'Une ou plusieurs écoles n\'existent pas'
            });
        }
        // Vérifier que l'école principale est dans la liste des écoles
        if (!schoolIds.includes(primarySchoolId)) {
            return res.status(400).json({
                success: false,
                message: 'L\'\u00e9cole principale doit faire partie des écoles affectées'
            });
        }
        // Supprimer toutes les assignations existantes
        await TeacherSchoolAssignment_1.default.deleteMany({ teacherId });
        // Créer les nouvelles assignations
        const assignments = [];
        for (const schoolId of schoolIds) {
            const isPrimary = schoolId.toString() === primarySchoolId.toString();
            const assignment = await TeacherSchoolAssignment_1.default.create({
                teacherId,
                schoolId,
                isPrimary
            });
            assignments.push(assignment);
        }
        // Mettre à jour l'école principale de l'enseignant
        await Teacher_1.default.findByIdAndUpdate(teacherId, { schoolId: primarySchoolId }, { new: true });
        return res.status(200).json({
            success: true,
            data: {
                assignments,
                primarySchoolId
            },
            message: 'Affectations d\'\u00e9coles mises à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la gestion des affectations d\'\u00e9coles:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la gestion des affectations d\'\u00e9coles',
            error: error.message
        });
    }
};
exports.manageTeacherSchools = manageTeacherSchools;
/**
 * Récupère tous les enseignants d'une école spécifique
 */
const getTeachersBySchool = async (req, res) => {
    try {
        const { role, schoolId: userSchoolId } = req.user;
        const schoolId = req.params.schoolId;
        // Vérifier les permissions pour un admin
        if (role === 'admin' && userSchoolId?.toString() !== schoolId) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas accès à cette école'
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
        // Récupérer tous les IDs des enseignants affectés à cette école
        const assignments = await TeacherSchoolAssignment_1.default.find({ schoolId });
        const teacherIds = assignments.map(a => a.teacherId);
        // Récupérer les détails des enseignants
        const teachers = await Teacher_1.default.find({ _id: { $in: teacherIds } })
            .select('firstName lastName email phone image');
        // Ajouter l'information isPrimary à chaque enseignant
        const teachersWithPrimaryInfo = teachers.map(teacher => {
            const assignment = assignments.find(a => a.teacherId.toString() === teacher._id.toString());
            return {
                ...teacher.toObject(),
                isPrimary: assignment ? assignment.isPrimary : false
            };
        });
        return res.status(200).json({
            success: true,
            count: teachersWithPrimaryInfo.length,
            data: teachersWithPrimaryInfo
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des enseignants de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des enseignants de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.getTeachersBySchool = getTeachersBySchool;
exports.default = {
    getAllTeachers: exports.getAllTeachers,
    getTeacherById: exports.getTeacherById,
    createTeacher: exports.createTeacher,
    updateTeacher: exports.updateTeacher,
    deleteTeacher: exports.deleteTeacher,
    manageTeacherSchools: exports.manageTeacherSchools,
    getTeachersBySchool: exports.getTeachersBySchool
};
