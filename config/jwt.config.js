const jwt = require("jsonwebtoken");

function generateToken() {
  const { _id, email, role } = user;

  const signature = process.env.TOKEN_SIGN_SECRET;
  const expiration = "10h";

  return jwt.sign({_id, email, role}, signature, {expiresIn: expiration})
}

module.exports = generateToken;
