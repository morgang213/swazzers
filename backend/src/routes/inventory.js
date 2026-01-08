const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

router.use(authenticate);

router.get('/all', inventoryController.getAllInventory);
router.get('/units/:unitId', inventoryController.getUnitInventory);
router.get('/stations/:stationId', inventoryController.getStationInventory);
router.get('/expiring', inventoryController.getExpiringItems);
router.get('/below-par', inventoryController.getBelowPar);
router.post('/usage', inventoryController.recordUsage);
router.post('/adjust', authorize('admin', 'supervisor'), inventoryController.adjustInventory);

module.exports = router;
