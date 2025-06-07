"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.auth = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
// Vérifier si nous sommes en mode développement ou si nous devons sauter l'auth Firebase
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';
const skipFirebaseAuth = process.env.SKIP_FIREBASE_AUTH === 'true';
// Vérifie si Firebase Admin est déjà initialisé pour éviter de multiples initialisations
if (!admin.apps.length) {
    try {
        // Si le mode développement est activé et que nous voulons ignorer l'authentification Firebase
        if (isDevelopment && skipFirebaseAuth) {
            console.log('Mode développement: Initialisation de Firebase en mode simulation');
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'development-mode',
                // @ts-ignore - pour le développement uniquement
                credential: { getAccessToken: () => Promise.resolve({ access_token: 'dummy-token', expires_in: 3600 }) }
            });
        }
        // Utiliser un fichier de compte de service Firebase réel
        else if (process.env.FIREBASE_PROJECT_ID) {
            try {
                // Tenter de charger le fichier de compte de service
                const serviceAccountPath = path_1.default.join(__dirname, 'firebase-service-account.json');
                let serviceAccount;
                if (fs_1.default.existsSync(serviceAccountPath)) {
                    // Utiliser le fichier de compte de service local
                    serviceAccount = JSON.parse(fs_1.default.readFileSync(serviceAccountPath, 'utf8'));
                    console.log('Fichier de compte de service Firebase chargé avec succès');
                }
                else {
                    // Utiliser les variables d'environnement comme solution de repli
                    console.log('Fichier de compte de service non trouvé, utilisation des variables d\'environnement');
                    serviceAccount = {
                        type: 'service_account',
                        project_id: process.env.FIREBASE_PROJECT_ID,
                        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'custom-key-id',
                        private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                        client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
                        client_id: process.env.FIREBASE_APP_ID || '000000000000',
                        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                        token_uri: 'https://oauth2.googleapis.com/token',
                        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
                    };
                }
                // Initialiser Firebase Admin avec la configuration réelle
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
                });
                console.log('Firebase Admin SDK initialisé avec des identifiants réels');
            }
            catch (error) {
                console.error('Erreur lors du chargement du compte de service Firebase:', error);
                throw error;
            }
        }
        // Si aucune méthode précédente n'a fonctionné
        else {
            console.log('Aucune configuration Firebase trouvée, initialisation en mode simulation');
            admin.initializeApp({
                projectId: 'development-mode',
                // @ts-ignore - pour le développement uniquement
                credential: { getAccessToken: () => Promise.resolve({ access_token: 'dummy-token', expires_in: 3600 }) }
            });
        }
    }
    catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
        // En mode développement, ne pas interrompre l'exécution
        if (!isDevelopment) {
            throw error;
        }
    }
}
// Classes Mock pour le mode développement
class MockAuth {
    verifyIdToken(token) {
        console.log('Mock verifyIdToken appelée avec token:', token);
        // Retourne un utilisateur simulé pour le développement
        return Promise.resolve({
            uid: 'dev-user-uid',
            email: 'dev@example.com',
            email_verified: true,
            role: token.includes('admin') ? 'admin' :
                token.includes('teacher') ? 'teacher' : 'student',
        });
    }
}
class MockFirestore {
    collection(path) {
        console.log('Mock Firestore collection appelée pour:', path);
        return {
            doc: (id) => ({
                get: () => Promise.resolve({ exists: false, data: () => null }),
                set: (data) => Promise.resolve(),
                update: (data) => Promise.resolve(),
                delete: () => Promise.resolve()
            }),
            where: () => ({
                get: () => Promise.resolve({ empty: true, docs: [] })
            }),
            add: (data) => Promise.resolve({ id: 'mock-id' })
        };
    }
}
// Déterminons si nous sommes en mode développement et utilisons les mocks
const isDevMode = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';
// Exporter l'instance Firebase Admin ou les mocks
exports.auth = isDevMode
    ? new MockAuth()
    : admin.auth();
exports.firestore = isDevMode
    ? new MockFirestore()
    : admin.firestore();
exports.default = admin;
