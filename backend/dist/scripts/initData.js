"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const InstitutionType_1 = __importDefault(require("../models/InstitutionType"));
const School_1 = __importDefault(require("../models/School"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Connexion à MongoDB
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        console.log('Connexion à MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connecté à MongoDB');
    }
    catch (error) {
        console.error('Erreur lors de la connexion à MongoDB:', error);
        process.exit(1);
    }
};
// Vérifier et créer les types d'établissement par défaut
const createDefaultInstitutionTypes = async () => {
    try {
        // Vérifier si des types d'établissement existent déjà
        const count = await InstitutionType_1.default.countDocuments();
        if (count > 0) {
            console.log(`${count} types d'établissement déjà présents dans la base de données.`);
            return;
        }
        console.log('Aucun type d\'établissement trouvé. Création des types par défaut...');
        // Types d'établissement par défaut
        const defaultTypes = [
            {
                name: 'Collège',
                code: 'COL',
                description: 'Établissement d\'enseignement secondaire (collège)',
                educationLevels: ['SECONDARY'],
                sector: 'PUBLIC',
                active: true
            },
            {
                name: 'Lycée',
                code: 'LYC',
                description: 'Établissement d\'enseignement secondaire (lycée)',
                educationLevels: ['SECONDARY'],
                sector: 'PUBLIC',
                active: true
            },
            {
                name: 'Université',
                code: 'UNIV',
                description: 'Établissement d\'enseignement supérieur',
                educationLevels: ['HIGHER'],
                sector: 'PUBLIC',
                active: true
            },
            {
                name: 'École Privée',
                code: 'PRIV',
                description: 'Établissement d\'enseignement privé',
                educationLevels: ['PRIMARY', 'SECONDARY'],
                sector: 'PRIVATE',
                active: true
            }
        ];
        // Créer les types d'établissement
        const result = await InstitutionType_1.default.insertMany(defaultTypes);
        console.log(`${result.length} types d'établissement créés avec succès!`);
        return result;
    }
    catch (error) {
        console.error('Erreur lors de la création des types d\'établissement:', error);
    }
};
// Vérifier et créer l'école par défaut
const checkAndCreateSchool = async () => {
    try {
        // Vérifier si l'école avec l'ID spécifique existe
        const schoolId = '6817f643a9fd839ba1998ade';
        const school = await School_1.default.findById(schoolId);
        if (school) {
            console.log('École déjà présente dans la base de données.');
            return school;
        }
        console.log('École non trouvée. Création d\'une école par défaut...');
        // Récupérer un type d'établissement pour l'associer à l'école
        const institutionType = await InstitutionType_1.default.findOne({ code: 'COL' });
        if (!institutionType) {
            console.error('Aucun type d\'établissement trouvé.');
            return null;
        }
        // Créer une école par défaut avec l'ID spécifique
        const newSchool = new School_1.default({
            _id: new mongoose_1.default.Types.ObjectId(schoolId),
            name: 'École Par Défaut',
            address: '123 Rue de l\'Éducation, Ville',
            phone: '01 23 45 67 89',
            email: 'contact@ecole-defaut.edu',
            institutionTypeId: institutionType._id,
            sector: institutionType.sector,
            defaultEducationLevels: institutionType.educationLevels
        });
        await newSchool.save();
        console.log('École par défaut créée avec succès!');
        return newSchool;
    }
    catch (error) {
        console.error('Erreur lors de la vérification/création de l\'école:', error);
        return null;
    }
};
// Fonction principale pour initialiser les données
const initData = async () => {
    try {
        await connectDB();
        // Créer les types d'établissement par défaut
        const types = await createDefaultInstitutionTypes();
        // Vérifier et créer l'école par défaut
        const school = await checkAndCreateSchool();
        console.log('Initialisation des données terminée.');
        process.exit(0);
    }
    catch (error) {
        console.error('Erreur lors de l\'initialisation des données:', error);
        process.exit(1);
    }
};
// Exécuter le script
initData();
