"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAttendanceStats = exports.getClassroomAttendanceStats = exports.deleteAttendance = exports.updateAttendance = exports.createAttendance = exports.getAttendanceById = exports.getAllAttendances = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const ClassroomAssignment_1 = __importDefault(require("../models/ClassroomAssignment"));
const Student_1 = __importDefault(require("../models/Student"));
const TeacherSchoolAssignment_1 = __importDefault(require("../models/TeacherSchoolAssignment"));
/**
 * Récupère tous les enregistrements de présence
 * - SuperAdmin : Tous les enregistrements
 * - Admin : Uniquement les enregistrements de son école
 * - Teacher : Uniquement ses propres enregistrements
 */
const getAllAttendances = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const { classroomId, date, teacherId } = req.query;
        let filter = {};
        // Filtrer selon le rôle
        if (role === 'admin' && schoolId) {
            // Admin: enregistrements de son école
            filter.schoolId = schoolId;
        }
        else if (role === 'teacher' && userId) {
            // Teacher: ses propres enregistrements
            filter.teacherId = userId;
        }
        else if (role === 'student' && userId) {
            // Étudiant: uniquement ses propres présences
            const student = await Student_1.default.findOne({ userId }).exec();
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil étudiant non trouvé'
                });
            }
            // Type casting explicite pour résoudre l'erreur d'undefined
            const typedStudent = student;
            filter['records.studentId'] = typedStudent._id.toString();
        }
        // Filtres supplémentaires si fournis
        if (classroomId)
            filter.classroomId = classroomId;
        if (teacherId && role !== 'teacher')
            filter.teacherId = teacherId;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }
        // Récupérer les enregistrements de présence avec pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const attendances = await Attendance_1.default.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name')
            .populate('classroomAssignmentId');
        // Compter le nombre total d'enregistrements pour la pagination
        const total = await Attendance_1.default.countDocuments(filter);
        return res.status(200).json({
            success: true,
            count: attendances.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: attendances
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des enregistrements de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des enregistrements de présence',
            error: error.message
        });
    }
};
exports.getAllAttendances = getAllAttendances;
/**
 * Récupère un enregistrement de présence par son ID
 */
const getAttendanceById = async (req, res) => {
    try {
        const { role, schoolId, userId } = req.user;
        const attendanceId = req.params.id;
        // Récupérer l'enregistrement de présence
        const attendance = await Attendance_1.default.findById(attendanceId)
            .populate('classroomId', 'name')
            .populate('teacherId', 'firstName lastName')
            .populate('subjectId', 'name')
            .populate('schoolId', 'name')
            .populate('classroomAssignmentId');
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Enregistrement de présence non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'admin' && schoolId) {
            // Un admin ne peut accéder qu'aux enregistrements de son école
            if (attendance.schoolId && attendance.schoolId.toString() !== schoolId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enregistrement n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher' && userId) {
            // Un enseignant ne peut accéder qu'à ses propres enregistrements
            if (attendance.teacherId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cet enregistrement'
                });
            }
        }
        else if (role === 'student' && userId) {
            // Un étudiant ne peut accéder qu'aux enregistrements le concernant
            const student = await Student_1.default.findOne({ userId });
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil étudiant non trouvé'
                });
            }
            // Type casting explicite pour résoudre l'erreur d'unknown sur _id
            const typedStudentId = student._id.toString();
            const isStudentInAttendance = attendance.records.some(record => record.studentId.toString() === typedStudentId);
            if (!isStudentInAttendance) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cet enregistrement'
                });
            }
        }
        // Populer les informations des étudiants dans les records
        const populatedRecords = await Promise.all(attendance.records.map(async (record) => {
            const student = await Student_1.default.findById(record.studentId)
                .select('firstName lastName');
            // Conversion explicite avec Object.assign pour éviter l'erreur de typage avec toObject()
            // qui n'est pas défini sur tous les types de record
            return {
                ...(record.toObject ? record.toObject() : record),
                student
            };
        }));
        return res.status(200).json({
            success: true,
            data: {
                ...attendance.toObject(),
                records: populatedRecords
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'enregistrement de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'enregistrement de présence',
            error: error.message
        });
    }
};
exports.getAttendanceById = getAttendanceById;
/**
 * Crée un nouvel enregistrement de présence
 * - SuperAdmin : Peut créer un enregistrement pour n'importe quel cours
 * - Admin : Uniquement pour son école
 * - Teacher : Uniquement pour ses propres cours
 */
