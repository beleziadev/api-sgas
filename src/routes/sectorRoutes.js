const { Router } = require('express');
const {
  createSector,
  listSectors,
  getSectorById,
  updateSector,
} = require('../controllers/sectorController');

const router = Router();

router.post('/', createSector);
router.get('/', listSectors);
router.get('/:id', getSectorById);
router.put('/:id', updateSector);

module.exports = router;
