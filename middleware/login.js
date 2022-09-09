const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const User = mongoose.model("User")


module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ error: "Unauthorized, please login!" })

  try {
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, process.env.JWTSECRET_KEY, (err, payload) => {
      if (err) return res.status(401).json({ error: "Unauthorized, please login!" })

      const { _id } = payload;

      User.findOne({ _id })
        .then((savedUser) => {
          req.user = savedUser
          next()
        })
    })
  } catch (error) {
    res.sendStatus(500)
  }
}