const { Router } = require('express');
const {
  createNotice,
  listNotices,
  getNoticeById,
  updateNotice,
} = require('../controllers/noticeController');

const router = Router();

router.post('/', createNotice);
router.get('/', listNotices);
router.get('/:id', getNoticeById);
router.put('/:id', updateNotice);

module.exports = router;
