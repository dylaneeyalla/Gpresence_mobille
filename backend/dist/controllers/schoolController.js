"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstitutionType = exports.getSchoolStats = exports.deleteSchool = exports.updateSchool = exports.createSchool = exports.getSchoolById = exports.getAllSchools = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const School_1 = __importDefault(require("../models/School"));
const User_1 = __importDefault(require("../models/User"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
const InstitutionType_1 = __importDefault(require("../models/InstitutionType"));
/**
 * Récupère toutes les écoles
 * - SuperAdmin : Toutes les écoles
 * - Admin : Uniquement son école
 * - Teacher : Écoles auxquelles il est affecté
 */
const getAllSchools = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        let filter = {};
        // Filtrer les écoles en fonction du rôle
        if (role === 'admin' && schoolId) {
            // Un admin ne voit que son école
            filter = { _id: schoolId };
        }
        else if (role === 'teacher' && userId) {
            // Un enseignant voit les écoles auxquelles il est affecté
            const assignments = await TeacherSchoolAssignment_1.default.find({ teacherId: userId });
            const schoolIds = assignments.map(assignment => assignment.schoolId);
            filter = { _id: { $in: schoolIds } };
        }
        // Pas de filtre pour superAdmin qui voit tout
        const schools = await School_1.default.find(filter)
            .select('name address phone email createdAt updatedAt');
        return res.status(200).json({
            success: true,
            count: schools.length,
            data: schools
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des écoles:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des écoles',
            error: error.message
        });
    }
};
exports.getAllSchools = getAllSchools;
/**
 * Récupère une seule école par son ID
 */
