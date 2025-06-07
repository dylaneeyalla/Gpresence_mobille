"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendanceController_1 = __importDefault(require("../controllers/attendanceController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/attendances
 * @desc    Récupère tous les enregistrements de présence (filtrés selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/', auth_1.verifyToken, attendanceController_1.default.getAllAttendances);
/**
 * @route   GET /api/attendances/classroom/:classroomId/stats
 * @desc    Récupère les statistiques de présence pour une classe
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de la classe
 */
router.get('/classroom/:classroomId/stats', auth_1.verifyToken, attendanceController_1.default.getClassroomAttendanceStats);
/**
 * @route   GET /api/attendances/student/:studentId/stats
 * @desc    Récupère les statistiques de présence pour un étudiant
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de la classe, l'Étudiant lui-même
 */
router.get('/student/:studentId/stats', auth_1.verifyToken, attendanceController_1.default.getStudentAttendanceStats);
/**
 * @route   GET /api/attendances/:id
 * @desc    Récupère un enregistrement de présence par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant concerné, Étudiants concernés
 */
router.get('/:id', auth_1.verifyToken, attendanceController_1.default.getAttendanceById);
/**
 * @route   POST /api/attendances
 * @desc    Crée un nouvel enregistrement de présence
 * @access  Private - SuperAdmin, Admin, Teacher (pour ses propres cours)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin', 'teacher']), attendanceController_1.default.createAttendance);
/**
 * @route   PUT /api/attendances/:id
 * @desc    Met à jour un enregistrement de présence
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant concerné
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin', 'teacher']), attendanceController_1.default.updateAttendance);
/**
 * @route   DELETE /api/attendances/:id
 * @desc    Supprime un enregistrement de présence
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant concerné (dans un délai de 24h)
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin', 'teacher']), attendanceController_1.default.deleteAttendance);
exports.default = router;
