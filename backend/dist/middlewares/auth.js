"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySchoolAccess = exports.requireTeacher = exports.requireAdmin = exports.requireSuperAdmin = exports.verifyToken = exports.checkSchoolAccess = exports.checkRole = void 0;
const firebase_1 = require("../config/firebase");
// Détermine si nous sommes en mode développement
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';
const skipFirebaseAuth = process.env.SKIP_FIREBASE_AUTH === 'true';
console.log('Mode de développement:', isDevelopment ? 'activé' : 'désactivé');
console.log('Ignorer authentication Firebase:', skipFirebaseAuth ? 'oui' : 'non');
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Middleware pour vérifier les rôles des utilisateurs
 * @param allowedRoles Les rôles autorisés à accéder à la ressource
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // L'utilisateur doit déjà être authentifié via verifyToken
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }
        // Si le rôle n'est pas autorisé, renvoyer une erreur 403 Forbidden
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.'
        });
    };
};
exports.checkRole = checkRole;
/**
 * Middleware pour vérifier l'accès à un établissement spécifique
 * @param schoolIdParam Le nom du paramètre contenant l'ID de l'établissement
 */
const checkSchoolAccess = (schoolIdParam = 'schoolId') => {
    return async (req, res, next) => {
        try {
            // L'utilisateur doit déjà être authentifié via verifyToken
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentification requise'
                });
            }
            // Récupérer l'ID de l'établissement depuis les paramètres, le corps ou la requête
            const schoolId = req.params[schoolIdParam] || req.body[schoolIdParam] || req.query[schoolIdParam];
            if (!schoolId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de l\'établissement manquant'
                });
            }
            // Si l'utilisateur est un superAdmin, il a accès à tous les établissements
            if (req.user.role === 'superAdmin') {
                return next();
            }
            // Pour les admin, vérifier que l'établissement correspond à leur schoolId
            if (req.user.role === 'admin') {
                if (req.user.schoolId && req.user.schoolId.toString() === schoolId.toString()) {
                    return next();
                }
            }
            // Pour les enseignants, vérifier s'ils sont affectés à cet établissement
            if (req.user.role === 'teacher' && req.user.userId) {
                const teacherSchoolAssignment = await mongoose_1.default.model('TeacherSchoolAssignment').findOne({
                    teacherId: req.user.userId,
                    schoolId: schoolId
                });
                if (teacherSchoolAssignment) {
                    return next();
                }
            }
            // Si aucune des conditions n'est remplie, l'accès est refusé
            return res.status(403).json({
                success: false,
                message: 'Accès refusé à cet établissement'
            });
        }
        catch (error) {
            console.error('Erreur lors de la vérification de l\'accès à l\'établissement:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification de l\'accès'
            });
        }
    };
};
exports.checkSchoolAccess = checkSchoolAccess;
const verifyToken = async (req, res, next) => {
    try {
        // Si nous sommes en mode développement ET que nous voulons ignorer Firebase Auth
        if (isDevelopment && skipFirebaseAuth) {
            console.log('Mode développement: Authentification simulée activée');
            // Récupérer le rôle à partir du header x-dev-role (si présent)
            const devRole = req.headers['x-dev-role'] || 'admin';
            const validRoles = ['superAdmin', 'admin', 'teacher', 'student'];
            const role = validRoles.includes(devRole) ? devRole : 'admin';
            // Créer un utilisateur simulé pour le développement
            req.user = {
                uid: 'dev-uid-123',
                email: `dev-${role}@example.com`,
                role: role,
                schoolId: new mongoose_1.default.Types.ObjectId('000000000000000000000001'),
                userId: new mongoose_1.default.Types.ObjectId('000000000000000000000002'),
            };
            return next();
        }
        // Mode production - vérification réelle du token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé: Token manquant',
            });
        }
        const token = authHeader.split(' ')[1];
        try {
            // Vérifier le token avec Firebase
            const decodedToken = await firebase_1.auth.verifyIdToken(token);
            // Obtenir l'utilisateur depuis notre base de données MongoDB
            const user = await User_1.default.findOne({ firebaseUid: decodedToken.uid });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé dans la base de données',
                });
            }
            // Ajouter l'utilisateur à l'objet request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email || '',
                role: user.role,
                schoolId: user.schoolId,
                userId: user._id,
            };
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré',
                error: error.message,
            });
        }
    }
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur lors de l\'authentification',
        });
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware de vérification du rôle superAdmin
 */
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'superAdmin') {
        return res.status(403).json({
            success: false,
            message: 'Accès interdit: Rôle superAdmin requis',
        });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
/**
 * Middleware de vérification du rôle admin (inclut aussi superAdmin)
 */
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superAdmin') {
        return res.status(403).json({
            success: false,
            message: 'Accès interdit: Rôle admin ou superAdmin requis',
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware de vérification du rôle enseignant (inclut admin et superAdmin)
 */
const requireTeacher = (req, res, next) => {
    if (req.user?.role !== 'teacher' &&
        req.user?.role !== 'admin' &&
        req.user?.role !== 'superAdmin') {
        return res.status(403).json({
            success: false,
            message: 'Accès interdit: Rôle enseignant, admin ou superAdmin requis',
        });
    }
    next();
};
exports.requireTeacher = requireTeacher;
/**
 * Middleware pour vérifier l'accès à un établissement spécifique
 * Les superAdmins peuvent accéder à tous les établissements
 */
const verifySchoolAccess = (req, res, next) => {
    const schoolId = req.params.schoolId || req.body.schoolId;
    // SuperAdmin a accès à tous les établissements
    if (req.user?.role === 'superAdmin') {
        return next();
    }
    // Vérifier que l'utilisateur a accès à cet établissement
    if (!req.user?.schoolId || req.user.schoolId.toString() !== schoolId) {
        return res.status(403).json({
            success: false,
            message: 'Accès interdit: Vous n\'avez pas accès à cet établissement',
        });
    }
    next();
};
exports.verifySchoolAccess = verifySchoolAccess;
exports.default = { verifyToken: exports.verifyToken, requireSuperAdmin: exports.requireSuperAdmin, requireAdmin: exports.requireAdmin, requireTeacher: exports.requireTeacher, verifySchoolAccess: exports.verifySchoolAccess };
