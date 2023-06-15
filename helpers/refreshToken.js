const {User} = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const user = await User.findOne({refreshToken: refreshToken});
  if(!user) {
    return res.sendStatus(403); //Forbidden
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || (user.id !== decoded.id)) return res.sendStatus(403); //invalid token
      const accessToken = jwt.sign(
        {
          userId: decoded.id,
          IsAdmin: decoded.isAdmin
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : '15m'}
      );
      res.json({ accessToken });
      next();
    }
  );
}

module.exports = handleRefreshToken;