const createAttendance = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const { date, classroomAssignmentId, records } = req.body;
        // Vérifier que tous les champs obligatoires sont présents
        if (!date || !classroomAssignmentId || !records || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: 'Les champs date, assignation de classe et enregistrements sont obligatoires'
            });
        }
        // Vérifier si l'assignation de classe existe
        const classroomAssignment = await ClassroomAssignment_1.default.findById(classroomAssignmentId)
            .populate('classroomId')
            .populate('subjectId');
        if (!classroomAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignation de classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            // Un admin ne peut créer que pour son école
            if (classroomAssignment.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette assignation n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            // Un enseignant ne peut créer que pour ses propres cours
            if (classroomAssignment.teacherId.toString() !== userId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'êtes pas assigné à ce cours'
                });
            }
        }
        // Vérifier si un enregistrement existe déjà pour cette date et cette assignation
        const existingAttendance = await Attendance_1.default.findOne({
            date: new Date(date),
            classroomAssignmentId
        });
        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: 'Un enregistrement de présence existe déjà pour cette date et ce cours'
            });
        }
        // Vérifier que tous les étudiants dans les records appartiennent à la classe
        const studentIds = records.map((record) => record.studentId);
        const students = await Student_1.default.find({
            _id: { $in: studentIds },
            classId: classroomAssignment.classroomId
        });
        if (students.length !== studentIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Certains étudiants n\'appartiennent pas à cette classe'
            });
        }
        // Valider le format des records
        for (const record of records) {
            if (!record.studentId || !record.status) {
                return res.status(400).json({
                    success: false,
                    message: 'Chaque enregistrement doit contenir studentId et status'
                });
            }
            // Vérifier que le status est valide
            if (!['present', 'absent', 'late', 'excused'].includes(record.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Le statut doit être "present", "absent", "late" ou "excused"'
                });
            }
        }
        // Créer l'enregistrement de présence
        const attendance = await Attendance_1.default.create({
            date: new Date(date),
            classroomAssignmentId,
            classroomId: classroomAssignment.classroomId,
            subjectId: classroomAssignment.subjectId,
            teacherId: classroomAssignment.teacherId,
            schoolId: classroomAssignment.schoolId,
            records: records.map((record) => ({
                studentId: record.studentId,
                status: record.status,
                notes: record.notes || ''
            }))
        });
        return res.status(201).json({
            success: true,
            data: attendance,
            message: 'Enregistrement de présence créé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'enregistrement de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'enregistrement de présence',
            error: error.message
        });
    }
};
exports.createAttendance = createAttendance;
/**
 * Met à jour un enregistrement de présence existant
 * - SuperAdmin : Peut modifier n'importe quel enregistrement
 * - Admin : Uniquement les enregistrements de son école
 * - Teacher : Uniquement ses propres enregistrements
 */
const updateAttendance = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const attendanceId = req.params.id;
        const { records } = req.body;
        // Vérifier si l'enregistrement existe
        const attendance = await Attendance_1.default.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Enregistrement de présence non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            if (attendance.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enregistrement n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            if (attendance.teacherId.toString() !== userId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cet enregistrement'
                });
            }
        }
        // Valider le format des records
        if (!records || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: 'Le champ records est obligatoire et doit être un tableau'
            });
        }
        for (const record of records) {
            if (!record.studentId || !record.status) {
                return res.status(400).json({
                    success: false,
                    message: 'Chaque enregistrement doit contenir studentId et status'
                });
            }
            // Vérifier que le status est valide
            if (!['present', 'absent', 'late', 'excused'].includes(record.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Le statut doit être "present", "absent", "late" ou "excused"'
                });
            }
        }
        // Vérifier que tous les étudiants dans les records appartiennent à la classe
        const studentIds = records.map((record) => record.studentId);
        const students = await Student_1.default.find({
            _id: { $in: studentIds },
            classId: attendance.classroomId
        });
        if (students.length !== studentIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Certains étudiants n\'appartiennent pas à cette classe'
            });
        }
        // Mettre à jour l'enregistrement
        const updatedAttendance = await Attendance_1.default.findByIdAndUpdate(attendanceId, { records }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            data: updatedAttendance,
            message: 'Enregistrement de présence mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'enregistrement de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'enregistrement de présence',
            error: error.message
        });
    }
};
exports.updateAttendance = updateAttendance;
/**
 * Supprime un enregistrement de présence
 * - SuperAdmin : Peut supprimer n'importe quel enregistrement
 * - Admin : Uniquement les enregistrements de son école
 * - Teacher : Uniquement ses propres enregistrements (dans certaines limites de temps)
 */
