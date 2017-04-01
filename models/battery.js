/**
 * Created by DG on 4/1/17.
 */


var mongoose = require("mongoose");

var BatterySchema = new mongoose.Schema({
    voltage: {
        type: String,
        required: true,
    },
    load: {
        type: String,
        required:true,
    },
    timeStamp: {
        type: Date,
        required: true,
    }
});

var Battery = mongoose.model("Battery", BatterySchema);
module.exports = Battery;/**
 * Created by CarlosSanchez on 4/1/17.
 */
