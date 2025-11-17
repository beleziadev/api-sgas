const { Router } = require('express');
const { registerCredential, listCredentials, login } = require('../controllers/authController');

const router = Router();

router.post('/logins', registerCredential);
router.get('/logins', listCredentials);
router.post('/login/:companyId', login);

module.exports = router;
