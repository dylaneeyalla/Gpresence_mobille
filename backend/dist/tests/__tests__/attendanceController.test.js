"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attendanceController_1 = __importDefault(require("../../controllers/attendanceController"));
const setup_1 = require("../setup");
// Mock des modèles Mongoose
jest.mock('../../models/Attendance', () => {
    return {
        find: jest.fn(),
        findById: jest.fn(),
        prototype: {
            save: jest.fn()
        }
    };
});
jest.mock('../../models/ClassroomAssignment', () => {
    return {
        find: jest.fn(),
        findById: jest.fn()
    };
});
jest.mock('../../models/Student', () => {
    return {
        findById: jest.fn()
    };
});
jest.mock('../../models/User');
// Importer les modèles mockés pour y accéder dans les tests
const Attendance_1 = __importDefault(require("../../models/Attendance"));
const ClassroomAssignment_1 = __importDefault(require("../../models/ClassroomAssignment"));
const Student_1 = __importDefault(require("../../models/Student"));
describe('Attendance Controller', () => {
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
                email: 'teacher@example.com',
                role: 'teacher',
                userId: new mongoose_1.default.Types.ObjectId(),
                schoolId: new mongoose_1.default.Types.ObjectId()
            },
            params: {},
            body: {},
            query: {}
        };
        // Réinitialiser les mocks
        jest.clearAllMocks();
    });
    describe('createAttendance', () => {
        it('devrait créer un nouvel enregistrement de présence', async () => {
            // Configuration du test
            const attendanceData = {
                date: new Date(),
                classroomAssignmentId: new mongoose_1.default.Types.ObjectId(),
                studentAttendance: [
                    {
                        studentId: new mongoose_1.default.Types.ObjectId(),
                        status: 'present',
                        notes: 'À l\'heure'
                    }
                ]
            };
            mockRequest.body = attendanceData;
            // Mock de la fonction save
            Attendance_1.default.prototype.save.mockResolvedValue({
                _id: new mongoose_1.default.Types.ObjectId(),
                ...attendanceData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Mock des vérifications d'existence
            ClassroomAssignment_1.default.findById.mockResolvedValue({
                _id: attendanceData.classroomAssignmentId,
                teacherId: mockRequest.user?.userId
            });
            Student_1.default.findById.mockResolvedValue({
                _id: attendanceData.studentAttendance[0].studentId,
                classroomId: 'mock-classroom-id'
            });
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.createAttendance(mockRequest, mockResponse);
            // Vérifications
            expect(ClassroomAssignment_1.default.findById).toHaveBeenCalledWith(attendanceData.classroomAssignmentId);
            expect(Student_1.default.findById).toHaveBeenCalledWith(attendanceData.studentAttendance[0].studentId);
            expect(Attendance_1.default.prototype.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toHaveProperty('success', true);
        });
        it('devrait renvoyer une erreur si l\'assignation de classe n\'existe pas', async () => {
            // Configuration du test
            mockRequest.body = {
                date: new Date(),
                classroomAssignmentId: new mongoose_1.default.Types.ObjectId(),
                studentAttendance: []
            };
            // Mock : l'assignation de classe n'existe pas
            ClassroomAssignment_1.default.findById.mockResolvedValue(null);
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.createAttendance(mockRequest, mockResponse);
            // Vérifications
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('success', false);
            expect(responseObject.message).toContain('assignation de classe');
        });
    });
    describe('getAllAttendances', () => {
        it('devrait récupérer toutes les présences pour un admin', async () => {
            // Configuration avec un utilisateur admin
            mockRequest.user = (0, setup_1.createTestUser)('admin');
            const mockAttendances = [
                { _id: new mongoose_1.default.Types.ObjectId(), date: new Date() },
                { _id: new mongoose_1.default.Types.ObjectId(), date: new Date() }
            ];
            // Mock de la fonction find de Attendance
            Attendance_1.default.find.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockAttendances)
            }));
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.getAllAttendances(mockRequest, mockResponse);
            // Vérifications
            expect(Attendance_1.default.find).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('success', true);
            expect(responseObject).toHaveProperty('data');
            expect(responseObject.data).toHaveLength(2);
        });
        it('devrait filtrer les présences pour un enseignant', async () => {
            // Configuration avec un utilisateur enseignant
            mockRequest.user = (0, setup_1.createTestUser)('teacher');
            const mockAttendances = [
                { _id: new mongoose_1.default.Types.ObjectId(), date: new Date() }
            ];
            // Trouver d'abord les assignations de l'enseignant
            const mockAssignments = [
                { _id: new mongoose_1.default.Types.ObjectId() }
            ];
            ClassroomAssignment_1.default.find.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue(mockAssignments)
            }));
            // Ensuite trouver les présences
            Attendance_1.default.find.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockAttendances)
            }));
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.getAllAttendances(mockRequest, mockResponse);
            // Vérifications
            expect(ClassroomAssignment_1.default.find).toHaveBeenCalled();
            expect(Attendance_1.default.find).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('success', true);
            expect(responseObject.data).toHaveLength(1);
        });
    });
    describe('getAttendanceById', () => {
        it('devrait récupérer une présence par son ID', async () => {
            // Configuration du test
            const attendanceId = new mongoose_1.default.Types.ObjectId();
            mockRequest.params = { id: attendanceId.toString() };
            const mockAttendance = {
                _id: attendanceId,
                date: new Date(),
                classroomAssignmentId: new mongoose_1.default.Types.ObjectId(),
                studentAttendance: []
            };
            // Mock de la fonction findById de Attendance
            Attendance_1.default.findById.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockAttendance)
            }));
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.getAttendanceById(mockRequest, mockResponse);
            // Vérifications
            expect(Attendance_1.default.findById).toHaveBeenCalledWith(attendanceId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('success', true);
            expect(responseObject).toHaveProperty('data', mockAttendance);
        });
        it('devrait renvoyer une erreur si la présence n\'existe pas', async () => {
            // Configuration du test
            const attendanceId = new mongoose_1.default.Types.ObjectId();
            mockRequest.params = { id: attendanceId.toString() };
            // Mock : la présence n'existe pas
            Attendance_1.default.findById.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            }));
            // Exécuter la fonction du contrôleur
            await attendanceController_1.default.getAttendanceById(mockRequest, mockResponse);
            // Vérifications
            expect(Attendance_1.default.findById).toHaveBeenCalledWith(attendanceId);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('success', false);
            expect(responseObject.message).toContain('n\'existe pas');
        });
    });
});
