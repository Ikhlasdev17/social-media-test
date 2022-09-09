const router = require('express').Router()
const mongoose = require("mongoose");
const login = require("../middleware/login")
const Post = mongoose.model("Post")

router.get("/posts", (req, res) => {
  try {
    Post.find({})
    .populate("postedBy", "_id, name")
      .then((data) => {
        res.status(200).json({ message: "success", posts: data })
      })
      .catch((err) => {
        res.status(400).json({error: err.message})
      })
    } catch (error) {
      res.status(500).json({error: error.message})
  }
})

router.post('/createpost', login, (req , res)=>{
    const { title, body, photo } = req.body

    if (!title || !body) return res.status(422).json({ error: "Please add all fields" })

    
    req.user.password = undefined

    const post = new Post({
      title,
      body,
      photo,
      postedBy: req.user
    })

    post.save()
      .then((result) => {
        res.status(201).json({ 
          created: true, 
          message: "Post created!", 
          post: result
        })
      })
      .catch((err) => {
        console.log(err);
      })
})

router.get("/allPost", login, (req, res) => {
  try {
    Post.find({})
      .populate("postedBy", "_id, name")
      .then((data) => {
        res.status(200).json({ message: "success", posts: data })
      })
      .catch((err) => {
        res.status(400).json({error: err.message})
      })
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

router.get("/myposts", login, (req, res) => {
  try {
    Post.find({ postedBy: req.user._id })
      .populate("postedBy", "_id, name")
      .then((data) => {
        res.status(200).json({ message: "success", posts: data })
      })
      .catch((err) => {
        res.status(400).json({error: err.message})
      })
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

router.put("/like", login, (req ,res) => {
  try {
    Post.findById(req.body.postId)
      .then((post) => {
        if (!post) return res.status(404).json({error:"Post not found!"})
        if (post.likes.includes(req.user._id)) return res.status(422).json({error:"User already liked that post!"})
        Post.findByIdAndUpdate(req.body.postId, {
          $push: { likes: req.user._id }
        }, {new: true})
        .populate("postedBy", "_id, name")
        .exec((err, result) => {
          if (err) {
            console.log(err);
            res.status(422).json({error: err})
          } else {
            res.json(result)
          }
        })
      })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

router.put("/unlike", login, (req ,res) => {
  try {
    Post.findByIdAndUpdate(req.body.postId, {
      $pull: { likes: req.user._id }
    }, {new: true})
    .populate("postedBy", "_id, name")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({error: err})
      } else {
        res.json(result)
      }
    })
  } catch (error) {
    res.status(500).json({error})
  }
})

router.put("/comment", login, (req, res) => {
  if (req.body.text && req.body.postId) {
    const comment = {
      text: req.body.text,
      postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
      $push: { comments: comment }
    }, {new: true})
      .populate("postedBy", "_id, name")
      .populate("comments.postedBy", "_id, name")
      .exec((err, result) => {
        if (err) {
          return res.status(422).json({ error: err })
        } else {
          return res.json(result)
        }
      })
  } else {
    res.status(422).json({error: "postId and text is required!"})
  }
})

router.delete("/deletepost/:id", login, (req, res) => {
  Post.findOne({ _id: req.params.id }) 
    .populate("postedBy","_id")
    .exec((err, post) => {
      if (err) return res.status(404).json({ error: "Post not fount" })
      Post.insert
      if (post.postedBy._id.toString() !== req.user._id.toString()) return res.status(401).json({ error: "You can delete only your posts!" })

      post.remove()
        .then(result => {
          res.json({ msg: "Post Deleted success! " })
        })
        .catch((err) => {
          res.status(400).json({error: "Failed to delete post!"})
          console.log(err)
        })
    })
})



router.get("/getsubspost", login, (req, res) => {
  Post.find({ postedBy: { $in: req.user.followings } })
    .populate("postedBy","_id, name")
    .populate("comments.postedBy","_id, name")
    .then((posts) => {
      return res.json({ posts })
    })
    .catch((err) => res.status(422).json({ error: err }))
})


module.exports  = router