const deleteAttendance = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const attendanceId = req.params.id;
        // Vérifier si l'enregistrement existe
        const attendance = await Attendance_1.default.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Enregistrement de présence non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            if (attendance.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet enregistrement n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            if (attendance.teacherId.toString() !== userId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas accès à cet enregistrement'
                });
            }
            // Les enseignants ne peuvent supprimer que les enregistrements de moins de 24h
            const now = new Date();
            const attendanceDate = new Date(attendance.date);
            const timeDiff = now.getTime() - attendanceDate.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff > 24) {
                return res.status(403).json({
                    success: false,
                    message: 'Les enseignants ne peuvent supprimer que les enregistrements de moins de 24h'
                });
            }
        }
        // Supprimer l'enregistrement
        await Attendance_1.default.findByIdAndDelete(attendanceId);
        return res.status(200).json({
            success: true,
            message: 'Enregistrement de présence supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'enregistrement de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'enregistrement de présence',
            error: error.message
        });
    }
};
exports.deleteAttendance = deleteAttendance;
/**
 * Récupère les statistiques de présence pour une classe
 */
const getClassroomAttendanceStats = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const { classroomId } = req.params;
        const { startDate, endDate } = req.query;
        // Vérifier si la classe existe
        const classroom = await mongoose_1.default.model('Classroom').findById(classroomId);
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            if (classroom.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cette classe n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            // Vérifier si l'enseignant est assigné à cette classe
            const isAssignedToClass = await ClassroomAssignment_1.default.exists({
                teacherId: userId,
                classroomId
            });
            if (!isAssignedToClass) {
                // Vérifier si l'enseignant est dans la même école
                const isInSchool = await TeacherSchoolAssignment_1.default.exists({
                    teacherId: userId,
                    schoolId: classroom.schoolId
                });
                if (!isInSchool) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cette classe'
                    });
                }
            }
        }
        // Construire le filtre de date
        let dateFilter = {};
        if (startDate) {
            const parsedStartDate = new Date(startDate);
            parsedStartDate.setHours(0, 0, 0, 0);
            dateFilter.$gte = parsedStartDate;
        }
        if (endDate) {
            const parsedEndDate = new Date(endDate);
            parsedEndDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = parsedEndDate;
        }
        // Construire le filtre complet
        const filter = { classroomId };
        if (Object.keys(dateFilter).length > 0) {
            filter.date = dateFilter;
        }
        // Récupérer tous les enregistrements de présence pour cette classe
        const attendances = await Attendance_1.default.find(filter);
        // Récupérer tous les étudiants de cette classe
        const students = await Student_1.default.find({ classId: classroomId })
            .select('firstName lastName');
        // Calculer les statistiques par étudiant
        const studentStats = students.map(student => {
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalLate = 0;
            let totalExcused = 0;
            let total = 0;
            // Type casting explicite pour student._id pour résoudre l'erreur de typage
            const typedStudentId = student._id.toString();
            attendances.forEach(attendance => {
                const record = attendance.records.find(record => record.studentId.toString() === typedStudentId);
                if (record) {
                    total++;
                    switch (record.status) {
                        case 'present':
                            totalPresent++;
                            break;
                        case 'absent':
                            totalAbsent++;
                            break;
                        case 'late':
                            totalLate++;
                            break;
                        case 'excused':
                            totalExcused++;
                            break;
                    }
                }
            });
            return {
                studentId: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                stats: {
                    totalPresent,
                    totalAbsent,
                    totalLate,
                    totalExcused,
                    total,
                    presentPercentage: total > 0 ? (totalPresent / total) * 100 : 0,
                    absentPercentage: total > 0 ? (totalAbsent / total) * 100 : 0,
                    latePercentage: total > 0 ? (totalLate / total) * 100 : 0,
                    excusedPercentage: total > 0 ? (totalExcused / total) * 100 : 0
                }
            };
        });
        // Calculer les statistiques globales
        let globalTotalPresent = 0;
        let globalTotalAbsent = 0;
        let globalTotalLate = 0;
        let globalTotalExcused = 0;
        let globalTotal = 0;
        attendances.forEach(attendance => {
            attendance.records.forEach(record => {
                globalTotal++;
                switch (record.status) {
                    case 'present':
                        globalTotalPresent++;
                        break;
                    case 'absent':
                        globalTotalAbsent++;
                        break;
                    case 'late':
                        globalTotalLate++;
                        break;
                    case 'excused':
                        globalTotalExcused++;
                        break;
                }
            });
        });
        return res.status(200).json({
            success: true,
            data: {
                students: studentStats,
                global: {
                    totalPresent: globalTotalPresent,
                    totalAbsent: globalTotalAbsent,
                    totalLate: globalTotalLate,
                    totalExcused: globalTotalExcused,
                    total: globalTotal,
                    presentPercentage: globalTotal > 0 ? (globalTotalPresent / globalTotal) * 100 : 0,
                    absentPercentage: globalTotal > 0 ? (globalTotalAbsent / globalTotal) * 100 : 0,
                    latePercentage: globalTotal > 0 ? (globalTotalLate / globalTotal) * 100 : 0,
                    excusedPercentage: globalTotal > 0 ? (globalTotalExcused / globalTotal) * 100 : 0
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de présence',
            error: error.message
        });
    }
};
exports.getClassroomAttendanceStats = getClassroomAttendanceStats;
/**
 * Récupère les statistiques de présence pour un étudiant
 */
