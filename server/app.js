const express = require('express')
const app = express();
const mongoose = require('mongoose');
require('dotenv/config')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
const User = require('./models/User')
const router = express.Router()
const cors = require('cors');
const bcrypt = require('bcryptjs/dist/bcrypt');
const authenticate = require('./middleware/Authenticate')
const cookieParser = require('cookie-parser');
const Profile = require('./models/Profile');

app.use(cookieParser())
app.use(cors());
app.use('/', router);
app.use(express.static('client/build'))

router.use(cors())

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true , useUnifiedTopology: true} , console.log("connected to db"));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// user info

router.get('/info', authenticate , (req,res,next)=>{
    res.send(req.rootUser)
})


//register route
                                                               
router.post('/register' , async(req,res)=>{
    
    const { fname , lname , password , email } = req.body;

    if(!fname || !lname || !password || !email){
        return res.status(422).json({error:"please fill the fields properly"})
    }

    try {
        const userExist = await User.findOne({email:email})

        if(userExist){
            return res.status(422).json({error:"User already exists"})
        }

        const user = new User({fname , lname , password , email ,role:"normaluser"})
        const profile = new Profile({fname,lname,email,foodInfo:[]})
        
        await profile.save();
        await user.save();
        res.status(200).json({message:"user registered succesfully"})
    } catch (error) {
        console.log(error)
    }
})

// login route

router.post('/signin', async(req,res)=>{
    try {
        const { email , password} = req.body
        if(!email || !password){
            return res.status(400).json({error:"data invalid"})
        }

        const userLogin = await User.findOne({email:email});
        if(userLogin){
            const isMatch = await bcrypt.compare(password , userLogin.password)

           const token = await userLogin.generateAuthToken()

            res.cookie("jwtoken", token, {
                expires:new Date(Date.now()+25892000000)
            });

            if(isMatch){
                return res.status(200).json({message:"signin successful"})
            }else{
                return res.status(400).json({message:"invalid Credentials"})
            }
            
        }else{
            return res.status(400).json({message:"invalid Credentials"})
        }
        
    } catch (error) {
        return res.status(400).json({message:error})
    }
})


//logout

router.get('/logout', (req,res)=>{
    res.clearCookie('jwtoken')
    res.status(200).send('logout successfully')
})


// user data

router.post('/fooddata' , async(req,res)=>{
    const {fname , lname , email , foodInfo} = req.body;
        try {
            const query = {fname , lname , email}
            const update = {"$push": { "foodInfo": foodInfo }}
            const options = { returnNewDocument: true };
            const profilereq = await Profile.findOneAndUpdate(query, update, options)
            const profileData = await profilereq.save()
            res.status(201).send(profileData);
        } catch (error) {
            // res.status(404).send(error)
            console.log(error)
        }

})


//get user data 

router.get('/fooddata', authenticate , async(req,res)=>{
    const {email} = req.rootUser;
    const userdata = await Profile.findOne({email});
    res.send(userdata)
    
})

router.get('/userdata', authenticate , async(req,res)=>{
    const userdata = await Profile.find();
    res.send(userdata)
    
})

//delete user 

router.delete('/deleteUser/:id', async(req, res)=> {

    var id = req.params.id;

    Profile.findOneAndDelete({ _id : id }, function (err, docs) {
        if (err){
            console.log(err)
            res.status(404).send("failed!")
        }
        else{
            res.status(200).send("user deleted successfully")
        }
        })
})




    if(process.env.NODE_ENV == "production"){
        app.use(express.static('client/build'))
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT}!!!!!!!!!`);
    });

