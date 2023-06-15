const {User} = require('../models/user');

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);  //No content to send back
  const refreshToken = cookies.jwt;

  // Is refreshToken in the db
  const user = await User.findOne({refreshToken: refreshToken});
  if(!user) {
    res.clearCookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
    return res.sendStatus(204); 
  }

  // Clear the refreshToken in the db
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      refreshToken: '' 
    },
    { new: true }
  );
  if(!updatedUser) {
    return res.status(475).json({success: false, message: 'specific user cannot be updated!'})
  }
  res.clearCookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true }); //secure: true - add to production - only serves on https requests - for clearCookie
  res.sendStatus(204); 
}

module.exports = handleLogout;