const getStudentAttendanceStats = async (req, res) => {
    try {
        const { role, schoolId: adminSchoolId, userId } = req.user;
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;
        // Vérifier si l'étudiant existe
        const student = await Student_1.default.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        // Vérifier les permissions
        if (role === 'admin') {
            if (student.schoolId.toString() !== adminSchoolId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Cet étudiant n\'appartient pas à votre établissement'
                });
            }
        }
        else if (role === 'teacher') {
            // Vérifier si l'enseignant enseigne à la classe de l'étudiant
            const isTeachingClass = await ClassroomAssignment_1.default.exists({
                teacherId: userId,
                classroomId: student.classId
            });
            if (!isTeachingClass) {
                // Vérifier si l'enseignant est dans la même école
                const isInSchool = await TeacherSchoolAssignment_1.default.exists({
                    teacherId: userId,
                    schoolId: student.schoolId
                });
                if (!isInSchool) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'avez pas accès à cet étudiant'
                    });
                }
            }
        }
        else if (role === 'student') {
            // Un étudiant ne peut voir que ses propres statistiques
            const currentStudent = await Student_1.default.findOne({ userId });
            if (!currentStudent || currentStudent._id.toString() !== studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez accéder qu\'à vos propres statistiques'
                });
            }
        }
        // Construire le filtre de date
        let dateFilter = {};
        if (startDate) {
            const parsedStartDate = new Date(startDate);
            parsedStartDate.setHours(0, 0, 0, 0);
            dateFilter.$gte = parsedStartDate;
        }
        if (endDate) {
            const parsedEndDate = new Date(endDate);
            parsedEndDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = parsedEndDate;
        }
        // Récupérer tous les enregistrements de présence pour cet étudiant
        const attendances = await Attendance_1.default.find({
            'records.studentId': studentId,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
        })
            .populate('subjectId', 'name')
            .populate('classroomId', 'name')
            .sort({ date: -1 });
        // Calculer les statistiques
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;
        let totalExcused = 0;
        // Détails de chaque présence
        const attendanceDetails = attendances.map(attendance => {
            const record = attendance.records.find(r => r.studentId.toString() === studentId);
            if (record) {
                switch (record.status) {
                    case 'present':
                        totalPresent++;
                        break;
                    case 'absent':
                        totalAbsent++;
                        break;
                    case 'late':
                        totalLate++;
                        break;
                    case 'excused':
                        totalExcused++;
                        break;
                }
            }
            return {
                date: attendance.date,
                subject: attendance.subjectId,
                classroom: attendance.classroomId,
                status: record ? record.status : null,
                notes: record ? record.notes : null
            };
        });
        const total = totalPresent + totalAbsent + totalLate + totalExcused;
        return res.status(200).json({
            success: true,
            data: {
                student: {
                    _id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    classId: student.classId
                },
                stats: {
                    totalPresent,
                    totalAbsent,
                    totalLate,
                    totalExcused,
                    total,
                    presentPercentage: total > 0 ? (totalPresent / total) * 100 : 0,
                    absentPercentage: total > 0 ? (totalAbsent / total) * 100 : 0,
                    latePercentage: total > 0 ? (totalLate / total) * 100 : 0,
                    excusedPercentage: total > 0 ? (totalExcused / total) * 100 : 0
                },
                attendanceDetails
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques de présence:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de présence',
            error: error.message
        });
    }
};
exports.getStudentAttendanceStats = getStudentAttendanceStats;
exports.default = {
    getAllAttendances: exports.getAllAttendances,
    getAttendanceById: exports.getAttendanceById,
    createAttendance: exports.createAttendance,
    updateAttendance: exports.updateAttendance,
    deleteAttendance: exports.deleteAttendance,
    getClassroomAttendanceStats: exports.getClassroomAttendanceStats,
    getStudentAttendanceStats: exports.getStudentAttendanceStats
};
