const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ordersController = require('../controllers/ordersController');

router.use(authenticate);

router.get('/', authorize('admin', 'supervisor'), ordersController.listOrders);
router.get('/reorder-list', authorize('admin', 'supervisor'), ordersController.getReorderList);
router.get('/:id', authorize('admin', 'supervisor'), ordersController.getOrder);
router.post('/', authorize('admin', 'supervisor'), ordersController.createOrder);
router.put('/:id', authorize('admin', 'supervisor'), ordersController.updateOrder);
router.post('/:id/submit', authorize('admin', 'supervisor'), ordersController.submitOrder);
router.post('/:id/approve', authorize('admin'), ordersController.approveOrder);
router.post('/:id/receive', authorize('admin', 'supervisor'), ordersController.receiveOrder);
router.delete('/:id', authorize('admin', 'supervisor'), ordersController.cancelOrder);

module.exports = router;
