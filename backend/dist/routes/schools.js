"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schoolController_1 = __importDefault(require("../controllers/schoolController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/schools
 * @desc    Récupère toutes les écoles (filtrées selon le rôle de l'utilisateur)
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/', auth_1.verifyToken, schoolController_1.default.getAllSchools);
/**
 * @route   GET /api/schools/:id
 * @desc    Récupère une école par son ID
 * @access  Private - SuperAdmin, Admin de l'école, Enseignant assigné à l'école
 */
router.get('/:id', auth_1.verifyToken, schoolController_1.default.getSchoolById);
/**
 * @route   POST /api/schools
 * @desc    Crée une nouvelle école
 * @access  Private - SuperAdmin uniquement
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), schoolController_1.default.createSchool);
/**
 * @route   PUT /api/schools/:id
 * @desc    Met à jour une école existante
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), schoolController_1.default.updateSchool);
/**
 * @route   DELETE /api/schools/:id
 * @desc    Supprime une école
 * @access  Private - SuperAdmin uniquement
 */
router.delete('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), schoolController_1.default.deleteSchool);
/**
 * @route   GET /api/schools/:id/stats
 * @desc    Récupère les statistiques d'une école
 * @access  Private - SuperAdmin, Admin de l'école
 */
router.get('/:id/stats', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), schoolController_1.default.getSchoolStats);
/**
 * @route   PUT /api/schools/:id/institution-type
 * @desc    Met à jour le type d'établissement d'une école
 * @access  Private - SuperAdmin, Admin de l'école (une seule fois pour l'admin)
 */
router.put('/:id/institution-type', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), schoolController_1.default.updateInstitutionType);
exports.default = router;
