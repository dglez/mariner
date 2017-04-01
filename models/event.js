/**
 * Created by DG on 4/1/17.
 */


var mongoose = require("mongoose");

var EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required:true,
        trim:true,
    },
    zip: {
        type: String,
        required:true,
        trim:true,
    },
    upVote: {
        type: Number,
        required: true
    },
    downVote: {
        type: Number,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true,
    }
});

var Event = mongoose.model("Event", EventSchema);
module.exports = Event;