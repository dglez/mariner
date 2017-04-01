/**
 * Created by DG on 4/1/17.
 */

var mongoose = require('mongoose');
var bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    upVotes : { type : Array , "default" : [] },
    downVotes : { type : Array , "default" : [] }
});

//Authenticate imput against database documents
UserSchema.statics.authenticate = function(email, password, callback){
    User.findOne({ email: email}).exec(function(error, user){
        if(error){
            return callback(error);
        }else if (! user){
            var err = new Error("User not found.");
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(error, result){
            if(result === true){
                return callback(null, user);
            }else{
                return callback();
            }
        });
    });
}

//hash password before saving.
UserSchema.pre("save", function(next){
    //this is the object about to be saved
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;