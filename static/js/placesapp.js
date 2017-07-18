var Record = function (map, id, title, name, homeTown, date, description, icon, location) {
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
			for (var i = 0; i < markers.length; i++) {
				
				if(r.name.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "")){
					console.log('Set Marker to "visible"');
					markers[i].setVisible(true);
				} else {
					markers[i].setVisible(false);
					console.log('Set Marker to "invisible"');
				}
			 
			}
            return r.name.toLowerCase().indexOf(nameSearch) !== -1 && (r.homeTown === townSearch || townSearch === "");
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
});