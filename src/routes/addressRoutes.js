const { Router } = require('express');
const {
  createAddress,
  listAddresses,
  getAddressById,
  updateAddress,
} = require('../controllers/addressController');

const router = Router();

router.post('/', createAddress);
router.get('/', listAddresses);
router.get('/:id', getAddressById);
router.put('/:id', updateAddress);

module.exports = router;
