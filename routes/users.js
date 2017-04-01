var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var middleware = require("../middleware/middleware.js");

/* GET users listing. */
router.post('/signup', function(req, res, next) {
    // if all fields are present
    if (req.body.email &&
        req.body.firstName &&
        req.body.lastName&&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
        }

        //Create object using the form input
        var userData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
        }

        //Use the User schema create method to save the document into the db
        User.create(userData, function(error, user){
            if(error){
                return next(error);
            }else{
                //requests the user id from the db and makes it the current session id
                req.session.userId = user._id;
                res.send("User created successfully!");
            }
        });


    }else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

/**
 * This request mapping allows to log in the app using the email and password provided
 * through the payload.
 */
router.post('/login', function(req, res, next) {
    if(req.body.email && req.body.password){
        User.authenticate(req.body.email, req.body.password, function(error, user){
            if(error || !user){
                var err = new Error("Wrong email or password");
                err.status = 401;
                return next(err);
            }else{
                req.session.userId = user._id;
                res.send("User authenticated");
                //return res.redirect("/profile");
            }
        });
    }else{
        var err = new Error("Both fields Email and password are required!");
        err.status = 401;
        return next(err);
    }
});

//GET logout
router.post("/logout", function(req,res,next){
    if(req.session){
        //delete the session object
        req.session.destroy(function(err){
            if(err){
                return next(err);
            }else{
                res.send("User logged out!");
            }
        });
    }
});


module.exports = router;
