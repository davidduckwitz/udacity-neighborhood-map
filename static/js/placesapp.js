var Record = function Record(map, id, title, name, homeTown, date, description, icon, location, marker) {
	this.id = id;
    this.title = title;
    this.name = name;
    this.homeTown = homeTown;
    this.date = date;
    this.description = description;
    this.icon = icon;
    this.location = location;	
};

var ViewModel = function (records, homeTowns, markers, weathers) {
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
                i.location,
				i.marker);
        })
    );
	// Knockout Observable on Weather Data from Openweather API
	self.weather = ko.observable('No Weather for this Place');
	self.temperature = ko.observable('No Temperature for this Place');	
	self.map = ko.observable(map);
    self.nameSearch = ko.observable('');
    self.townSearch = ko.observable('');
	self.markers = ko.observable(markers);
	// Sets the map on all markers in the array.
	setMapOnAll = function(map) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	};
	
	// Hide all Markers
	hideAll = function() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setVisible(false);
		}
		if(debugging === true){
			console.log('Hide all Marker: Function Knockout "hideAll()" ');
		}
	};
	
	hideMarker = function(index) {
		for (var i = 0; i < markers.length; i++) {
			if( i === index){
				markers[i].setVisible(false);
			}		  
		}
		if(debugging === true){
			console.log('Hide a Marker: Function Knockout "hideMarker()" ');
		}
	};
	
	showMarker = function(index) {
		for (var i = 0; i < markers.length; i++) {
			if( i === index){
				markers[i].setVisible(true);
			}		  
		}
		if(debugging === true){
			console.log('Show a Marker: Function Knockout "showMarker()" ');
		}
	};
	
	showAll = function() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setVisible(true);
		}
		if(debugging === true){
			console.log('all Markers shown: Function Knockout "showAll()" ');
		}
	};
	
    // Close all InfowWindows
    closeAllInfoWindows = function () {
        for (var i = 0; i < infoWindows.length; i++) {
            infoWindows[i].close();
        }
		if(debugging === true){
			console.log('all InfoWindows closed: Function Knockout "closeAllInfoWindows()" ');
		}
    };	
	loadInfoWindowContent = function (index, lt, lg){
		getWeather(lt, lg, index);
		var c;
		c = '<img width="20px;" height="20px;" src="'+places[index].icon+'"><h3>'+places[index].title+'</h3><br>'+
			'<i>'+places[index].description+'</i><br>'+
			'<span data-bind="text: weather">'+self.weather()+'</span> <span data-bind="text: temperature">'+self.temperature()+'</span>° Celsius';
		if(debugging === true){
			console.log('InfoWindowContent loaded: Function Knockout "loadInfoWindowContent()" ');
		}
		return c;
	};
	
	getWeather = function(lt, lg, index){		
		// Weather API from Openweather - define url with Coords & API-Key (Source: https://github.com/google/maps-for-work-samples/tree/master/samples/maps/OpenWeatherMapLayer)
		var weatherurl = "http://api.openweathermap.org/data/2.5/weather?lat="+lt+"&lon="+lg+"&APPID="+openWeatherMapAPI;
		// makes call to weather api
		$.ajax({
			url: weatherurl,
			dataType: "jsonp",
			places: places,
			index: index,
			success: function(response) {
				// math to calc temp found here: https://stackoverflow.com/questions/41686519/detect-a-geolocation-with-googleapis-and-receive-current-weather-for-this-locati
				self.temperature(Math.round(response.main.temp - 273.15));
				self.weather(response.weather["0"].description);				
				if(debugging === true){
					console.log('Weather & Temp loaded: Function Knockout "getWeather()" ');
				}
			},
			error: function(response) {
				self.weather('<div class="alert alert-danger">Weather Not available right now - Maybe too much requests on weather api...</div>');
				self.temperature('<div class="alert alert-danger">Temperature Not available right now - Maybe too much requests on weather api...</div>');				
				if(debugging === true){
					console.log('ERROR - Weather & Temp NOT loaded: Function Knockout "getWeather()"ERROR: '+response);
				}
			}
		});		
	};
    self.filteredRecords = ko.computed(function () {

        var nameSearch = self.nameSearch().toLowerCase(),
            townSearch = self.townSearch();
        return ko.utils.arrayFilter(self.records(), function (r) {
			var response = (Number(r.title.toLowerCase().indexOf(nameSearch) == -1 && (r.homeTown === townSearch || townSearch === "")) -1);
			var isMatching = r.name.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "");
			
			// Thanks to Udacity Reviewer for Hints & suggestions...
			if(isMatching === true){
				if(debugging === true){
						console.log('show marker id: '+r.id);
				}					
				showMarker(r.id);
			}
			if(isMatching === false){
				if(debugging === true){
					console.log('hide marker id: '+r.id);
				}					
				hideMarker(r.id);
			}
			
			if(debugging === true){
				console.log('Input filtered: Function Knockout "self.filteredRecords()" ');
				console.log(response);
			}
            return isMatching;			
        });

    }, self);
	// Create Marker & InfoWindows for Earthquake data from "earthquake.usgs.gov"
//REVIEWER	--> ATTENTION: i know i should write code like "Udacity Style Guide / naming guide"
	// But google named it like me: https://developers.google.com/maps/documentation/javascript/earthquakes?hl=de
	// Because it's not a self written function - It's a function from "earthquake.usgs.gov"
    window.eqfeed_callback = function (results) {
        eqcontent = 'Here´s a Earthquakewarning';
        var infowindow = new google.maps.InfoWindow();
        for (var i = 0; i < results.features.length; i++) {
            var coords = results.features[i].geometry.coordinates;
            var latLng = new google.maps.LatLng(coords[1], coords[0]);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: {
                    url: '/static/images/eq3.png',
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
		if(debugging === true){
			console.log('Earthquake data loaded...');
		}
    };
	if(debugging === true){
		console.log('Knockout ViewModel loaded');
	}
}
ko.applyBindings(new ViewModel(places, homeTowns, markers));
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
});