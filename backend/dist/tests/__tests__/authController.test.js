"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const authController_1 = __importDefault(require("../../controllers/authController"));
// Mocks des modèles Mongoose
jest.mock('../../models/User', () => {
    return {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn()
    };
});
jest.mock('../../models/School', () => {
    return {
        findById: jest.fn(),
        find: jest.fn()
    };
});
jest.mock('../../models/Teacher', () => {
    return {
        findById: jest.fn()
    };
});
jest.mock('../../models/Student', () => {
    return {
        findById: jest.fn()
    };
});
// Importer les modèles mockés pour y accéder dans les tests
const User_1 = __importDefault(require("../../models/User"));
const School_1 = __importDefault(require("../../models/School"));
// Mock des modules externes
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
describe('Auth Controller', () => {
    let mockRequest;
    let mockResponse;
    let responseObject = {};
    beforeEach(() => {
        // Réinitialiser les mocks avant chaque test
        jest.clearAllMocks();
        // Créer un objet mockResponse avec des fonctions simulées
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(result => {
                responseObject = result;
                return mockResponse;
            })
        };
        // Réinitialiser l'objet de réponse
        responseObject = {};
        // Créer un objet mockRequest avec des propriétés simulées
        mockRequest = {
            user: {
                uid: 'test-uid',
                email: 'admin@example.com',
                role: 'admin',
                userId: new mongoose_1.default.Types.ObjectId(),
                schoolId: new mongoose_1.default.Types.ObjectId()
            },
            params: {},
            body: {},
            query: {}
        };
        // Réinitialiser tous les mocks
        jest.clearAllMocks();
    });
    describe('registerUser', () => {
        it('devrait créer un nouvel utilisateur', async () => {
            // Configuration du test
            const userData = {
                firebaseUid: 'firebase-uid-123',
                email: 'john.doe@example.com',
                name: 'John Doe',
                role: 'admin',
                schoolId: new mongoose_1.default.Types.ObjectId().toString()
            };
            mockRequest.body = userData;
            // Mock User.findOne (l'utilisateur n'existe pas déjà)
            User_1.default.findOne.mockResolvedValue(null);
            // Mock User.create
            User_1.default.create.mockResolvedValue({
                _id: new mongoose_1.default.Types.ObjectId(),
                ...userData,
                lastLogin: new Date()
            });
            // Exécuter la fonction du contrôleur
            await authController_1.default.registerUser(mockRequest, mockResponse);
            // Vérifications
            expect(User_1.default.findOne).toHaveBeenCalledWith({ firebaseUid: userData.firebaseUid });
            expect(User_1.default.create).toHaveBeenCalledWith(expect.objectContaining({
                firebaseUid: userData.firebaseUid,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                schoolId: userData.schoolId,
                lastLogin: expect.any(Date)
            }));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toHaveProperty('success', true);
            expect(responseObject).toHaveProperty('message', 'Utilisateur enregistré avec succès');
        });
        it('devrait renvoyer une erreur si l\'utilisateur existe déjà', async () => {
            // Configuration du test
            mockRequest.body = {
                firebaseUid: 'existing-uid',
                email: 'existing@example.com',
                name: 'Existing User',
                role: 'admin'
            };
            // Mock : l'utilisateur existe déjà
            User_1.default.findOne.mockResolvedValue({
                _id: new mongoose_1.default.Types.ObjectId(),
                firebaseUid: 'existing-uid',
                email: 'existing@example.com'
            });
            // Exécuter la fonction du contrôleur
            await authController_1.default.registerUser(mockRequest, mockResponse);
            // Vérifications
            expect(User_1.default.findOne).toHaveBeenCalledWith({ firebaseUid: 'existing-uid' });
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('success', false);
            expect(responseObject.message).toContain('existe déjà');
        });
    });
    // Nous supprimons les tests de la méthode login car elle n'existe pas dans notre contrôleur
    // Notre authentification est gérée par Firebase Auth
    describe('getCurrentUser', () => {
        it('devrait renvoyer les informations de l\'utilisateur actuel', async () => {
            // Configuration du test
            const userId = new mongoose_1.default.Types.ObjectId();
            mockRequest.user = {
                uid: 'firebase-uid-123',
                userId,
                email: 'user@example.com',
                role: 'admin',
                schoolId: new mongoose_1.default.Types.ObjectId()
            };
            const userFromDb = {
                _id: userId,
                firstName: 'John',
                lastName: 'Doe',
                email: 'user@example.com',
                role: 'admin',
                schoolId: new mongoose_1.default.Types.ObjectId()
            };
            // Mock : récupération des infos de l'école
            School_1.default.findById.mockResolvedValue({
                _id: mockRequest.user.schoolId,
                name: 'Test School',
                address: '123 School St'
            });
            // Exécuter la fonction du contrôleur
            await authController_1.default.getCurrentUser(mockRequest, mockResponse);
            // Vérifications
            expect(School_1.default.findById).toHaveBeenCalledWith(mockRequest.user.schoolId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('success', true);
            expect(responseObject).toHaveProperty('data');
            expect(responseObject.data).toHaveProperty('uid', 'firebase-uid-123');
            expect(responseObject.data).toHaveProperty('role', 'admin');
        });
    });
});
