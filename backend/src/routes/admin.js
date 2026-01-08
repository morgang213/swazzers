const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/agency', adminController.getAgency);
router.put('/agency', adminController.updateAgency);
router.get('/stations', adminController.listStations);
router.post('/stations', adminController.createStation);
router.put('/stations/:id', adminController.updateStation);
router.get('/units', adminController.listUnits);
router.post('/units', adminController.createUnit);
router.put('/units/:id', adminController.updateUnit);

module.exports = router;
