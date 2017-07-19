var Record = function (map, id, title, name, homeTown, date, description, icon, location, marker) {
    this.id = id;
    this.title = title;
    this.name = name;
    this.homeTown = homeTown;
    this.date = date;
    this.description = description;
    this.icon = icon;
    this.location = location;
	this.marker = marker;
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
                i.location,
				i.marker);
        })
    );
	self.map = ko.observable(map);
    self.nameSearch = ko.observable('');
    self.townSearch = ko.observable('');
    self.filteredRecords = ko.computed(function () {

        var nameSearch = self.nameSearch().toLowerCase(),
            townSearch = self.townSearch();
        return ko.utils.arrayFilter(self.records(), function (r) {
            //console.log('array filtered...');
            //console.log(self.records());
			for (var i = 0; i < markers.length; i++) {				
				
				if(r.title.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "")){
					if(r.id === markers[i].id){
						markers[i].setVisible(true);
						console.log('visible: '+markers[i].id);
					} if(r.id !== markers[i].id) {
						markers[i].setVisible(false);
						console.log('invisible');					
					}					
				}

			}
			console.log(r.title.toLowerCase().indexOf(nameSearch));
            return r.title.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "");
        });

    }, self);
	
    // Initial function (Callback) for Google Maps API
    initMap = function () {
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
            addMarker(lat, lng, i, places);

        }
        map.addListener('click', bouncingListener);
    };
    // Close all InfowWindows
    closeAllInfoWindows = function () {
        for (var i = 0; i < infoWindows.length; i++) {
            infoWindows[i].close();
        }
    };
	loadInfoWindowContent = function (index, lt, lg){
		var weatherurl = "http://api.openweathermap.org/data/2.5/weather?lat="+lt+"&lon="+lg+"&APPID="+openWeatherMapAPI;
		var c;
		c = '<img width="20px;" height="20px;" src="'+places[index].icon+'"><h3>'+places[index].title+'</h3><br>'+
		'<i>'+places[index].description+'</i><br>'+
		'<span id="wdata">Weather: '+places[index].weather+' / Temperature: '+places[index].temp+'</span>';
		// makes call to weather api
			$.ajax({
				url: weatherurl,
				dataType: "jsonp",
				success: function(response) {
					// math to calc temp found here: https://stackoverflow.com/questions/41686519/detect-a-geolocation-with-googleapis-and-receive-current-weather-for-this-locati
					temperature = Math.round(response.main.temp - 273.15);
					weather = response.weather["0"].description;			
					console.log(weather+'<br>'+temperature);
				},
				error: function(response) {
					weather = '<div class="alert alert-danger">Weather Not available right now - Maybe too much requests on weather api...</div>';
					temperature = '<div class="alert alert-danger">Temperature Not available right now - Maybe too much requests on weather api...</div>';

					console.log(weather+'<br>'+temperature);
				}
			});
		return c;
	};

	// Adds a marker to the map and push to the array.
	addMarker = function(lat, lng, i, alllocations) {
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
			id: datas[i].id,
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
				infowindow.setContent(loadInfoWindowContent(i, la, lo));
				infowindow.open(map, marker);
			}				
		})(marker, i));
	};
	getWeather = function(lt, lg, id){
		var html = document.getElementById(id);
		// Weather API from Openweather - define url with Coords & API-Key (Source: https://github.com/google/maps-for-work-samples/tree/master/samples/maps/OpenWeatherMapLayer)
		var weatherurl = "http://api.openweathermap.org/data/2.5/weather?lat="+lt+"&lon="+lg+"&APPID="+openWeatherMapAPI;
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
	};
    // Create Marker & InfoWindows for Earthquake data from "earthquake.usgs.gov"
	// WARNING: i know i should write code like "Udacity Style Guide / naming guide"
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
    };
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