/**
 * Created by DG on 4/1/17.
 * Sensor types that are in use:
 * 'temperature'
 * 'battery'
 * 'light'
 */

var express = require('express');
var db = require('../db/connection.js');
var Sensor = require('../models/sensorData.js');
var middleware = require("../middleware/middleware.js");

var router = express.Router();

/**
 * This mapping allows to create an battery entry, by providing the needed parameters
 * in the payload.
 */
router.post('/sensor/new', function(req, res, next) {

    var newSensorData = new Sensor(
        {
            type: req.body.type,
            reading: req.body.reading,
            timeStamp: new Date(req.body.timeStamp)
        }
    );

    newSensorData.save(function(error, resp){

        if(error){
            return next(error);
        }else{
            return res.send("Sensor Data Recorded!");
        }
    });
});

/**
 * This mapping allows to search for entries in the battery database
 * for any given amount of days. This amount of days is passed by parameters.
 */
router.get('/sensor/:type/:days/', function(req, res, next) {

    var dayInMs = 86400000;
    var currDate = new Date();

    currDate = currDate.getTime();
    var startDate = currDate - (dayInMs * req.params.days);

    startDate = new Date(startDate);
    console.log(startDate);

    Sensor.find({"type" : req.params.type, "timeStamp" :  {$gt : startDate}}, function(error, sensorData){
        if(!sensorData){
            res.send({message : "No battery entries for the given date!"});
        }
        res.send(sensorData);
    });
});

// /**
//  * This mapping allows to search for an event given its id.
//  */
// router.get('/events/:id', function(req, res, next) {
//
//     Battery.find({'_id' : req.params.id}, function(error, events){
//         if(!events){
//             res.send({message: "Event not found"});
//         }
//         res.send(events);
//     });
// });
//
// /**
//  * This mapping allows to up vote and event given its id
//  */
// router.post('/events/upvote',  function(req, res, next) {
//
//     //var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//
//     Event.findOne({'_id' : req.body.id}, function(error, thisEvent){
//         if(!thisEvent){
//             return res.send({error: "No event found with matching id!"});
//         } else {
//
//             thisEvent.upVote +=1;
//             thisEvent.save(function(error, resp){
//                 if(error){
//                     return res.send({error: "No errors", score: thisEvent.upVote});
//                 }else{
//                     return res.send({error: null, score: thisEvent.upVote});
//                 }
//             });
//         }
//     });
// });
//
// /**
//  * This mapping allows to down vote and event given its id
//  */
// router.post('/events/downvote', function(req, res, next) {
//
//     Event.findOne({'_id' : req.body.id}, function(error, thisEvent){
//         if(!thisEvent){
//             return res.send({error: "No event found with matching id!"});
//         } else {
//             thisEvent.downVote +=1;
//             thisEvent.save(function(error, resp){
//                 if(error){
//                     return res.send({error: "No errors", score: thisEvent.downVote});
//                 }else{
//                     return res.send({error: null, score: thisEvent.downVote});
//                 }
//             });
//         }
//     });
// });
//


module.exports = router;
