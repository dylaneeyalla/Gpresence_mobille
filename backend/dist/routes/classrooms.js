"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classroomController_1 = __importDefault(require("../controllers/classroomController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/classrooms
 * @desc    Récupère toutes les classes (filtrées selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/', auth_1.verifyToken, classroomController_1.default.getAllClassrooms);
/**
 * @route   GET /api/classrooms/school/:schoolId
 * @desc    Récupère toutes les classes d'une école spécifique
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de l'école
 */
router.get('/school/:schoolId', auth_1.verifyToken, (0, auth_1.checkSchoolAccess)('schoolId'), classroomController_1.default.getClassroomsBySchool);
/**
 * @route   GET /api/classrooms/:id
 * @desc    Récupère une classe par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant assigné
 */
router.get('/:id', auth_1.verifyToken, classroomController_1.default.getClassroomById);
/**
 * @route   POST /api/classrooms
 * @desc    Crée une nouvelle classe
 * @access  Private - SuperAdmin, Admin (pour son école uniquement)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomController_1.default.createClassroom);
/**
 * @route   PUT /api/classrooms/:id
 * @desc    Met à jour une classe existante
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomController_1.default.updateClassroom);
/**
 * @route   DELETE /api/classrooms/:id
 * @desc    Supprime une classe
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), classroomController_1.default.deleteClassroom);
exports.default = router;
