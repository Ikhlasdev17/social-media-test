const router = require('express').Router()
const mongoose = require("mongoose");
const login = require("../middleware/login")
const Post = mongoose.model("Post")
const User = mongoose.model("User")


router.get('/user/:id' ,login, async (req , res)=>{
  console.log(req.params.id)
    User.findOne({_id:req.params.id})
      .then((user) =>{
         Post.find({ postedBy: req.params.id })
          .populate("postedBy","_id, name")
          .exec((err, posts) => {
            if (err) return res.status(422).json({ error: err })
            res.json({ user: user, posts: posts })
          })

      })
      .catch((err) => {
        console.log(err);
        return res.status(404).json({error: "User not found!"})
      })
})

router.put("/follow",login, (req, res) => {
  User.findById(req.body.followId)
    .then(user => {
      if (!user.followers.includes(req.user._id)) {
        User.findByIdAndUpdate(req.body.followId, 
          {
            $push: { followers: req.user._id }
          }, 
          { 
            new: true 
          },
          (err, following) => {
            if (err) return res.status(422).json({ error: err })
      
            User.findByIdAndUpdate(req.user._id, {
              $push: { followings: req.body.followId }
              
            },{new:true})
            .select("-password")
            .then(result => {
              res.json(result)
            })
            .catch((err) => {
              return res.status(422).json({ error: err })
            })
          }
        )
      } else {
        res.status(400).json({ error: "User already followed" })
      }
    })
    .catch(err => {
      res.status(422).json({ error: "User not found" })
    }) 
})

router.put("/follow/:id", login, async (req, res) => {
  if (req.body.followId !== req.user._id) {
    try {
      const user = await User.findById(req.body.followId);
      const currentUser = await User.findById(req.user._id);
      if (!user.followers.includes(req.body.followId)) {
        await user.updateOne({ $push: { followers: req.user._id } });
        await currentUser.updateOne({ $push: { followings: req.body.followId } });
        res.status(200).json(currentUser);
      } else {
        res.status(403).send("You are not following this user!");
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(403).send("You can't follow yourself!");
  }
});

router.put("/unfollow",login,  (req, res) => {
  User.findByIdAndUpdate(req.body.unfollowId, 
    {
      $pull: { followers: req.user._id }
    }, 
    { 
      new: true 
    },
    (err, result) => {
      if (err) return res.status(422).json({ error: err })

      User.findByIdAndUpdate(req.user._id, {
        $pull: { followings: req.body.unfollowId }
        
      },{new:true})
      .then(result => {
        res.json(result)
      })
      .catch((err) => {
        return res.status(422).json({ error: err })
      })
    }
    )
})


router.put("/updatepic",login, (req, res) => {
  User.findByIdAndUpdate(req.user._id, {$set:{avatar: req.body.avatar}}, {new: true}, (err, result) => {
    if (err) {
      return res.status(422).json({ error: "Picture cannot posted!" })
    }
    console.log(result);
    res.status(200).json(result)
  })
})

router.put("/editname",login, (req, res) => {
  User.findByIdAndUpdate(req.user._id, {$set:{name: req.body.name}}, {new: true}, (err, result) => {
    if (err) {
      return res.status(422).json({ error: "Name cannot posted!" })
    }
    console.log(result);
    res.status(200).json(result)
  })
})

router.post("/searchuser",login, (req, res) => {
  const userSearchPanel = new RegExp("^"+req.body.query);

  User.find({ email: {$regex: userSearchPanel} })
    .select("_id name email avatar")
    .then((user) => res.json({ user }))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    }) 
})



module.exports  = router