const getSchoolById = async (req, res) => {
    try {
        const { role, schoolId: userSchoolId, userId } = req.user;
        const schoolId = req.params.id;
        // Vérifier les permissions
        if (role === 'admin' && userSchoolId && userSchoolId.toString() !== schoolId) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas accès à cette école'
            });
        }
        if (role === 'teacher') {
            // Vérifier si l'enseignant est affecté à cette école
            const hasAccess = await TeacherSchoolAssignment_1.default.exists({
                teacherId: userId,
                schoolId
            });
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cette école'
                });
            }
        }
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        return res.status(200).json({
            success: true,
            data: school
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.getSchoolById = getSchoolById;
/**
 * Crée une nouvelle école
 * Seuls les superAdmin peuvent créer une école
 */
const createSchool = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;
        // Vérifier que tous les champs obligatoires sont présents
        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: 'Les champs nom et adresse sont obligatoires'
            });
        }
        // Vérifier si une école avec le même nom existe déjà
        const existingSchool = await School_1.default.findOne({ name });
        if (existingSchool) {
            return res.status(409).json({
                success: false,
                message: 'Une école avec ce nom existe déjà'
            });
        }
        const school = await School_1.default.create({
            name,
            address,
            phone,
            email
        });
        return res.status(201).json({
            success: true,
            data: school,
            message: 'École créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.createSchool = createSchool;
/**
 * Met à jour une école existante
 * - SuperAdmin : Peut modifier n'importe quelle école
 * - Admin : Uniquement son école
 */
const updateSchool = async (req, res) => {
    try {
        const { role, schoolId: userSchoolId } = req.user;
        const schoolId = req.params.id;
        const { name, address, phone, email } = req.body;
        // Vérifier les permissions pour un admin
        if (role === 'admin' && userSchoolId && userSchoolId.toString() !== schoolId) {
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
        // Vérifier si le nom n'est pas déjà utilisé par une autre école
        if (name && name !== school.name) {
            const existingSchool = await School_1.default.findOne({ name, _id: { $ne: schoolId } });
            if (existingSchool) {
                return res.status(409).json({
                    success: false,
                    message: 'Une autre école avec ce nom existe déjà'
                });
            }
        }
        // Mettre à jour l'école
        const updatedSchool = await School_1.default.findByIdAndUpdate(schoolId, { name, address, phone, email }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedSchool,
            message: 'École mise à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.updateSchool = updateSchool;
/**
 * Supprime une école
 * Seuls les superAdmin peuvent supprimer une école
 */
const deleteSchool = async (req, res) => {
    try {
        const schoolId = req.params.id;
        // Vérifier si l'école existe
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        // Vérifier s'il y a des utilisateurs associés à cette école
        const associatedUsers = await User_1.default.countDocuments({ schoolId });
        if (associatedUsers > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer cette école car elle contient des utilisateurs'
            });
        }
        // Supprimer les assignations d'enseignants à cette école
        await TeacherSchoolAssignment_1.default.deleteMany({ schoolId });
        // Supprimer l'école
        await School_1.default.findByIdAndDelete(schoolId);
        return res.status(200).json({
            success: true,
            message: 'École supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.deleteSchool = deleteSchool;
/**
 * Récupère les statistiques d'une école
 */
const getSchoolStats = async (req, res) => {
    try {
        const { role, schoolId: userSchoolId } = req.user;
        const schoolId = req.params.id;
        // Vérifier les permissions pour un admin
        if (role === 'admin' && userSchoolId && userSchoolId.toString() !== schoolId) {
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
        // Compter les enseignants
        const teacherCount = await Teacher_1.default.countDocuments({ schoolId });
        // Compter les enseignants assignés à cette école (y compris ceux qui n'ont pas cette école comme principale)
        const assignedTeachersCount = await TeacherSchoolAssignment_1.default.countDocuments({ schoolId });
        // Compter les administrateurs
        const adminCount = await User_1.default.countDocuments({ schoolId, role: 'admin' });
        // Compter les étudiants
        const studentCount = await mongoose_1.default.model('Student').countDocuments({ schoolId });
        // Compter les classes
        const classroomCount = await mongoose_1.default.model('Classroom').countDocuments({ schoolId });
        // Compter les matières
        const subjectCount = await mongoose_1.default.model('Subject').countDocuments({ schoolId });
        return res.status(200).json({
            success: true,
            data: {
                teacherCount,
                assignedTeachersCount,
                adminCount,
                studentCount,
                classroomCount,
                subjectCount,
                school: {
                    name: school.name,
                    address: school.address,
                    phone: school.phone,
                    email: school.email,
                    createdAt: school.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques de l\'\u00e9cole:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de l\'\u00e9cole',
            error: error.message
        });
    }
};
exports.getSchoolStats = getSchoolStats;
/**
 * Met à jour le type d'établissement d'une école
 * - SuperAdmin : Peut modifier n'importe quelle école
 * - Admin : Uniquement son école, et seulement si le type n'a pas déjà été défini
 */
const updateInstitutionType = async (req, res) => {
    try {
        const { role, schoolId: userSchoolId } = req.user;
        const schoolId = req.params.id;
        const { institutionTypeId } = req.body;
        // Vérifier que l'ID du type d'établissement est fourni
        if (!institutionTypeId) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID du type d\'établissement est requis'
            });
        }
        // Vérifier si le type d'établissement existe
        const institutionType = await InstitutionType_1.default.findById(institutionTypeId);
        if (!institutionType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'établissement non trouvé'
            });
        }
        // Vérifier si le type d'établissement est actif
        if (!institutionType.active) {
            return res.status(400).json({
                success: false,
                message: 'Ce type d\'établissement n\'est pas actif'
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
        // Vérifier les permissions
        if (role === 'admin') {
            // Vérifier que l'admin modifie son école
            if (userSchoolId?.toString() !== schoolId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez modifier que votre propre établissement'
                });
            }
            // Vérifier si le type d'établissement est déjà défini (sauf pour superadmin)
            if (school.institutionTypeId) {
                return res.status(403).json({
                    success: false,
                    message: 'Le type d\'établissement ne peut être modifié qu\'une seule fois'
                });
            }
        }
        // Mettre à jour l'école avec le type d'établissement
        const updatedSchool = await School_1.default.findByIdAndUpdate(schoolId, {
            institutionTypeId,
            sector: institutionType.sector,
            // Utiliser les niveaux d'éducation du type d'établissement
            defaultEducationLevels: institutionType.educationLevels
        }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedSchool,
            message: 'Type d\'établissement mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du type d\'établissement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du type d\'établissement',
            error: error.message
        });
    }
};
exports.updateInstitutionType = updateInstitutionType;
exports.default = {
    getAllSchools: exports.getAllSchools,
    getSchoolById: exports.getSchoolById,
    createSchool: exports.createSchool,
    updateSchool: exports.updateSchool,
    deleteSchool: exports.deleteSchool,
    getSchoolStats: exports.getSchoolStats,
    updateInstitutionType: exports.updateInstitutionType
};
