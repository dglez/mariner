/**
 * Created by DG on 4/1/17.
 */

function loggedOut(req,res,next){
    if(req.session && req.session.userId){
        return res.redirect("/profile");
    }
    return next();
}
function checkIfLoggedIn(req,res, next){
    if(req.session && req.session.userId){
        return next();
    }else{
        var err = new Error("You must login to view this page!");
        err.status = 401;
        return next(err);
    }
}
module.exports.loggedOut = loggedOut;
module.exports.checkIfLoggedIn = checkIfLoggedIn;