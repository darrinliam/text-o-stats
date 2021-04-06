'use strict';

const express = require('express');
const word = require ('../Controllers/textOstats');
const router = express.Router();

router.post('/api/v1/textostats', word.textOstats);

module.exports.router = router;
