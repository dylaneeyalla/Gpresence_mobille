"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subjectController_1 = __importDefault(require("../controllers/subjectController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/subjects
 * @desc    Récupère toutes les matières (filtrées selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/', auth_1.verifyToken, subjectController_1.default.getAllSubjects);
/**
 * @route   GET /api/subjects/school/:schoolId
 * @desc    Récupère toutes les matières d'une école spécifique
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de l'école
 */
router.get('/school/:schoolId', auth_1.verifyToken, (0, auth_1.checkSchoolAccess)('schoolId'), subjectController_1.default.getSubjectsBySchool);
/**
 * @route   GET /api/subjects/:id
 * @desc    Récupère une matière par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant de l'école
 */
router.get('/:id', auth_1.verifyToken, subjectController_1.default.getSubjectById);
/**
 * @route   POST /api/subjects
 * @desc    Crée une nouvelle matière
 * @access  Private - SuperAdmin, Admin (pour son école uniquement)
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), subjectController_1.default.createSubject);
/**
 * @route   PUT /api/subjects/:id
 * @desc    Met à jour une matière existante
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), subjectController_1.default.updateSubject);
/**
 * @route   DELETE /api/subjects/:id
 * @desc    Supprime une matière
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), subjectController_1.default.deleteSubject);
exports.default = router;
