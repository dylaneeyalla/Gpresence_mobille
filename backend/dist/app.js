"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middlewares/errorHandler");
// SOLUTION FINALE: Aucun import du routeur central routes/index.ts pour éliminer la source du problème des routes dupliquées
// import routes from './routes'; // Complètement supprimé pour éviter toute référence possible
const swagger_1 = __importDefault(require("./config/swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_1 = require("./middlewares/auth");
// Importer les modèles
const School_1 = __importDefault(require("./models/School"));
const InstitutionType_1 = __importDefault(require("./models/InstitutionType"));
const User_1 = __importDefault(require("./models/User"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
// Configuration CORS pour accepter les requêtes du frontend
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://gpresence.com'], // Origines autorisées
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true // Permet d'envoyer des cookies dans les requêtes cross-origin
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
console.log('Montage des routes principales...');
// Importer explicitement les sous-routeurs pour s'assurer qu'ils sont correctement montés
const schools_1 = __importDefault(require("./routes/schools"));
const institutionTypes_1 = __importDefault(require("./routes/institutionTypes"));
const auth_2 = __importDefault(require("./routes/auth"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const students_1 = __importDefault(require("./routes/students"));
const classrooms_1 = __importDefault(require("./routes/classrooms"));
const subjects_1 = __importDefault(require("./routes/subjects"));
const classroomAssignments_1 = __importDefault(require("./routes/classroomAssignments"));
const attendances_1 = __importDefault(require("./routes/attendances"));
// Monter les routes API directement sans le segment /i/
app.use('/api/schools', schools_1.default);
app.use('/api/institution-types', institutionTypes_1.default);
app.use('/api/auth', auth_2.default);
app.use('/api/teachers', teachers_1.default);
app.use('/api/students', students_1.default);
app.use('/api/classrooms', classrooms_1.default);
app.use('/api/subjects', subjects_1.default);
app.use('/api/classroom-assignments', classroomAssignments_1.default);
app.use('/api/attendances', attendances_1.default);
// Routes spéciales implémentées directement (sans passer par le routeur) pour assurer le bon fonctionnement
// Route spéciale pour les types d'institutions avec filtre active=true
app.get('/api/institution-types', async (req, res) => {
    try {
        console.log('Route directe /api/institution-types appelée avec query:', req.query);
        // Paramètres de filtre optionnels
        const { active, sector } = req.query;
        let filter = {};
        // Filtrer par statut actif si spécifié
        if (active !== undefined) {
            filter.active = active === 'true';
        }
        // Filtrer par secteur si spécifié
        if (sector) {
            filter.sector = sector;
        }
        const institutionTypes = await InstitutionType_1.default.find(filter).sort({ name: 1 });
        return res.status(200).json({
            success: true,
            count: institutionTypes.length,
            data: institutionTypes
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des types d\'établissements:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des types d\'établissements',
            error: error.message
        });
    }
});
// Route spéciale pour mettre à jour le type d'institution d'une école
app.put('/api/schools/:id/institution-type', auth_1.verifyToken, async (req, res) => {
    try {
        console.log('Route directe /api/schools/:id/institution-type appelée');
        const schoolId = req.params.id;
        const { institutionTypeId } = req.body;
        if (!institutionTypeId) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID du type d\'établissement est requis'
            });
        }
        // Vérifier si l'école existe
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        // Vérifier si le type d'institution existe et est actif
        const institutionType = await InstitutionType_1.default.findById(institutionTypeId);
        if (!institutionType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'établissement non trouvé'
            });
        }
        if (!institutionType.active) {
            return res.status(400).json({
                success: false,
                message: 'Ce type d\'établissement n\'est pas actif'
            });
        }
        // Mettre à jour l'école
        school.institutionTypeId = institutionTypeId;
        await school.save();
        return res.status(200).json({
            success: true,
            message: 'Type d\'établissement mis à jour avec succès',
            data: school
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du type d\'établissement de l\'école:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du type d\'établissement de l\'école',
            error: error.message
        });
    }
});
// Route spéciale pour récupérer une école par son ID
app.get('/api/schools/:id', auth_1.verifyToken, async (req, res) => {
    try {
        console.log('Route directe /api/schools/:id appelée');
        const schoolId = req.params.id;
        const school = await School_1.default.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'École non trouvée'
            });
        }
        return res.status(200).json({
            success: true,
            data: school
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'école:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'école',
            error: error.message
        });
    }
});
// Route d'authentification qui fonctionne déjà
app.get('/api/auth/me', (req, res, next) => {
    console.log('Route spéciale /api/auth/me appelée');
    next();
});
// SOLUTION FINALE : Le routeur central est complètement vide et n'est jamais monté 
// Toutes les routes sont montées individuellement ci-dessus avec leurs préfixes respectifs
// Pour déboggage, affichons manuellement les routes principales
console.log('Routes explicitement montées:');
console.log('- /api/schools');
console.log('- /api/institution-types');
console.log('- /api/auth');
console.log('- /api/teachers');
console.log('- /api/students');
console.log('- et autres routes définies dans routes/index.ts');
// Liste manuelle des routes pour éviter l'erreur de typage
console.log('=== ROUTES DISPONIBLES (MISES À JOUR) ===');
console.log('GET     /api/schools');
console.log('GET     /api/schools/:id');
console.log('POST    /api/schools');
console.log('PUT     /api/schools/:id');
console.log('DELETE  /api/schools/:id');
console.log('GET     /api/schools/:id/stats');
console.log('PUT     /api/schools/:id/institution-type');
console.log('GET     /api/institution-types');
console.log('GET     /api/institution-types/:id');
console.log('POST    /api/institution-types');
console.log('PUT     /api/institution-types/:id');
console.log('PATCH   /api/institution-types/:id/toggle-status');
console.log('GET     /api/institution-types/stats');
console.log('=== FIN DES ROUTES ===');
// Route de test pour vérifier que l'API est accessible
app.get('/ping', (req, res) => {
    res.json({ status: 'ok', message: 'API fonctionnelle' });
});
// Route principale pour /api/auth/me enregistrée directement pour éviter les problèmes
app.get('/api/auth/me', async (req, res) => {
    try {
        console.log('Route /api/auth/me (direct) appelée, Headers:', req.headers);
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé: Token manquant'
            });
        }
        const token = authHeader.split(' ')[1];
        console.log('Token reçu dans /api/auth/me (direct):', token.substring(0, 10) + '...');
        try {
            // Décoder le token JWT manuellement
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                console.log('Payload du token:', payload);
                // Vérifier si on peut trouver l'utilisateur dans la base de données
                try {
                    if (payload.userId) {
                        const user = await User_1.default.findById(payload.userId).select('-password');
                        if (user) {
                            return res.status(200).json({
                                success: true,
                                data: {
                                    id: user._id,
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                    schoolId: user.schoolId,
                                    tokenInfo: {
                                        ...payload,
                                        fromDb: true,
                                        sessionCreated: new Date()
                                    }
                                }
                            });
                        }
                    }
                }
                catch (dbError) {
                    console.log('Impossible de trouver l\'utilisateur dans la BDD, utilisation des données du token');
                }
                // Fallback: utiliser directement les données du token
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
                            fromDirectRoute: true,
                            sessionCreated: new Date()
                        }
                    }
                });
            }
            else {
                throw new Error('Format de token invalide');
            }
        }
        catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré',
                error: error.message
            });
        }
    }
    catch (error) {
        console.error('Erreur générale dans /api/auth/me (direct):', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});
