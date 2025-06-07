"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const PORT = process.env.PORT || 3001; // Utilisation du port 3001 par défaut pour correspondre au frontend
const MONGODB_URI = process.env.MONGODB_URI;
// Connexion à MongoDB
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    // Démarrage du serveur
    // Écouter explicitement sur toutes les interfaces (0.0.0.0) pour s'assurer que le serveur est accessible
    app_1.default.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Server accessible at http://localhost:${PORT}`);
    });
})
    .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
// Nous allons continuer en créer la base de données, analyse le dossier mobile et liste des différent document de la base de données, si tu as des sugestion ou recommentation fais le mois savoir
