/**
 * Created by DG on 3/25/17.
 */
var body = $('body');



/*Sign up POST*/
$(function() {

    $("#contactForm input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var email = $("input#email").val();
            var firstName = $("input#firstName").val();
            var lastName = $("input#lastName").val();
            var password = $("input#password").val();
            var confirmPassword = $("input#confirmPassword").val();

            // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: "users/signup",
                type: "POST",
                data: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password,
                    confirmPassword: confirmPassword
                },
                cache: false,
                success: function() {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Your message has been sent. </strong>");
                    $('#success > .alert-success')
                        .append('</div>');

                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append($("<strong>").text("Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!"));
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
            });
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});





/**********************************************************************************************************************/
























/* Main*/
/*Load page */
loadPage();

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

