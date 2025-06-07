"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teacherController_1 = __importDefault(require("../controllers/teacherController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/teachers
 * @desc    Récupère tous les enseignants (filtrés selon le rôle de l'utilisateur)
 * @access  Private - SuperAdmin, Admin, Teacher (seulement son profil)
 */
router.get('/', auth_1.verifyToken, teacherController_1.default.getAllTeachers);
/**
 * @route   GET /api/teachers/school/:schoolId
 * @desc    Récupère tous les enseignants d'une école spécifique
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.get('/school/:schoolId', auth_1.verifyToken, (0, auth_1.checkSchoolAccess)('schoolId'), teacherController_1.default.getTeachersBySchool);
/**
 * @route   GET /api/teachers/:id
 * @desc    Récupère un enseignant par son ID
 * @access  Private - SuperAdmin, Admin de l'école, l'Enseignant lui-même
 */
router.get('/:id', auth_1.verifyToken, teacherController_1.default.getTeacherById);
/**
 * @route   POST /api/teachers
 * @desc    Crée un nouvel enseignant
 * @access  Private - SuperAdmin, Admin (pour son école uniquement)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), teacherController_1.default.createTeacher);
/**
 * @route   PUT /api/teachers/:id
 * @desc    Met à jour un enseignant existant
 * @access  Private - SuperAdmin, Admin de l'école, l'Enseignant lui-même
 */
router.put('/:id', auth_1.verifyToken, teacherController_1.default.updateTeacher);
/**
 * @route   DELETE /api/teachers/:id
 * @desc    Supprime un enseignant
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), teacherController_1.default.deleteTeacher);
/**
 * @route   POST /api/teachers/manage-schools
 * @desc    Gère les affectations d'un enseignant à plusieurs écoles
 * @access  Private - SuperAdmin uniquement
 */
router.post('/manage-schools', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), teacherController_1.default.manageTeacherSchools);
exports.default = router;
