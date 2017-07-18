ko.utils.stringStartsWith = function(string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length) return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var Record = function (map,	id, title, name, homeTown, date, description, icon,	location) {	
	this.id = id;
	this.title = title;
	this.name = name;
	this.homeTown = homeTown;
	this.date = date;
	this.description = description;
	this.icon = icon;
	this.location = location;    
};

var ViewModel = function (records, homeTowns, markers) {
    var self = this;
    self.homeTowns = ko.observableArray(homeTowns);
    self.records = ko.observableArray(
        ko.utils.arrayMap(records, function (i) {
            return new Record(map,
							i.id,
							i.title,
							i.name,
							i.homeTown,
							i.date,
							i.description,
							i.icon,
							i.location);
        })
    );
	   
    self.nameSearch = ko.observable('');
    self.townSearch = ko.observable('');
    self.filteredRecords = ko.computed(function () {
		
        var nameSearch = self.nameSearch().toLowerCase(),
            townSearch = self.townSearch();
        return ko.utils.arrayFilter(self.records(), function (r) {
			//console.log('array filtered...');
			//console.log(self.records());
			
            return r.name.toLowerCase().indexOf(nameSearch) !== -1 &&
                (r.homeTown === townSearch || townSearch === "");
        });
		
    });
	getWeather = function(lt, lg, id){
	var html = document.getElementById(id);
	// Weather API from Openweather - define url with Coords & API-Key (Source: https://github.com/google/maps-for-work-samples/tree/master/samples/maps/OpenWeatherMapLayer)
		var weatherurl = "http://api.openweathermap.org/data/2.5/weather?lat=" + lt + "&lon=" + lg + "&APPID="+openWeatherMapAPI;
		// makes call to weather api
        $.ajax({
            url: weatherurl,
            dataType: "jsonp",
            success: function(response) {
				// math to calc temp found here: https://stackoverflow.com/questions/41686519/detect-a-geolocation-with-googleapis-and-receive-current-weather-for-this-locati
                temperature = Math.round(response.main.temp - 273.15);
                weather = response.weather["0"].description;
				html.innerHTML = 'Weather: '+weather+' / Temperature: '+temperature;
            },
            error: function(response) {
                weather = '<div class="alert alert-danger">Weather Not available right now - Maybe too much requests on weather api...</div>';
                temperature = '<div class="alert alert-danger">Temperature Not available right now - Maybe too much requests on weather api...</div>';
				html.innerHTML = weather+'<br>'+temperature;
            }
        });		
	}
// Initial function (Callback) for gmap API	
	initMap = function () {		
		// Create a script tag and set the Earthquake Data....
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
				loc = {lat: lat, lng: lng};			
				addMarker(loc, i);
				
		}
		map.addListener('click', bouncingListener);
	};
	// Close all InfowWindows
	closeAllInfoWindows = function() {	
		for (var i=0; i < infoWindows.length; i++) {
			infoWindows[i].close();
		}	
	};
// Create Marker & InfoWindows for Earthquake data from "earthquake.usgs.gov"
	window.eqfeed_callback = function(results) {		
		eqcontent = 'Here´s a Earthquakewarning';
		var infowindow = new google.maps.InfoWindow();
		for (var i = 0; i < results.features.length; i++) {
		  var coords = results.features[i].geometry.coordinates;
		  var latLng = new google.maps.LatLng(coords[1],coords[0]);
		  var marker = new google.maps.Marker({
			position: latLng,
			map: map,
			icon: {url: '/static/images/eq3.png',
			  size: new google.maps.Size(64, 64),	 
			  origin: new google.maps.Point(0, 0),	 
			  anchor: new google.maps.Point(0, 0)
			}
		  });
		   google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {					
                    infowindow.setContent(eqcontent);
                    infowindow.open(map, marker);
                }				
            })(marker, i)); 
		}		
	};	
}
ko.applyBindings(new ViewModel(places, homeTowns, markers, filteredRecords));
 
// Multilanguage Vars for JQUERY-Lang
var lang = new Lang();
	lang.dynamic('de', 'static/js/langpack/de.json');
	lang.init({
		defaultLang: 'en',
		cookie: {				
			name: 'langCookie',				
			expiry: 365,
			path: '/'
		}
	}
);