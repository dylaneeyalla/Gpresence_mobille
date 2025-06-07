"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdmin = exports.assignTeacherToSchools = exports.registerUser = exports.checkUserRole = exports.getCurrentUser = exports.me = exports.login = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const User_1 = __importDefault(require("../models/User"));
const School_1 = __importDefault(require("../models/School"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const Student_1 = __importDefault(require("../models/Student"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
// Pour la génération de token JWT
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Récupère le profil de l'utilisateur connecté
 */
/**
 * Authentifie un utilisateur avec email et mot de passe
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation des champs requis
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un email et un mot de passe'
            });
        }
        try {
            // Vérifier que l'utilisateur existe dans notre base de données MongoDB
            const user = await User_1.default.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé dans la base de données'
                });
            }
            // Dans une application réelle, vous vérifieriez Firebase ici
            // Pour le moment, nous supposons que l'utilisateur est valide s'il existe dans MongoDB
            let firebaseUid = user.firebaseUid || 'unknown-uid';
            // Générer un JWT pour notre API
            const token = jsonwebtoken_1.default.sign({
                uid: firebaseUid,
                email: email,
                role: user.role,
                schoolId: user.schoolId,
                userId: user._id
            }, process.env.JWT_SECRET || 'votre_secret_jwt_par_defaut', { expiresIn: '7d' });
            // Retourner le token et les infos utilisateur
            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId
                }
            });
        }
        catch (authError) {
            console.error('Erreur d\'authentification:', authError);
            // Gérer les différents types d'erreurs Firebase
            let errorMessage = 'Erreur d\'authentification';
            let statusCode = 401;
            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                errorMessage = 'Email ou mot de passe incorrect';
            }
            else if (authError.code === 'auth/too-many-requests') {
                errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
                statusCode = 429;
            }
            else if (authError.code === 'auth/user-disabled') {
                errorMessage = 'Ce compte a été désactivé.';
                statusCode = 403;
            }
            return res.status(statusCode).json({
                success: false,
                message: errorMessage,
                error: authError.message
            });
        }
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};
exports.login = login;
/**
 * Récupère le profil de l'utilisateur connecté - Version ultra simpliée
 * Implémente la même logique que la route de secours /api/auth/me-backup
 */
const me = async (req, res) => {
    try {
        console.log('Route /api/auth/me appelée, Headers:', req.headers);
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé: Token manquant',
            });
        }
        const token = authHeader.split(' ')[1];
        console.log('Token reçu dans /api/auth/me:', token.substring(0, 10) + '...');
        // Déterminer si l'utilisateur existe déjà dans req.user (ajouté par middleware)
        if (req.user) {
            const { uid, email, role, schoolId, userId } = req.user;
            console.log('Utilisateur trouvé via middleware:', { uid, email, role });
            // Essayer de récupérer plus d'informations depuis la base de données
            try {
                if (userId) {
                    const user = await User_1.default.findById(userId).select('-password');
                    if (user) {
                        return res.status(200).json({
                            success: true,
                            data: {
                                id: user._id,
                                name: user.name || (email ? email.split('@')[0] : 'Utilisateur'),
                                email: user.email,
                                role: user.role,
                                schoolId: user.schoolId,
                                tokenInfo: {
                                    uid,
                                    sessionCreated: new Date(),
                                    isVerified: true
                                }
                            }
                        });
                    }
                }
            }
            catch (dbError) {
                console.error('Erreur lors de la recherche dans la BDD:', dbError);
            }
            // Fallback avec les données du req.user si la BDD n'a pas répondu
            return res.status(200).json({
                success: true,
                data: {
                    id: userId || 'unknown',
                    email,
                    role,
                    schoolId,
                    name: email ? email.split('@')[0] : 'Utilisateur',
                    tokenInfo: {
                        uid,
                        fromToken: true,
                        fromReqUser: true,
                        sessionCreated: new Date()
                    }
                }
            });
        }
        // Si req.user n'existe pas, décoder le token manuellement
        try {
            // Décoder le token JWT comme dans la route de secours
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                console.log('Payload du token décodé manuellement:', payload);
                return res.status(200).json({
                    success: true,
                    data: {
                        id: payload.userId || 'unknown',
                        email: payload.email,
                        role: payload.role,
                        schoolId: payload.schoolId,
                        name: payload.email ? payload.email.split('@')[0] : 'Utilisateur',
                        tokenInfo: {
                            ...payload,
                            manuallyDecoded: true,
                            sessionCreated: new Date()
                        }
                    }
                });
            }
            else {
                throw new Error('Format de token invalide');
            }
        }
        catch (decodeError) {
            console.error('Erreur lors du décodage manuel du token:', decodeError);
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré',
                error: decodeError.message,
            });
        }
    }
    catch (error) {
        console.error('Erreur générale dans /api/auth/me:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};
exports.me = me;
/**
 * Récupère le profil de l'utilisateur connecté
 */
const getCurrentUser = async (req, res) => {
    try {
        // L'utilisateur est déjà vérifié par le middleware verifyToken
        const { uid, role, schoolId, userId } = req.user;
        // Récupérer plus d'informations selon le rôle
        let userDetails = {};
        let schools = [];
        if (role === 'teacher') {
            const teacher = await Teacher_1.default.findById(userId);
            if (teacher) {
                userDetails = {
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    email: teacher.email,
                    phone: teacher.phone,
                    image: teacher.image
                };
                // Pour les enseignants, récupérer tous les établissements auxquels ils sont affectés
                const assignments = await TeacherSchoolAssignment_1.default.find({ teacherId: userId });
                if (assignments.length > 0) {
                    const schoolIds = assignments.map(a => a.schoolId);
                    schools = await School_1.default.find({ _id: { $in: schoolIds } }).select('name address');
                }
            }
        }
        else if (role === 'student') {
            const student = await Student_1.default.findById(userId);
            if (student) {
                userDetails = {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    email: student.email,
                    classId: student.classId
                };
            }
        }
        else if (role === 'admin' || role === 'superAdmin') {
            // Pour les admins, récupérer les infos de l'école
            if (schoolId) {
                const school = await School_1.default.findById(schoolId);
                if (school) {
                    userDetails = {
                        schoolName: school.name,
                        schoolAddress: school.address
                    };
                }
            }
            // Pour les superAdmins, récupérer toutes les écoles
            if (role === 'superAdmin') {
                schools = await School_1.default.find().select('name address');
            }
        }
        // Réponse formatée pour fonctionner avec le composant ProtectedRoute
        return res.status(200).json({
            success: true,
            data: {
                uid,
                role,
                schoolId: schoolId?.toString(),
                userId: userId?.toString(),
                ...userDetails,
                schools
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil utilisateur'
        });
    }
};
exports.getCurrentUser = getCurrentUser;
/**
 * Vérifie le rôle de l'utilisateur pour les ProtectedRoute
 */
const checkUserRole = async (req, res) => {
    try {
        // L'utilisateur est déjà vérifié par le middleware verifyToken
        const { role } = req.user;
        const requiredRole = req.params.role;
        let hasAccess = false;
        // Vérification du rôle selon la logique du composant ProtectedRoute
        switch (requiredRole) {
            case 'superAdmin':
                hasAccess = role === 'superAdmin';
                break;
            case 'admin':
                hasAccess = role === 'admin' || role === 'superAdmin';
                break;
            case 'teacher':
                hasAccess = role === 'teacher' || role === 'admin' || role === 'superAdmin';
                break;
            case 'student':
                hasAccess = ['student', 'teacher', 'admin', 'superAdmin'].includes(role);
                break;
            default:
                hasAccess = false;
        }
        if (hasAccess) {
            return res.status(200).json({
                success: true,
                message: 'Accès autorisé',
                hasAccess: true
            });
        }
        else {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle ${requiredRole} requis.`,
                hasAccess: false
            });
        }
    }
    catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du rôle',
            hasAccess: false
        });
    }
};
exports.checkUserRole = checkUserRole;
/**
 * Enregistre un nouvel utilisateur dans la base de données
 * (Une fois que l'utilisateur est créé dans Firebase Auth)
 */
const registerUser = async (req, res) => {
    try {
        const { firebaseUid, email, name, role, schoolId } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User_1.default.findOne({ firebaseUid });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet utilisateur existe déjà'
            });
        }
        // Seuls les superAdmin peuvent créer d'autres superAdmin
        if (role === 'superAdmin' && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Seuls les superAdmin peuvent créer d\'autres superAdmin'
            });
        }
        // Créer l'utilisateur dans notre base de données
        const newUser = await User_1.default.create({
            firebaseUid,
            email,
            name,
            role,
            schoolId,
            lastLogin: new Date()
        });
        return res.status(201).json({
            success: true,
            data: newUser,
            message: 'Utilisateur enregistré avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de l\'utilisateur'
        });
    }
};
exports.registerUser = registerUser;
/**
 * Attribue un enseignant à plusieurs établissements
 * (Réservé aux superAdmin)
 */
const assignTeacherToSchools = async (req, res) => {
    try {
        const { teacherId, schoolIds, primarySchoolId } = req.body;
        // Vérifier que l'utilisateur est un superAdmin
        if (req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Seuls les superAdmin peuvent affecter un enseignant à plusieurs établissements'
            });
        }
        // Vérifier que l'enseignant existe
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        // Vérifier que tous les établissements existent
        const schoolsCount = await School_1.default.countDocuments({ _id: { $in: schoolIds } });
        if (schoolsCount !== schoolIds.length) {
            return res.status(404).json({
                success: false,
                message: 'Un ou plusieurs établissements n\'existent pas'
            });
        }
        // Supprimer toutes les assignations existantes
        await TeacherSchoolAssignment_1.default.deleteMany({ teacherId });
        // Créer les nouvelles assignations
        const assignments = [];
        for (const schoolId of schoolIds) {
            const isPrimary = schoolId.toString() === primarySchoolId.toString();
            const assignment = await TeacherSchoolAssignment_1.default.create({
                teacherId,
                schoolId,
                isPrimary
            });
            assignments.push(assignment);
        }
        // Mettre à jour l'école principale de l'enseignant
        if (primarySchoolId) {
            await Teacher_1.default.findByIdAndUpdate(teacherId, { schoolId: primarySchoolId });
        }
        return res.status(200).json({
            success: true,
            data: assignments,
            message: 'Enseignant affecté aux établissements avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'affectation de l\'enseignant:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'affectation de l\'enseignant'
        });
    }
};
exports.assignTeacherToSchools = assignTeacherToSchools;
/**
 * Enregistre un nouvel administrateur et crée une école associée
 * Cette fonction est accessible publiquement pour créer le premier compte administrateur
 */
const registerAdmin = async (req, res) => {
    // Déclarer email en dehors du bloc try pour qu'il soit accessible partout
    let userEmail = '';
    try {
        const { firstName, lastName, email, phone, schoolName, password, role } = req.body;
        // Stocker l'email dans la variable externe pour qu'il soit accessible dans le bloc catch
        userEmail = email;
        // Vérifier que tous les champs obligatoires sont fournis
        if (!firstName || !lastName || !email || !phone || !schoolName || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont obligatoires'
            });
        }
        // Vérifier que le rôle est bien 'admin'
        if (role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Rôle invalide'
            });
        }
        // Vérifions si l'utilisateur existe déjà dans Firebase
        let userId = '';
        try {
            const userRecord = await firebase_1.default.auth().getUserByEmail(email);
            if (userRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }
        }
        catch (error) {
            // Si l'erreur est 'auth/user-not-found', c'est normal et nous pouvons continuer
            if (error.code !== 'auth/user-not-found') {
                console.error('Erreur lors de la vérification de l\'utilisateur:', error);
                throw error;
            }
        }
        try {
            // Créer l'utilisateur dans Firebase Auth
            console.log('Création de l\'utilisateur dans Firebase Auth:', email);
            const userRecord = await firebase_1.default.auth().createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
                emailVerified: true
            });
            // Attribuer le rôle 'admin' dans Firebase Auth
            await firebase_1.default.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });
            userId = userRecord.uid;
            console.log('Utilisateur créé avec succès dans Firebase Auth, UID:', userId);
        }
        catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur dans Firebase:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'utilisateur dans Firebase',
                error: error.message
            });
        }
        // Créer l'école dans la base de données avec tous les champs requis
        const school = await School_1.default.create({
            name: schoolName,
            address: 'Adresse à compléter', // Ajout d'une adresse par défaut
            phone: phone || '0000000000', // Utilisation du numéro de téléphone fourni ou valeur par défaut
            email: email, // Utilisation de l'email de l'administrateur pour l'école
            createdAt: new Date()
        });
        // Créer l'utilisateur dans notre base de données
        const user = await User_1.default.create({
            firebaseUid: userId, // Utilisation de l'ID Firebase généré
            email,
            name: `${firstName} ${lastName}`,
            role: 'admin',
            schoolId: school._id,
            lastLogin: new Date()
        });
        return res.status(201).json({
            success: true,
            message: 'Compte administrateur créé avec succès',
            data: {
                admin: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                school: {
                    id: school._id,
                    name: school.name
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'administrateur:', error);
        // Si l'erreur est due à une contrainte d'unicité dans MongoDB
        if (error.code === 11000 || error.message.includes('duplicate key')) {
            // Essayons plutôt de récupérer l'utilisateur existant avec l'email stocké en dehors du bloc try
            try {
                if (!userEmail) {
                    console.error('userEmail n\'est pas défini');
                    return res.status(400).json({
                        success: false,
                        message: 'Email non disponible pour la recherche'
                    });
                }
                const existingUser = await User_1.default.findOne({ email: userEmail });
                if (existingUser) {
                    return res.status(200).json({
                        success: true,
                        message: 'Un compte avec cet email existe déjà. Veuillez vous connecter.',
                        data: {
                            admin: {
                                id: existingUser._id,
                                name: existingUser.name,
                                email: existingUser.email,
                                role: existingUser.role
                            }
                        }
                    });
                }
            }
            catch (findError) {
                console.error('Erreur lors de la recherche de l\'utilisateur existant:', findError);
            }
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email ou cet identifiant Firebase existe déjà'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de l\'administrateur',
            error: error.message
        });
    }
};
exports.registerAdmin = registerAdmin;
exports.default = {
    getCurrentUser: exports.getCurrentUser,
    checkUserRole: exports.checkUserRole,
    registerUser: exports.registerUser,
    assignTeacherToSchools: exports.assignTeacherToSchools,
    registerAdmin: exports.registerAdmin,
    login: exports.login,
    me: exports.me
};
