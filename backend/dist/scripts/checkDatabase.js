"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = require("mongodb");
// Charger les variables d'environnement
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('⛔ Erreur: Variable d\'environnement MONGODB_URI non définie');
    process.exit(1);
}
async function checkDatabase() {
    let client = null;
    try {
        console.log('🔄 Connexion à MongoDB...');
        // Utiliser directement le client MongoDB
        client = new mongodb_1.MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connexion à MongoDB établie avec succès');
        // Extraire le nom de la base de données de l'URI
        const dbName = new URL(MONGODB_URI).pathname.substring(1) || 'gestion-presence';
        const db = client.db(dbName);
        // Récupérer la liste des collections existantes
        const collections = await db.listCollections().toArray();
        if (collections.length === 0) {
            console.log('⚠️ Aucune collection n\'existe encore dans la base de données');
            console.log('ℹ️ Les collections seront créées automatiquement lors de la première insertion de données');
            console.log('ℹ️ Collections à créer:');
            console.log('  - users');
            console.log('  - schools');
            console.log('  - teachers');
            console.log('  - students');
            console.log('  - classrooms');
            console.log('  - subjects');
            console.log('  - classroomassignments');
            console.log('  - attendances');
            console.log('  - teacherschoolassignments');
        }
        else {
            console.log('📋 Collections existantes:');
            collections.forEach(collection => {
                console.log(`  - ${collection.name}`);
            });
        }
        // Vérifier l'état d'indexation
        console.log('\n📊 Informations sur la base de données:');
        const dbStats = await db.stats();
        console.log(`  - Nom de la base de données: ${dbName}`);
        console.log(`  - Nombre de collections: ${dbStats.collections}`);
        console.log(`  - Nombre d'index: ${dbStats.indexes}`);
        console.log(`  - Taille de la base de données: ${Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100} MB`);
    }
    catch (error) {
        console.error('⛔ Erreur lors de la vérification de la base de données:', error);
        process.exit(1);
    }
    finally {
        if (client) {
            await client.close();
            console.log('🔌 Connexion à MongoDB fermée');
        }
    }
}
// Exécuter la fonction
checkDatabase();
