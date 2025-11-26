const { Router } = require('express');
const {
  createPessoa,
  listPessoas,
  login,
  pessoa,
  updatePessoa,
} = require('../controllers/authController');

const router = Router();

router.post('/pessoas', createPessoa);
router.get('/pessoas', listPessoas);
router.post('/login/:companyId', login);
router.get('/pessoa/:id', pessoa);
router.put('/pessoa/:id', updatePessoa);

module.exports = router;
