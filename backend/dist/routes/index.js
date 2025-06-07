"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
/**
 * SOLUTION FINALE : Routeur central complètement vide
 *
 * Ce fichier ne contient AUCUNE route ou sous-routeur.
 * Il exporte simplement un routeur express vide.
 *
 * Toutes les routes sont montées directement dans app.ts avec leurs préfixes respectifs:
 * app.use('/api/schools', schoolRoutes);
 * app.use('/api/auth', authRoutes);
 * etc.
 */
// Exporter un routeur complètement vide sans aucune route
const emptyRouter = express_1.default.Router();
exports.default = emptyRouter;
