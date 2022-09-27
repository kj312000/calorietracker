const mongoose = require('mongoose');
mongoose.set('debug', true);

const requiredString = {
    type:String,
    required:true
}

const nonrequiredString = {
    type:String,
    required:false
}

const nonrequiredNumber = {
    type:Number,
    required:false
}

const requiredNumber = {
    type:Number,
    required:true
}

const ProfileSchema = mongoose.Schema({
        fname:requiredString,
        lname:requiredString,
        email:requiredString,
        foodInfo:[
            {
                foodname:nonrequiredString,
                calories:nonrequiredNumber,
                price:nonrequiredNumber,
                dateandtime:nonrequiredString
            }
        ]
},{
    timestamp:true
})
module.exports = mongoose.model('Profile' , ProfileSchema)