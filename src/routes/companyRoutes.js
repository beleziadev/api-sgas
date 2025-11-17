const { Router } = require('express');
const {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
} = require('../controllers/companyController');

const router = Router();

router.post('/', createCompany);
router.get('/', listCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);

module.exports = router;
