const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    
  // jwt.sign(payload, secret, options)
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    }, // payload
    process.env.JWT_SECRET, // secret
    {
      expiresIn: "1d",
    }, // options
  );
};

module.exports = generateToken;
