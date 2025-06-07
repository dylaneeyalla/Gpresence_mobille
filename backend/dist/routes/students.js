"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = __importDefault(require("../controllers/studentController"));
const auth_1 = require("../middlewares/auth");
const studentController_2 = require("../controllers/studentController");
const router = express_1.default.Router();
/**
 * @route   GET /api/students
 * @desc    Récupère tous les étudiants (filtrés selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 * @query   classId - Optionnel, pour filtrer par classe
 */
router.get('/', auth_1.verifyToken, studentController_1.default.getAllStudents);
/**
 * @route   GET /api/students/class/:classId
 * @desc    Récupère tous les étudiants d'une classe spécifique
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de la classe
 */
router.get('/class/:classId', auth_1.verifyToken, studentController_1.default.getStudentsByClass);
/**
 * @route   GET /api/students/school/:schoolId
 * @desc    Récupère tous les étudiants d'une école spécifique
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de l'école
 */
router.get('/school/:schoolId', auth_1.verifyToken, (0, auth_1.checkSchoolAccess)('schoolId'), studentController_1.default.getStudentsBySchool);
/**
 * @route   GET /api/students/:id
 * @desc    Récupère un étudiant par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de la classe, l'Étudiant lui-même
 */
router.get('/:id', auth_1.verifyToken, studentController_1.default.getStudentById);
/**
 * @route   POST /api/students
 * @desc    Crée un nouvel étudiant
 * @access  Private - SuperAdmin, Admin (pour son école uniquement)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), studentController_1.default.createStudent);
/**
 * @route   PUT /api/students/:id
 * @desc    Met à jour un étudiant existant
 * @access  Private - SuperAdmin, Admin de l'école, l'Étudiant lui-même (champs limités)
 */
router.put('/:id', auth_1.verifyToken, studentController_1.default.updateStudent);
/**
 * @route   DELETE /api/students/:id
 * @desc    Supprime un étudiant
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), studentController_1.default.deleteStudent);
/**
 * @route   POST /api/students/import
 * @desc    Importe des étudiants à partir d'un fichier CSV ou Excel
 * @access  Private - SuperAdmin, Admin de l'école
 * @file    studentFile - Fichier CSV ou Excel contenant les données des étudiants
 * @body    classId - ID de la classe pour l'attribution des étudiants
 * @body    academicYear - Année académique (optionnel, par défaut année actuelle)
 */
router.post('/import', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), studentController_2.upload.single('studentFile'), studentController_1.default.importStudentsFromFile);
/**
 * @route   GET /api/students/export/class/:classId
 * @desc    Exporte la liste des étudiants d'une classe au format Excel ou CSV
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de la classe
 * @param   classId - ID de la classe à exporter
 * @query   format - Format d'export ('xlsx' ou 'csv', par défaut 'xlsx')
 */
router.get('/export/class/:classId', auth_1.verifyToken, studentController_1.default.exportStudentsByClass);
/**
 * @route   GET /api/students/stats/level
 * @desc    Récupère les statistiques des étudiants par niveau d'éducation
 * @access  Private - SuperAdmin, Admin
 */
router.get('/stats/level', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), studentController_1.default.getStudentStatsByLevel);
exports.default = router;
