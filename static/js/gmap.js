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
var weathers = [];

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
		loc = { lat: lat, lng: lng };
		getWeather(lat, lng, i);
		addMarker(lat, lng, i, places);

	}
	map.addListener('click', bouncingListener);
};

/********************************
 * In listview onclick of place *
 *******************************/
function loadPlace(index) {		
	console.log('Load Place with id'+index);
	lat = Number(places[index].location.lat);
	lng = Number(places[index].location.lng);
	coord = {lat: lat, lng: lng};
	console.log(coord);
	for (var i = 0; i < markers.length; i++) {
		markers[i].setAnimation(null);
	}
	markers[index].setAnimation(google.maps.Animation.DROP);
	markers[index].setAnimation(google.maps.Animation.BOUNCE);
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

function loadInfoWindowContent(index, lt, lg){
	var lat = Number(lt);
	var lng = Number(lg);	
	getWeather(lat, lng, index);
	
}

// Adds a marker to the map and push to the array.
function addMarker(lat, lng, i, alllocations) {
	var infowindow = new google.maps.InfoWindow();
	var marker;
	var la = lat;
	var lo = lng;
	datas = alllocations;
	marker = new google.maps.Marker({
		position: loc,
		map: map,
		icon: datas[i].icon,
		title: datas[i].title,
		visible: true
	});
	
	console.log(marker);
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
}

/****************************************
 * Error callback for GMap API request***
 ****************************************/
var mapError = function() {  
  alert('Error Loading GoogleMaps Data vom API V3 - Please Check your Code');
};