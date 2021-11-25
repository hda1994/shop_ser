const Router = require('express');
const router = new Router();
const brandController = require('../controllers/BrandController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole('ADMIN'), brandController.create);
router.get('/', brandController.getAll);

module.exports = router;