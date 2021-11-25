const Router = require('express');
const router = new Router();
const basketController = require('../controllers/BasketController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, basketController.addDevice);
router.post('/remove', authMiddleware, basketController.removeDevice);
router.get('/', authMiddleware, basketController.getBasketList);

module.exports = router;