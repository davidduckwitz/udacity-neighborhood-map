// Variables
var mapstart = {lat: 50.55809, lng: 9.68084};
var openWeatherMapAPI = '9674e5fa9add44c373be389b10566f0a';	
var bounds;
var markers = [];
var map;
var infoWindows = [];
var infoWindow;
var bouncingMarker = null;
var Record;
var r;
var records;
var dats = places;
var filteredRecords;
var html = [];
var wd = [];

/*******************************
 * In listview onclick of place*
 ******************************/
function loadPlace(index) {	
	lat = Number(places[index].location.lat);
	lng = Number(places[index].location.lng);
	coord = {lat: lat, lng: lng};	
	window.setTimeout(function() {		
		for (var i = 0; i < markers.length; i++) {
			if(i !== index){				
				markers[i].setAnimation(null)
			}
			if(i === index){				
				markers[i].setAnimation(google.maps.Animation.BOUNCE)
			}		 
		}
	}, 100);	
};

// Thanks to URL https://stackoverflow.com/questions/8247626/bouncing-marker (The accepted Answer)
var bouncingListener = function() {	
	if(bouncingMarker){
		bouncingMarker.setAnimation(null);
	}
	if(bouncingMarker != this) {
		this.setAnimation(google.maps.Animation.BOUNCE);
		bouncingMarker = this;
	} else {
		bouncingMarker = null;
	}
};

// Sets the map on all markers in the array.
setMapOnAll = function(map) {
	for (var i = 0; i < markers.length; i++) {
	  markers[i].setMap(map);
	}
};

// Removes the markers from the map, but keeps them in the array.
clearMarkers = function() {
	setMapOnAll(null);
};

// Shows any markers currently in the array.
showMarkers = function() {
	setMapOnAll(map);
};

// Deletes all markers in the array by removing references to them.
deleteMarkers = function() {
	clearMarkers();
	markers = [];
};

/****************************************
 * Error callback for GMap API request***
 ****************************************/
var mapError = function() {  
	alert('Error Loading GoogleMaps Data vom API V3 - Please Check your Code');
};