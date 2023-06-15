const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();
// const ROLES_LIST = require('../config/roles.list');
// const verifyRoles = require('../helpers/verifyRoles');

// router.get(`/`, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User), async (req, res) => {
router.get(`/`, async (req, res) => {
  const orderList = await Order.find();

  if(!orderList) {
    res.status(500).json({success: false})
  }
  res.send(orderList);
})

module.exports = router;