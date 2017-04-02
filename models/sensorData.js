/**
 * Created by CarlosSanchez on 4/1/17.
 */
/**
 * Created by DG on 4/1/17.
 */


var mongoose = require("mongoose");

var SensorSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true,
    },
    reading: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: Date,
        required: true,
    }
});

var Sensor = mongoose.model("Sensor", SensorSchema);
module.exports = Sensor;/**
 * Created by CarlosSanchez on 4/1/17.
 */
