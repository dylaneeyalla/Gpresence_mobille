"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   POST /api/auth/login
 * @desc    Authentifier un utilisateur et générer un token JWT
 * @access  Public
 */
router.post('/login', authController_1.default.login);
/**
 * @route   GET /api/auth/me
 * @desc    Récupérer les informations complètes de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', auth_1.verifyToken, authController_1.default.me);
/**
 * @route   GET /api/auth/check-role/:role
 * @desc    Vérifier si l'utilisateur a le rôle spécifié (utile pour le composant ProtectedRoute)
 * @access  Private
 */
router.get('/check-role/:role', auth_1.verifyToken, authController_1.default.checkUserRole);
/**
 * @route   POST /api/auth/register
 * @desc    Enregistrer un nouvel utilisateur dans la base de données
 * @access  Private - Admin/SuperAdmin
 */
router.post('/register', auth_1.verifyToken, (0, auth_1.checkRole)(['admin', 'superAdmin']), authController_1.default.registerUser);
/**
 * @route   POST /api/auth/register-admin
 * @desc    Enregistrer un administrateur et créer une école associée (accessible publiquement)
 * @access  Public
 */
router.post('/register-admin', authController_1.default.registerAdmin);
/**
 * @route   POST /api/auth/assign-teacher
 * @desc    Affecter un enseignant à plusieurs établissements
 * @access  Private - SuperAdmin uniquement
 */
router.post('/assign-teacher', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), authController_1.default.assignTeacherToSchools);
exports.default = router;
