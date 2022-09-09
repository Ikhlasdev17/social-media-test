const { Schema, model } = require("mongoose");

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: "https://gudiyathamads.com/assets/images/services/default.png"
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [
    {
      text: String,
      postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
})


model("Post", PostSchema)