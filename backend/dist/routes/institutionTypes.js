"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const institutionTypeController_1 = __importDefault(require("../controllers/institutionTypeController"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/institution-types
 * @desc    Récupère tous les types d'établissements
 * @access  Private - Tous les utilisateurs authentifiés
 * @query   active - Optionnel, pour filtrer par statut (true/false)
 * @query   sector - Optionnel, pour filtrer par secteur (PUBLIC, PRIVATE, SEMI_PRIVATE)
 */
router.get('/', auth_1.verifyToken, institutionTypeController_1.default.getAllInstitutionTypes);
/**
 * @route   GET /api/institution-types/:id
 * @desc    Récupère un type d'établissement par son ID
 * @access  Private - Tous les utilisateurs authentifiés
 */
/**
 * @route   GET /api/institution-types/stats
 * @desc    Récupère les statistiques sur les types d'établissements
 * @access  Private - SuperAdmin, Admin
 */
router.get('/stats', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin', 'admin']), institutionTypeController_1.default.getInstitutionTypeStats);
/**
 * @route   GET /api/institution-types/:id
 * @desc    Récupère un type d'établissement par son ID
 * @access  Private - Tous les utilisateurs authentifiés
 */
router.get('/:id', auth_1.verifyToken, institutionTypeController_1.default.getInstitutionTypeById);
/**
 * @route   POST /api/institution-types
 * @desc    Crée un nouveau type d'établissement
 * @access  Private - SuperAdmin uniquement
 */
router.post('/', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), institutionTypeController_1.default.createInstitutionType);
/**
 * @route   PUT /api/institution-types/:id
 * @desc    Met à jour un type d'établissement existant
 * @access  Private - SuperAdmin uniquement
 */
router.put('/:id', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), institutionTypeController_1.default.updateInstitutionType);
/**
 * @route   PATCH /api/institution-types/:id/toggle-status
 * @desc    Active ou désactive un type d'établissement
 * @access  Private - SuperAdmin uniquement
 */
router.patch('/:id/toggle-status', auth_1.verifyToken, (0, auth_1.checkRole)(['superAdmin']), institutionTypeController_1.default.toggleInstitutionTypeStatus);
exports.default = router;
