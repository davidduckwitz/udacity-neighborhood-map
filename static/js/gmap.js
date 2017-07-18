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
	console.log('Load Place with id'+index);
	lat = Number(places[index].location.lat);
	lng = Number(places[index].location.lng);
	coord = {lat: lat, lng: lng};
	console.log(coord);
	deleteMarkers();
	window.setTimeout(function() {
		addMarker(coord, index);
	}, 500);	
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

function loadInfoWindowContent(index, lt, lg){
	var c = '<img width="20px;" height="20px;" src="'+places[index].icon+'"><h3>'+places[index].title+'</h3><br>'+
	'<i>'+places[index].description+'</i><br>'+
	'<span id="wdata"></span>';	
	setTimeout(function(){ getWeather(lt, lg, 'wdata'); }, 300);
	return c;
}

// Adds a marker to the map and push to the array.
function addMarker(location, i) {
	var infowindow = new google.maps.InfoWindow();
	var marker;
	datas = places;
	marker = new google.maps.Marker({
		position: loc,
		map: map,
		icon: places[i].icon,
		title: places[i].title,
		visible: true
	});
	markers.push(marker);
	console.log(marker);
	marker.addListener('click', bouncingListener);
	//add infowindow to array
	infoWindows.push(infowindow);
	google.maps.event.addListener(marker, 'click', (function (marker, i) {
		
		return function () {
			closeAllInfoWindows();
			infowindow.setContent(loadInfoWindowContent(i), location.lt, location.lg);
			infowindow.open(map, marker);
		}				
	})(marker, i));	
		
}

/****************************************
 * Error callback for GMap API request***
 ****************************************/
var mapError = function() {  
  alert('Error Loading GoogleMaps Data vom API V3 - Please Check your Code');
};