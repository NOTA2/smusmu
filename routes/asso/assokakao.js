const router = require('express').Router();


const volunteer = require('./assokakao/volunteer');
const scholarship = require('./assokakao/scholarship');


router.use('/volunteer', volunteer);
router.use('/scholarship', scholarship);


module.exports = router;