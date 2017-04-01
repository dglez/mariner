/**
 * Created by DG on 4/1/17.
 */

var express = require('express');
var db = require('../db/connection.js');
var Event = require('../models/event.js');
var middleware = require("../middleware/middleware.js");

var router = express.Router();

/**
 * This mapping allows to create an Event, by providing the needed parameters
 * in the payload.
 */
router.post('/events/new', function(req, res, next) {

    var newEvent = new Event(
        {
            name: req.body.name,
            description: req.body.description,
            zip: req.body.zip,
            upVote: 0,
            downVote: 0,
            timeStamp: new Date
        }
    );

    newEvent.save(function(error, resp){

        if(error){
            return next(error);
        }else{
            return res.send("Event created!")
        }
    });
});

/**
 * This mapping allows to search for events given a zip code.
 */
router.get('/events/:zip', function(req, res, next) {
    Event.find({'zip' : req.params.zip}, function(error, events){
        if(!events){
            res.send({message : "No events found for this zip-code."});
        }
        res.send(events);
    });
});

/**
 * This mapping allows to search for an event given its id.
 */
router.get('/events/:id', function(req, res, next) {

    Event.find({'_id' : req.params.id}, function(error, events){
        if(!events){
            res.send({message: "Event not found"});
        }
        res.send(events);
    });
});

/**
 * This mapping allows to up vote and event given its id
 */
router.post('/events/upvote',  function(req, res, next) {

    //var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    Event.findOne({'_id' : req.body.id}, function(error, thisEvent){
        if(!thisEvent){
            return res.send({error: "No event found with matching id!"});
        } else {

            thisEvent.upVote +=1;
            thisEvent.save(function(error, resp){
                if(error){
                    return res.send({error: "No errors", score: thisEvent.upVote});
                }else{
                    return res.send({error: null, score: thisEvent.upVote});
                }
            });
        }
    });
});

/**
 * This mapping allows to down vote and event given its id
 */
router.post('/events/downvote', function(req, res, next) {

    Event.findOne({'_id' : req.body.id}, function(error, thisEvent){
        if(!thisEvent){
            return res.send({error: "No event found with matching id!"});
        } else {
            thisEvent.downVote +=1;
            thisEvent.save(function(error, resp){
                if(error){
                    return res.send({error: "No errors", score: thisEvent.downVote});
                }else{
                    return res.send({error: null, score: thisEvent.downVote});
                }
            });
        }
    });
});



module.exports = router;
