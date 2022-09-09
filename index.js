const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const mongoose = require("mongoose");
const cors = require('cors');
const path = require("path")

require("./models/UserSchema")
require("./models/PostSchema")

app.use(express.json()) 
app.use(require("./routes/auth"))
app.use(require("./routes/post"))
app.use(require("./routes/user"))

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client","build","index.html"))
  })
}

// connect mongodb
mongoose.connect(process.env.MONGODB_URI, (err) => {
  if (err) return console.log(err)
  console.log("MongoDB Connected Success!");
})
app.listen(port , ()=> console.log('> Server is up and running on port : ' + port))