/**
 * Created by DG on 4/1/17.
 */
var mongoose = require('mongoose');


mongoose.connect('mongodb://root:root@ds025239.mlab.com:25239/events_db');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.on('open', function(){
        console.log("M-lab Connection Successful");
    }
);


module.exports = db;