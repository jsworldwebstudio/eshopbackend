const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash');

  if(!userList) {
    return res.status(500).json({success: false})
  }
  res.status(200).send(userList);
})

router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return res.status(500).json({success: false, message: 'The user with the given id was not found!'})
  }
  res.status(200).send(user);
})

router.put(`/:id`, async (req, res) => {
  if(!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({success: false, message: 'Invalid User Id'});
  };

  const userExist = await User.findById(req.params.id);
  if(!userExist) {
    return res.status(500).json({success: false, message: 'The user with the given id was not found!'})
  }

  let newPassword;
  if(req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
      refreshToken: req.body.refreshToken 
    },
    { new: true }
  );

  if(!user) {
    return res.status(400).json({success: false, message: 'specific user cannot be updated!'})
  }
  res.status(200).send(user);
})

router.post('/', async (req,res)=>{
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
    refreshToken: ''
  })
  user = await user.save();

  if(!user) {
    return res.status(404).send('the user cannot be created!');
  }
  res.status(200).send(user);
})

router.post('/login', async (req,res)=>{
  const user = await User.findOne({email: req.body.email});
  if(!user) {
    return res.status(400).json({success: false, message: 'The user with the given email was not found!'})
  }

  if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        IsAdmin: user.isAdmin
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn : '15m'}
    );
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        IsAdmin: user.isAdmin
      },
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn : '1d'}
    );
    // user = { ...user, refreshToken };
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        refreshToken: refreshToken 
      },
      { new: true }
    );
    // const token = jwt.sign(
    //   {
    //     userId: user.id,
    //     IsAdmin: user.isAdmin
    //   },
    //   secret,
    //   {expiresIn : '1d'}
    // )
    if(!updatedUser) {
      return res.status(475).json({success: false, message: 'specific user cannot be updated!'})
    }
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 }); //maxAge = 1 day
    res.json({ accessToken });
    // return res.status(200).send({user: user, accessToken, refreshToken})
  } else {
    res.status(400).send('User Enterd Invalid Password!')
  }

  // let user = new User({
  //   name: req.body.name,
  //   email: req.body.email,
  //   passwordHash: bcrypt.hashSync(req.body.password, 10),
  //   phone: req.body.phone,
  //   isAdmin: req.body.isAdmin,
  //   street: req.body.street,
  //   apartment: req.body.apartment,
  //   zip: req.body.zip,
  //   city: req.body.city,
  //   country: req.body.country
  // })
  // user = await user.save();

  // if(!user) {
  //   return res.status(404).send('the user cannot be created!');
  // }
  // res.status(200).send(user);
})

router.post('/register', async (req,res)=>{
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country
  })
  user = await user.save();

  if(!user) {
    return res.status(404).send('the user cannot be created!');
  }
  res.status(200).send(user);
})

router.get(`/get/count`, async (req, res) => {
  // const userCount = await User.countDocuments({}, { hint: "_id_" });
  const userCount = await User.countDocuments({}, { hint: "_id_" }).exec();
  // const userCount = await User.countDocuments((count) => count);
  // const userCount = await User.countDocuments({}).exec();
  if(!userCount) {
    return res.status(500).json({success: false, message: 'No Users counted!'})
  }
  res.status(200).send({userCount: userCount});
})

module.exports = router;