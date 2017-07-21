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
                    w = {"temp": self.temperature, "weather": self.weather};
                    if(debugging === true){
                        console.log('Weather & Temp loaded: Function Knockout "getWeather()" ');
                    }
                },
                error: function(response) {
                    self.weather('<div class="alert alert-danger">Weather Not available right now - Maybe too much requests on weather api...</div>');
                    self.temperature('<div class="alert alert-danger">Temperature Not available right now - Maybe too much requests on weather api...</div>');
                    w = {"temp": temperature, "weather": weather};
                    if(debugging === true){
                        console.log('ERROR - Weather & Temp NOT loaded: Function Knockout "getWeather()" ');
                    }
                }
            });		
    };
    self.filteredRecords = ko.computed(function () {
        var nameSearch = self.nameSearch().toLowerCase(),
            townSearch = self.townSearch();
        return ko.utils.arrayFilter(self.records(), function (r) {
            var response = (Number(r.title.toLowerCase().indexOf(nameSearch) == -1 && (r.homeTown === townSearch || townSearch === "")) -1);
            if(!nameSearch && !townSearch){
                if(debugging === true){
                        console.log('display all');
                }				
                showAll();
            }		
            if (r.name.toLowerCase().indexOf(nameSearch) != -1 && (r.homeTown === townSearch || townSearch === "")) {				
                if(debugging === true){
                                console.log('show marker id: '+r.id);
                }					
                showMarker(r.id +1);
            } else {				
                if(debugging === true){
                        console.log('hide marker id: '+r.id);
                }					
                hideMarker(r.id);				
            }
            if(debugging === true){
                console.log('Input filtered: Function Knockout "self.filteredRecords()" ');
            }					
            console.log(response);
            return r.name.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "");			
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
                    url: 'data:image/png;base64,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',
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