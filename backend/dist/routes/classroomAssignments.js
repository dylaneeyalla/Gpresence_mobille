"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classroomAssignmentController_1 = __importDefault(require("../controllers/classroomAssignmentController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/classroom-assignments
 * @desc    Récupère toutes les assignations de classes (filtrées selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/', auth_1.verifyToken, classroomAssignmentController_1.default.getAllAssignments);
/**
 * @route   GET /api/classroom-assignments/teacher/:teacherId
 * @desc    Récupère toutes les assignations d'un enseignant spécifique
 * @access  Private - SuperAdmin, Admin de l'école, l'Enseignant lui-même
 */
router.get('/teacher/:teacherId', auth_1.verifyToken, classroomAssignmentController_1.default.getAssignmentsByTeacher);
/**
 * @route   GET /api/classroom-assignments/classroom/:classroomId
 * @desc    Récupère toutes les assignations d'une classe spécifique
 * @access  Private - SuperAdmin, Admin de l'école, Enseignants de la classe ou de l'école
 */
router.get('/classroom/:classroomId', auth_1.verifyToken, classroomAssignmentController_1.default.getAssignmentsByClassroom);
/**
 * @route   GET /api/classroom-assignments/:id
 * @desc    Récupère une assignation par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant concerné
 */
router.get('/:id', auth_1.verifyToken, classroomAssignmentController_1.default.getAssignmentById);
/**
 * @route   POST /api/classroom-assignments
 * @desc    Crée une nouvelle assignation de classe
 * @access  Private - SuperAdmin, Admin (pour son école uniquement)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomAssignmentController_1.default.createAssignment);
/**
 * @route   PUT /api/classroom-assignments/:id
 * @desc    Met à jour une assignation existante (uniquement le planning)
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomAssignmentController_1.default.updateAssignment);
/**
 * @route   DELETE /api/classroom-assignments/:id
 * @desc    Supprime une assignation
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomAssignmentController_1.default.deleteAssignment);
exports.default = router;
