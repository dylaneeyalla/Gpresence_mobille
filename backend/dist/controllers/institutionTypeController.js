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
exports.getInstitutionTypeStats = exports.toggleInstitutionTypeStatus = exports.updateInstitutionType = exports.createInstitutionType = exports.getInstitutionTypeById = exports.getAllInstitutionTypes = void 0;
const InstitutionType_1 = __importStar(require("../models/InstitutionType"));
const School_1 = __importDefault(require("../models/School"));
/**
 * Récupère tous les types d'établissements
 */
const getAllInstitutionTypes = async (req, res) => {
    try {
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
};
exports.getAllInstitutionTypes = getAllInstitutionTypes;
/**
 * Récupère un type d'établissement par son ID
 */
const getInstitutionTypeById = async (req, res) => {
    try {
        const typeId = req.params.id;
        const institutionType = await InstitutionType_1.default.findById(typeId);
        if (!institutionType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'établissement non trouvé'
            });
        }
        return res.status(200).json({
            success: true,
            data: institutionType
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du type d\'établissement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du type d\'établissement',
            error: error.message
        });
    }
};
exports.getInstitutionTypeById = getInstitutionTypeById;
/**
 * Crée un nouveau type d'établissement
 * Réservé au superAdmin
 */
const createInstitutionType = async (req, res) => {
    try {
        const { role } = req.user;
        // Vérifier les permissions (seul le superAdmin peut créer des types d'établissements)
        if (role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à créer des types d\'établissements'
            });
        }
        // Valider les données
        const { name, code, description, educationLevels, sector } = req.body;
        // Vérifier si le code existe déjà
        const existingType = await InstitutionType_1.default.findOne({ $or: [{ code }, { name }] });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Un type d\'établissement avec ce nom ou ce code existe déjà'
            });
        }
        // Créer le nouveau type d'établissement
        const newInstitutionType = await InstitutionType_1.default.create({
            name,
            code: code.toUpperCase(),
            description,
            educationLevels,
            sector: sector || InstitutionType_1.EducationSector.PUBLIC,
            active: true
        });
        return res.status(201).json({
            success: true,
            message: 'Type d\'établissement créé avec succès',
            data: newInstitutionType
        });
    }
    catch (error) {
        console.error('Erreur lors de la création du type d\'établissement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du type d\'établissement',
            error: error.message
        });
    }
};
exports.createInstitutionType = createInstitutionType;
/**
 * Met à jour un type d'établissement existant
 * Réservé au superAdmin
 */
const updateInstitutionType = async (req, res) => {
    try {
        const { role } = req.user;
        const typeId = req.params.id;
        // Vérifier les permissions (seul le superAdmin peut modifier des types d'établissements)
        if (role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier des types d\'établissements'
            });
        }
        // Vérifier si le type existe
        const institutionType = await InstitutionType_1.default.findById(typeId);
        if (!institutionType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'établissement non trouvé'
            });
        }
        // Valider les données
        const { name, code, description, educationLevels, sector, active } = req.body;
        // Vérifier si le nouveau nom ou code est déjà utilisé par un autre type
        if (name !== institutionType.name || code !== institutionType.code) {
            const existingType = await InstitutionType_1.default.findOne({
                $or: [
                    { name, _id: { $ne: typeId } },
                    { code, _id: { $ne: typeId } }
                ]
            });
            if (existingType) {
                return res.status(400).json({
                    success: false,
                    message: 'Un autre type d\'établissement avec ce nom ou ce code existe déjà'
                });
            }
        }
        // Mettre à jour le type d'établissement
        const updatedInstitutionType = await InstitutionType_1.default.findByIdAndUpdate(typeId, {
            name: name || institutionType.name,
            code: code ? code.toUpperCase() : institutionType.code,
            description: description || institutionType.description,
            educationLevels: educationLevels || institutionType.educationLevels,
            sector: sector || institutionType.sector,
            active: active !== undefined ? active : institutionType.active
        }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            message: 'Type d\'établissement mis à jour avec succès',
            data: updatedInstitutionType
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du type d\'établissement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du type d\'établissement',
            error: error.message
        });
    }
};
exports.updateInstitutionType = updateInstitutionType;
/**
 * Active ou désactive un type d'établissement
 * Réservé au superAdmin
 */
const toggleInstitutionTypeStatus = async (req, res) => {
    try {
        const { role } = req.user;
        const typeId = req.params.id;
        // Vérifier les permissions (seul le superAdmin peut modifier le statut)
        if (role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier le statut des types d\'établissements'
            });
        }
        // Vérifier si le type existe
        const institutionType = await InstitutionType_1.default.findById(typeId);
        if (!institutionType) {
            return res.status(404).json({
                success: false,
                message: 'Type d\'établissement non trouvé'
            });
        }
        // Vérifier si des écoles utilisent ce type d'établissement
        if (institutionType.active) {
            const schools = await School_1.default.countDocuments({ institutionTypeId: typeId, active: true });
            if (schools > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ce type d'établissement est actuellement utilisé par ${schools} établissement(s) actif(s). Veuillez d'abord changer le type de ces établissements.`
                });
            }
        }
        // Inverser le statut actif/inactif
        const newStatus = !institutionType.active;
        // Mettre à jour le type d'établissement
        const updatedInstitutionType = await InstitutionType_1.default.findByIdAndUpdate(typeId, { active: newStatus }, { new: true });
        return res.status(200).json({
            success: true,
            message: `Type d'établissement ${newStatus ? 'activé' : 'désactivé'} avec succès`,
            data: updatedInstitutionType
        });
    }
    catch (error) {
        console.error('Erreur lors de la modification du statut du type d\'établissement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du statut du type d\'établissement',
            error: error.message
        });
    }
};
exports.toggleInstitutionTypeStatus = toggleInstitutionTypeStatus;
/**
 * Récupère les statistiques sur les types d'établissements
 */
const getInstitutionTypeStats = async (req, res) => {
    try {
        // Compter le nombre d'écoles par type d'établissement
        const stats = await School_1.default.aggregate([
            { $match: { active: true } },
            { $group: {
                    _id: '$institutionTypeId',
                    count: { $sum: 1 }
                }
            },
            { $lookup: {
                    from: 'institutiontypes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'institutionType'
                }
            },
            { $unwind: '$institutionType' },
            { $project: {
                    _id: 0,
                    typeId: '$_id',
                    typeName: '$institutionType.name',
                    typeCode: '$institutionType.code',
                    schoolCount: '$count'
                }
            },
            { $sort: { schoolCount: -1 } }
        ]);
        // Compter le nombre total de types et les types actifs
        const [totalTypes, activeTypes] = await Promise.all([
            InstitutionType_1.default.countDocuments({}),
            InstitutionType_1.default.countDocuments({ active: true })
        ]);
        return res.status(200).json({
            success: true,
            data: {
                typeDistribution: stats,
                totalTypes,
                activeTypes
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques des types d\'établissements:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques des types d\'établissements',
            error: error.message
        });
    }
};
exports.getInstitutionTypeStats = getInstitutionTypeStats;
exports.default = {
    getAllInstitutionTypes: exports.getAllInstitutionTypes,
    getInstitutionTypeById: exports.getInstitutionTypeById,
    createInstitutionType: exports.createInstitutionType,
    updateInstitutionType: exports.updateInstitutionType,
    toggleInstitutionTypeStatus: exports.toggleInstitutionTypeStatus,
    getInstitutionTypeStats: exports.getInstitutionTypeStats
};
