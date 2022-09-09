const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const login = require("../middleware/login");

router.post('/signup', async (req, res) => {
    try {
        const { email, name, password, avatar } = req.body

        if (!email || !name || !password)
            return res.status(422).json({ error: "Please add all the fileds" });

            
        User.findOne({ email })
            .then((savedUser) => {
                if (savedUser) return res.status(422).json({ error: "User already exist with that email!" })

                bcrypt.hash(password, 10)
                    .then((hashedPassword) => {
                        const user = new User({ email, name, password: hashedPassword, avatar })
                        user.save()
                            .then((user) => {
                                res.status(201).json({ message: "Success", user });
                            })
                    })
                
            })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

router.post("/signin", (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) return res.status(422).json({ error: "All field is required! Please add email or password!" })

        User.findOne({ email })
            .then((savedUser) => {
                if (!savedUser) return res.status(422).json({ error: "That email is not registered!" })

                bcrypt.compare(password, savedUser.password)
                    .then((isMatch) => {
                        if (!isMatch) return res.status(422).json({ error: "Password or email is invalid!" })
                        
                        const token = jwt.sign({_id: savedUser._id}, process.env.JWTSECRET_KEY)
                        const {password, __v, ...other} = savedUser._doc
                        res.status(200).json({ 
                            message: "Signin successfully!", 
                            user: other, 
                            access_token: token 
                        })
                    })
            })
    } catch (error) {
        res.status(500).json({ error: error.message, success: false })
    }
})

module.exports = router