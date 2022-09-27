const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
mongoose.set('debug', true);

const requiredString = {
    type:String,
    required:true
}

const UserSchema = mongoose.Schema({
    fname:requiredString,
    lname:requiredString,
    password:requiredString,
    email:requiredString,
    role:requiredString,
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

},{
    timestamp:true
})

UserSchema.pre('save',async function(next){
    console.log("first")
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
});

//generating token

UserSchema.methods.generateAuthToken = async function(){
    try {
        let token = jwt.sign({_id:this._id} , process.env.SECRET_KEY)

        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;

    } catch (error) {
        console.log(error)
    }
}


module.exports = mongoose.model('User' , UserSchema)