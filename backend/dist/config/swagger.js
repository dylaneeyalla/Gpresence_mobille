"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestion Scolaire',
            version: '1.0.0',
            description: 'API pour la gestion des écoles, enseignants, étudiants, classes et présences',
            contact: {
                name: 'Équipe de développement',
                email: 'contact@example.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur de développement'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'password', 'role'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de l\'utilisateur (auto-généré)'
                        },
                        firstName: {
                            type: 'string',
                            description: 'Prénom de l\'utilisateur'
                        },
                        lastName: {
                            type: 'string',
                            description: 'Nom de l\'utilisateur'
                        },
                        email: {
                            type: 'string',
                            description: 'Email de l\'utilisateur'
                        },
                        password: {
                            type: 'string',
                            description: 'Mot de passe de l\'utilisateur (haché)'
                        },
                        role: {
                            type: 'string',
                            enum: ['superAdmin', 'admin', 'teacher', 'student'],
                            description: 'Rôle de l\'utilisateur'
                        },
                        schoolId: {
                            type: 'string',
                            description: 'ID de l\'école associée à l\'utilisateur'
                        }
                    }
                },
                School: {
                    type: 'object',
                    required: ['name', 'address', 'phone'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de l\'école (auto-généré)'
                        },
                        name: {
                            type: 'string',
                            description: 'Nom de l\'école'
                        },
                        address: {
                            type: 'string',
                            description: 'Adresse de l\'école'
                        },
                        city: {
                            type: 'string',
                            description: 'Ville de l\'école'
                        },
                        country: {
                            type: 'string',
                            description: 'Pays de l\'école'
                        },
                        phone: {
                            type: 'string',
                            description: 'Numéro de téléphone de l\'école'
                        },
                        email: {
                            type: 'string',
                            description: 'Email de l\'école'
                        }
                    }
                },
                Teacher: {
                    type: 'object',
                    required: ['userId', 'specialization'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de l\'enseignant (auto-généré)'
                        },
                        userId: {
                            type: 'string',
                            description: 'ID de l\'utilisateur associé à l\'enseignant'
                        },
                        specialization: {
                            type: 'string',
                            description: 'Spécialisation de l\'enseignant'
                        },
                        schoolAssignments: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Liste des IDs des écoles où l\'enseignant est assigné'
                        }
                    }
                },
                Student: {
                    type: 'object',
                    required: ['userId', 'schoolId', 'classroomId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de l\'étudiant (auto-généré)'
                        },
                        userId: {
                            type: 'string',
                            description: 'ID de l\'utilisateur associé à l\'étudiant'
                        },
                        schoolId: {
                            type: 'string',
                            description: 'ID de l\'école de l\'étudiant'
                        },
                        classroomId: {
                            type: 'string',
                            description: 'ID de la classe de l\'étudiant'
                        },
                        parentInfo: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Nom du parent'
                                },
                                contact: {
                                    type: 'string',
                                    description: 'Contact du parent'
                                },
                                email: {
                                    type: 'string',
                                    description: 'Email du parent'
                                }
                            }
                        }
                    }
                },
                Classroom: {
                    type: 'object',
                    required: ['name', 'schoolId', 'grade'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la classe (auto-généré)'
                        },
                        name: {
                            type: 'string',
                            description: 'Nom de la classe'
                        },
                        schoolId: {
                            type: 'string',
                            description: 'ID de l\'école de la classe'
                        },
                        grade: {
                            type: 'string',
                            description: 'Niveau de la classe'
                        },
                        capacity: {
                            type: 'number',
                            description: 'Capacité de la classe'
                        }
                    }
                },
                Subject: {
                    type: 'object',
                    required: ['name', 'schoolId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la matière (auto-généré)'
                        },
                        name: {
                            type: 'string',
                            description: 'Nom de la matière'
                        },
                        schoolId: {
                            type: 'string',
                            description: 'ID de l\'école associée à la matière'
                        },
                        description: {
                            type: 'string',
                            description: 'Description de la matière'
                        }
                    }
                },
                ClassroomAssignment: {
                    type: 'object',
                    required: ['teacherId', 'classroomId', 'subjectId', 'schoolId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de l\'assignation (auto-généré)'
                        },
                        teacherId: {
                            type: 'string',
                            description: 'ID de l\'enseignant assigné'
                        },
                        classroomId: {
                            type: 'string',
                            description: 'ID de la classe'
                        },
                        subjectId: {
                            type: 'string',
                            description: 'ID de la matière enseignée'
                        },
                        schoolId: {
                            type: 'string',
                            description: 'ID de l\'école'
                        },
                        schedule: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    day: {
                                        type: 'string',
                                        enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
                                        description: 'Jour de la semaine'
                                    },
                                    startTime: {
                                        type: 'string',
                                        description: 'Heure de début (format HH:MM)'
                                    },
                                    endTime: {
                                        type: 'string',
                                        description: 'Heure de fin (format HH:MM)'
                                    }
                                }
                            }
                        }
                    }
                },
                Attendance: {
                    type: 'object',
                    required: ['date', 'classroomAssignmentId', 'studentAttendance'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la présence (auto-généré)'
                        },
                        date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date et heure de la présence'
                        },
                        classroomAssignmentId: {
                            type: 'string',
                            description: 'ID de l\'assignation de classe'
                        },
                        studentAttendance: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    studentId: {
                                        type: 'string',
                                        description: 'ID de l\'étudiant'
                                    },
                                    status: {
                                        type: 'string',
                                        enum: ['present', 'absent', 'late', 'excused'],
                                        description: 'Statut de présence'
                                    },
                                    notes: {
                                        type: 'string',
                                        description: 'Notes additionnelles'
                                    }
                                }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            default: false
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts'] // Chemin vers les fichiers de routes pour la documentation
};
const swaggerSpecs = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpecs;
