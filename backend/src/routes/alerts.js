const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const alertsController = require('../controllers/alertsController');

router.use(authenticate);

router.get('/', alertsController.listAlerts);
router.put('/:id/read', alertsController.markAlertRead);
router.put('/:id/dismiss', alertsController.dismissAlert);
router.put('/read-all', alertsController.markAllRead);

module.exports = router;
