"use strict";

import UnicornRides from 'UnicornRides/Rides';

const rides = new UnicornRides();

$(function onDocReady() {
    $('#request').click(event => rides.handleRequestClick(event));
    $('#signOut').click(function() {
        rides._application.getAuth().signOut();
        alert("You have been signed out.");
        window.location = "/signin.html";
    });
});
