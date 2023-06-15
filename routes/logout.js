const express = require('express');
const router = express.Router();
const handleLogout = require('../helpers/logoutToken');;

router.get(`/`, handleLogout);

module.exports = router;