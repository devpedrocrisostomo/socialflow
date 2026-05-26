const express = require('express');
const router = express.Router();

const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Controladores
const auth = require('../controllers/authController');
const families = require('../controllers/familyController');
const people = require('../controllers/personController');
const appointments = require('../controllers/appointmentController');
const visits = require('../controllers/visitController');
const referrals = require('../controllers/referralController');
const reports = require('../controllers/reportController');
const notifications = require('../controllers/notificationController');
const search = require('../controllers/searchController');
const dashboard = require('../controllers/dashboardController');

// 1. Rotas de Autenticação (Públicas e Protegidas)
router.post('/auth/login', auth.login);
router.get('/auth/profile', authMiddleware, auth.getProfile);
router.put('/auth/profile', authMiddleware, auth.updateProfile);
router.post('/auth/register', authMiddleware, isAdmin, auth.registerUser);
router.get('/auth/users', authMiddleware, auth.getAllUsers);

// 2. Rota do Dashboard
router.get('/dashboard', authMiddleware, dashboard.getDashboardStats);

// 3. Rotas de Família
router.post('/families', authMiddleware, families.createFamily);
router.get('/families', authMiddleware, families.getFamilies);
router.get('/families/:id', authMiddleware, families.getFamilyById);
router.put('/families/:id', authMiddleware, families.updateFamily);
router.delete('/families/:id', authMiddleware, families.deleteFamily);

// 4. Rotas de Integrantes (Pessoas)
router.post('/people', authMiddleware, people.addPerson);
router.put('/people/:id', authMiddleware, people.updatePerson);
router.delete('/people/:id', authMiddleware, people.deletePerson);

// 5. Rotas de Atendimentos
router.post('/appointments', authMiddleware, appointments.createAppointment);
router.get('/appointments', authMiddleware, appointments.getAppointments);
router.get('/appointments/:id', authMiddleware, appointments.getAppointmentById);
router.put('/appointments/:id', authMiddleware, appointments.updateAppointment);
router.delete('/appointments/:id', authMiddleware, appointments.deleteAppointment);

// 6. Rotas de Visitas Domiciliares
router.post('/visits', authMiddleware, visits.createVisit);
router.get('/visits', authMiddleware, visits.getVisits);
router.get('/visits/:id', authMiddleware, visits.getVisitById);
router.put('/visits/:id', authMiddleware, visits.updateVisit);
router.delete('/visits/:id', authMiddleware, visits.deleteVisit);

// 7. Rotas de Encaminhamentos
router.post('/referrals', authMiddleware, referrals.createReferral);
router.get('/referrals', authMiddleware, referrals.getReferrals);
router.get('/referrals/:id', authMiddleware, referrals.getReferralById);
router.put('/referrals/:id', authMiddleware, referrals.updateReferral);
router.delete('/referrals/:id', authMiddleware, referrals.deleteReferral);

// 8. Rotas de Relatórios
router.post('/reports', authMiddleware, reports.createReport);
router.get('/reports', authMiddleware, reports.getReports);
router.get('/reports/:id', authMiddleware, reports.getReportById);
router.put('/reports/:id', authMiddleware, reports.updateReport);
router.delete('/reports/:id', authMiddleware, reports.deleteReport);

// 9. Rotas de Notificações
router.get('/notifications', authMiddleware, notifications.getNotifications);
router.put('/notifications/read-all', authMiddleware, notifications.markAllAsRead);
router.put('/notifications/:id/read', authMiddleware, notifications.markAsRead);

// 10. Rota de Busca Inteligente Global
router.get('/search', authMiddleware, search.globalSearch);

module.exports = router;
