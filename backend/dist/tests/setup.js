"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = void 0;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Variable globale pour stocker l'instance de MongoDB en mémoire
let mongoServer;
// Configuration avant tous les tests
beforeAll(async () => {
    // Créer une instance MongoDB en mémoire pour les tests
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connecter mongoose à la base de données de test
    await mongoose_1.default.connect(mongoUri);
    console.log(`MongoDB en mémoire connectée à ${mongoUri}`);
});
// Nettoyage après chaque test
afterEach(async () => {
    // Vider toutes les collections après chaque test
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
// Nettoyage après tous les tests
afterAll(async () => {
    // Fermer la connexion à la base de données
    await mongoose_1.default.disconnect();
    // Arrêter le serveur MongoDB en mémoire
    await mongoServer.stop();
    console.log('Connexion à la base de données fermée et serveur MongoDB arrêté');
});
// Fonction utilitaire pour créer un utilisateur de test avec un token fictif
const createTestUser = (role, schoolId) => {
    return {
        uid: 'test-uid',
        email: `test-${role}@example.com`,
        role,
        schoolId,
        userId: new mongoose_1.default.Types.ObjectId(),
    };
};
exports.createTestUser = createTestUser;
// Mock pour le middleware d'authentification
jest.mock('../middlewares/auth', () => {
    const originalModule = jest.requireActual('../middlewares/auth');
    return {
        ...originalModule,
        // Mock du middleware verifyToken
        verifyToken: (req, res, next) => {
            // On considère l'utilisateur comme authentifié par défaut dans les tests
            if (!req.user) {
                req.user = (0, exports.createTestUser)('admin');
            }
            next();
        },
        // Mock du middleware checkRole
        checkRole: (allowedRoles) => {
            return (req, res, next) => {
                if (!req.user) {
                    req.user = (0, exports.createTestUser)('admin');
                }
                if (allowedRoles.includes(req.user.role)) {
                    next();
                }
                else {
                    res.status(403).json({
                        success: false,
                        message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.'
                    });
                }
            };
        },
        // Mock du middleware checkSchoolAccess
        checkSchoolAccess: (schoolIdParam = 'schoolId') => {
            return (req, res, next) => {
                if (!req.user) {
                    req.user = (0, exports.createTestUser)('admin');
                }
                // Simuler l'accès autorisé à l'école pour les tests
                next();
            };
        }
    };
});
