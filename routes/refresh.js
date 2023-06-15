const express = require('express');
const router = express.Router();
const handleRefreshToken = require('../helpers/refreshToken');;

router.get(`/`, handleRefreshToken);

module.exports = router;