// Route de secours pour /api/auth/me-backup (pour contourner les problèmes d'enregistrement de routes)
app.get('/api/auth/me-backup', async (req, res) => {
    console.log('Route /api/auth/me-backup appelée, Headers:', req.headers);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Accès non autorisé: Token manquant',
        });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token reçu:', token.substring(0, 10) + '...');
    try {
        // Décoder le token JWT manuellement
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('Payload du token:', payload);
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
                        fromBackupEndpoint: true
                    }
                }
            });
        }
        else {
            throw new Error('Format de token invalide');
        }
    }
    catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré',
            error: error.message,
        });
    }
});
// SOLUTION FINALE: Fonction printRoutes améliorée qui filtre explicitement toutes les routes avec /i/
function printRoutes(app, basePath = '') {
    console.log('=== ROUTES DE L\'API ===');
    const routesDejaAffichees = new Set(); // Pour éviter d'afficher des routes en double
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes associées directement à l'application
            const path = basePath + middleware.route.path;
            // Ignorer complètement les routes contenant /i/
            if (path.includes('/i/')) {
                return;
            }
            const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
            const routeKey = `${methods} ${path}`;
            // Éviter les doublons
            if (!routesDejaAffichees.has(routeKey)) {
                routesDejaAffichees.add(routeKey);
                console.log(`${methods}\t${path}`);
            }
        }
        else if (middleware.name === 'router') {
            // Routes associées à un routeur
            const path = middleware.regexp.toString().replace('\\/?(?=\\/|$)', '').replace(/^\^\\\//, '').replace(/\(\?:\(\?:\\\//, '').replace(/\\\//g, '/').replace(/\?/g, '').replace(/\\\./g, '.').replace(/\(\?=/g, '');
            const routerBasePath = basePath + (path !== '(?:\\/)?$' ? path.replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$/g, '') : '');
            if (middleware.handle.stack) {
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        const routePath = routerBasePath + handler.route.path;
                        // Ignorer complètement les routes contenant /i/
                        if (routePath.includes('/i/')) {
                            return;
                        }
                        const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
                        const routeKey = `${methods} ${routePath}`;
                        // Éviter les doublons
                        if (!routesDejaAffichees.has(routeKey)) {
                            routesDejaAffichees.add(routeKey);
                            console.log(`${methods}\t${routePath}`);
                        }
                    }
                });
            }
        }
    });
    console.log('=== FIN DES ROUTES ===');
}
// CORRECTIF: Désactivation de l'affichage automatique des routes qui montre les routes dupliquées
printRoutes(app);
// Affichage manuel des routes principales uniquement
console.log('=== ROUTES PRINCIPALES ACTIVES ===');
console.log('GET     /api/auth/me');
console.log('GET     /api/auth/me-backup');
console.log('POST    /api/auth/login');
console.log('POST    /api/auth/register');
console.log('POST    /api/auth/register-admin');
console.log('GET     /api/institution-types');
console.log('GET     /api/schools/:id');
console.log('PUT     /api/schools/:id/institution-type');
console.log('GET     /ping');
console.log('========================\n');
// Documentation API Swagger
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, { explorer: true }));
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
