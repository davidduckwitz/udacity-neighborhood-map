// Enable / Disable Mini-Debugging Mode
var debugging = true;

// Variables
var mapstart = {lat: 50.55809, lng: 9.68084};
var openWeatherMapAPI = '9674e5fa9add44c373be389b10566f0a';
var markers = [];
var infoWindows = [];
var weathers = [];
var map;
var bounds;
var bouncingMarker = null;
var r;
var records;

// Show Message in Console how to Activate / De-Activate Mini-Debugging Mode
if(debugging === true){
	console.log('DEBUGGING MODE ON !!! SET true to "false" in "/static/js/gmap.js" / LINE 2 (var debugging = true) to deactivate');
} else {
	console.log('DEBUGGING MODE OFF !!! SET false to "true" in "/static/js/gmap.js" / LINE 2 (var debugging = false) to activate and see console.log()');
}

// Initial function (Callback) for Google Maps API
var initMap = function () {
	// Create the script tag for the Earthquake Data
	var script = document.createElement('script');
	script.src = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp';
	document.getElementsByTagName('head')[0].appendChild(script);
	bounds = new google.maps.LatLngBounds();
	// gmapstyles are loaded from "static/js/gmapstyles.js"
	map = new google.maps.Map(document.getElementById('gmap'), {
		center: mapstart,
		zoom: 5,
		styles: gmapstyles
	});
	// Iterate trough my places / add marker & eventlistener
	for (i = 0; i < places.length; i++) {
		var lat = places[i].location.lat;
		var lng = places[i].location.lng;		
		getWeather(lat, lng, i);
		addMarker(lat, lng, i, places);
	}
	if(debugging === true){
		console.log('Google Map Initialized: Function "initMap"');
	}
};

/********************************
 * In listview onclick of place *
 *******************************/
function loadPlace(index) {
	markers[index].setAnimation(null);
	// Create a trigger like udacity reviewer suggested
	google.maps.event.trigger(markers[index], 'click');
	if(debugging === true){
		console.log('Place loaded: Function "loadPlace()" '+index);
	}
};

// Thanks to URL https://stackoverflow.com/questions/8247626/bouncing-marker (The accepted Answer)
var bouncingListener = function(marker) {	
	if(bouncingMarker){
		bouncingMarker.setAnimation(null);
	}
	if(bouncingMarker != this) {
		this.setAnimation(google.maps.Animation.BOUNCE);
		bouncingMarker = this;
	} else {
		bouncingMarker = null;
	}
	if(debugging === true){
		console.log('Bouncing of Marker analyzed: Function "bouncingListener"');
	}
};

function loadInfoWindowContent(index, lt, lg){
	var lat = Number(lt);
	var lng = Number(lg);	
	getWeather(lat, lng, index);
	if(debugging === true){
		console.log('InfoWindowContent loaded: Function "loadInfoWindowContent()" '+index);
	}
}

// Adds a marker to the map and push to the array.
function addMarker(lat, lng, i, alllocations) {
	var infowindow = new google.maps.InfoWindow();
	var marker;
	var la = lat;
	var lo = lng;
	var loc = { lat: lat, lng: lng };
	datas = alllocations;
	marker = new google.maps.Marker({
		position: loc,
		map: map,
		icon: datas[i].icon,
		title: datas[i].title,
		visible: true
	});
	marker.addListener('click', bouncingListener);
	//add infowindow to array
	infoWindows.push(infowindow);	
	google.maps.event.addListener(marker, 'click', (function (marker, i) {		
		return function () {
			closeAllInfoWindows();
			infowindow.setContent(loadInfoWindowContent(i, la, lo));
			infowindow.open(map, marker);
		}				
	})(marker, i));	
	markers.push(marker);
	if(debugging === true){
		console.log('addMarker setted: Function "addMarker()" ');
	}
}

/****************************************
 * Error callback for GMap API request***
 ****************************************/
var mapError = function() {
	if(debugging === true){
		console.log('Google Map Loading error: Function "mapError()" '+index);
	}
	alert('Error Loading GoogleMaps Data vom API V3 - Please Check your Code');
};