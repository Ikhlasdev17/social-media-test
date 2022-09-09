const { Schema, model } = require("mongoose")

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/1053/1053244.png?w=360"
  },
  password: {
    type: String,
    required: true
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  followings: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ],
})

model("User", UserSchema)