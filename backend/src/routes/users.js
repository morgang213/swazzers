const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

router.use(authenticate);

router.get('/me', usersController.getCurrentUser);
router.put('/me', usersController.updateCurrentUser);
router.get('/', authorize('admin'), usersController.listUsers);
router.get('/:id', authorize('admin', 'supervisor'), usersController.getUser);
router.post('/', authorize('admin'), usersController.createUser);
router.put('/:id', authorize('admin'), usersController.updateUser);
router.delete('/:id', authorize('admin'), usersController.deleteUser);

module.exports = router;
