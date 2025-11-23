const { Router } = require('express');
const { createPessoa, listPessoas, login, pessoa } = require('../controllers/authController');

const router = Router();

router.post('/pessoas', createPessoa);
router.get('/pessoas', listPessoas);
router.post('/login/:companyId', login);
router.get('/pessoa/:id', pessoa);

module.exports = router;
