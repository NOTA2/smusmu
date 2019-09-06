const router = require('express').Router();


const mainInfo = require('./mainInfo');
const menu = require('./menu');
const event = require('./event');
const faq = require('./faq');
const voc = require('./voc');


router.use('/mainInfo', mainInfo);
router.use('/menu', menu);
router.use('/event', event);
router.use('/faq', faq);
router.use('/voc', voc);


module.exports = router;