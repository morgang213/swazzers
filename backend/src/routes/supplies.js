const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const suppliesController = require('../controllers/suppliesController');

router.use(authenticate);

router.get('/', suppliesController.listSupplies);
router.get('/categories', suppliesController.listCategories);
router.post('/categories', authorize('admin', 'supervisor'), suppliesController.createCategory);
router.get('/:id', suppliesController.getSupply);
router.post('/', authorize('admin', 'supervisor'), suppliesController.createSupply);
router.put('/:id', authorize('admin', 'supervisor'), suppliesController.updateSupply);
router.delete('/:id', authorize('admin', 'supervisor'), suppliesController.deleteSupply);

module.exports = router;
