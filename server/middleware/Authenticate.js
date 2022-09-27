const jwt = require('jsonwebtoken')
const User = require('../models/User')

const Authenticate = async(req , res , next) =>{
    try {
        const token = req.cookies.jwtoken
        const verifiedToken = jwt.verify(token,process.env.SECRET_KEY)


        const rootUser = await User.findOne({_id:verifiedToken._id,"tokens.token":token})

        if(!rootUser){
            throw new Error("User not found")
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();

    } catch (error) {
        res.status(401).send("unauthorised")
        console.log(error)
    }
}

module.exports = Authenticate