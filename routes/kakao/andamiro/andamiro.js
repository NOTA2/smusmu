const router = require('express').Router();


const info = require('./info');
const menu = require('./menu');
const event = require('./event');
const faq = require('./faq');
const voc = require('./voc');


router.use('/info', info);
router.use('/menu', menu);
router.use('/event', event);
router.use('/faq', faq);
router.use('/voc', voc);


module.exports = router;