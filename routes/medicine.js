const router = require('express').Router();

router.use('/pharmacy', require('./medicine/pharmacy'));
router.use('/personal', require('./medicine/personal'));
router.use('/laboratory', require('./medicine/laboratory'));
router.use('/product', require('./medicine/product'));
router.use('/regSan', require('./medicine/reg_san'));
router.use('/presentation', require('./medicine/presentation'));
router.use('/presentationType', require('./medicine/presentation_type'));
router.use('/search', require('./medicine/search'));
router.use('/favorite', require('./medicine/favorite'));
router.use('/android', require('./medicine/android'));
router.use('/notifications', require('./medicine/notifications'));
router.use('/ubigeo', require('./medicine/ubigeo'));
router.use('/donations', require('./medicine/donations'));


module.exports = router;
