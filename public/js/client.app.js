/**
 * Created by DG on 3/25/17.
 */
var body = $('body');


var api_default = 'api/sensor/battery/7';
$.get(api_default, function (api_res) {

    var data = new Array();
    for (i = 0; i <  api_res.length; i++){

        data.push({'date': new Date(api_res[i].timeStamp), 'value':parseInt(api_res[i].reading)});

    }

    MG.data_graphic({
        title: "",
        description: "This graphic shows a time-series of downloads.",
        data: data,
        width: 700,
        height: 550,
        target: '.graph',
        x_accessor: 'date',
        y_accessor: 'value'
    });
});


/**********************************************************************************************************************/



$(".menu-item").on('click',function (e) {
    e.preventDefault();

    var sensor = $(this);

    var api_key = 'api/sensor/' + sensor.attr('data-api') +"/" + sensor.attr('data-time');

    $('.title').html(sensor.attr('data-api'));
    $('.sub-title').html(sensor.attr('data-unit') + " vs time");



    $.get(api_key, function (api_res) {

        var data = new Array();
        for (i = 0; i <  api_res.length; i++){

            data.push({'date': new Date(api_res[i].timeStamp), 'value':parseInt(api_res[i].reading)});

        }

        MG.data_graphic({
            title: "",
            description: "This graphic shows a time-series of downloads.",
            data: data,
            width: 700,
            height: 550,
            target: '.graph',
            x_accessor: 'date',
            y_accessor: 'value'
        });
    });



});












/* Main*/
/*Load page */
// loadPage();

/**********************************************************************************************************************/



//prepare URL to get Zip
function prepare_api_url(latitude, longitude){
    var api_key = "AIzaSyCEPHkBSiLOrKJZ3_K6Ndwi6Ofx_2haTm4";
    var api_url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    return api_url + latitude + ',' + longitude + "&key=" + api_key;
}

/**********************************************************************************************************************/


/*Load Page */
function loadPage() {
    navigator.geolocation.getCurrentPosition(function(pos){
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        getZip(lat,lon, getEevents);


    });
}
/**********************************************************************************************************************/


//GET Event from the Form with Zip code
$(".form-inline").submit(function(e){
    e.preventDefault();

    $("#events").html('');
    var zip = $("#zip").val();
    getEevents(zip);
});
/**********************************************************************************************************************/


//Get zip to use
function getZip(lat, lon, callback) {
    var url = prepare_api_url(lat,lon);
    $.get(url, function (data) {

        var results = data.results[0];
        var addrs = results.address_components;
        console.log(addrs.length);

        var i = 0;
        var found = false;
        while(i < addrs.length && !found){
            found = (addrs[i].types[0] === "postal_code")? true : false;
            i++;
        }
        i--;

        var zip = addrs[i].long_name;
        callback(zip);



    });
}
/**********************************************************************************************************************/



//Appends a list of events to the DOM
function getEevents(zip) {
    var api_load_key = "api/events/" + zip;
    $.get(api_load_key, function (api_res) {


        for(i = 0; i < api_res.length; i++ ){
            var li = "<li class=\'list-group-item\' id=\'"+ api_res[i]._id +
                "\'> <div class=\'col-xs-6\'>" + api_res[i].name +
                "</div><div class=\'col-xs-offset-2 col-xs-1\'>" +
                "<span class=\'glyphicon glyphicon-thumbs-up active-thumb \' data-up=\'true\' aria-hidden=\'true\'>" +
                "</span></div><div class=\'col-xs-1\'>" + api_res[i].upVote +
                "</div><div class=\'col-xs-1\'>" +
                "<span class=\'glyphicon glyphicon-thumbs-down active-thumb\' data-up=\'false\' aria-hidden=\'true\'>" +
                "</span>" + "</div><div class=\'col-xs-1\'>" + api_res[i].downVote +"</div>" + "</li>";

            $('#events').append(li);
            $('#zip').val(zip);
        }

    });
}
/**********************************************************************************************************************/

/*UPDATE LIKES*/
body.on('click','.active-thumb', function () {
    var thumb_up = $(this);
    var score = thumb_up.parent().next();
    var id_upvote = thumb_up.parent().parent().attr('id');
    var api_key = (thumb_up.attr('data-up') === "true")?"api/events/upvote" : "api/events/downvote" ;

    $.ajax({
        url: api_key,
        method: "POST",
        data: {id: id_upvote},
        success: function (data) {

            if(data.error === null){
                score.text(data.score);
                thumb_up.removeClass('active-thumb');
            }
        }

    });
});







/*TODO add siugn up form */

/*
 *
 <!--Search Form-->
 <section class="row">
 <form id="contactForm" novalidate>
 <div class="form-group">
 <input type="email" class="form-control" id="email" placeholder="Email">
 </div>
 <div class="form-group">
 <input type="text" class="form-control" id="firstName" placeholder="First name">
 </div>
 <div class="form-group">
 <input type="text" class="form-control" id="lastName" placeholder="Last Name">
 </div>
 <div class="form-group">
 <input type="password" class="form-control" id="password" placeholder="Password">
 </div>
 <div class="form-group">
 <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password">
 </div>
 <button type="submit" class="btn btn-default">Submit</button>

 </form>
 <div id="success"></div>



 </section>
 <!--END Search Form-->



 */

