const { Router } = require('express');
const {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
} = require('../controllers/companyController');
const { listSectorsByCompany } = require('../controllers/sectorController');

const router = Router();

router.post('/', createCompany);
router.get('/', listCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.get('/:companyId/sectors', listSectorsByCompany);

module.exports = router;
