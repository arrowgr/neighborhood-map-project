"use strict";


var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
	var styles = [{
		featureType: 'water',
		stylers: [{
			color: '#19a0d8'
		}]
	}];

	// Constructor creates a new map - only center and zoom are required.


	// These are the real estate listings that will be shown to the user.
	// Normally we'd have these in a database instead.
	var locations = [{
		title: 'Macedonian Museum of Contemporary Art',
		location: {
			lat: 40.627276,
			lng: 22.95465
		}
	}, {
		title: 'White Tower of Thessaloniki',
		location: {
			lat: 40.626446,
			lng: 22.948426
		}
	}, {
		title: 'Arch of Galerius',
		location: {
			lat: 40.63211,
			lng: 22.951668
		}
	}, {
		title: 'Alexander the Great Statue',
		location: {
			lat: 40.624053,
			lng: 22.949864
		}
	}, {
		title: 'Museum of Byzantine Culture',
		location: {
			lat: 40.6239,
			lng: 22.955058
		}
	}, {
		title: 'War Museum of Thessaloniki',
		location: {
			lat: 40.624275,
			lng: 22.959536
		}
	}, {
		title: 'Square Ancient Agora',
		location: {
			lat: 40.636706,
			lng: 22.944977
		}
	}, {
		title: 'Statue of Eleftherios Venizelos',
		location: {
			lat: 40.63615,
			lng: 22.944429
		}
	}];




	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 40.6212524,
			lng: 22.9110079
		},
		zoom: 16
	});

	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();


	// The following group uses the location array to create an array of markers on initialize.

	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var image = 'img/marker.png'
		var marker = new google.maps.Marker({
			icon: image,
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);
		});
		bounds.extend(markers[i].position);
	}
	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);

	var availableTags = [];
	for (i = 0; i < locations.length; i++) {
		availableTags.push(locations[i].title);
	}
	/*	$("#tags").autocomplete({
			source: availableTags
		});
	*/

	//	console.log(locations.length);

	/*for ( i = 0; i < locations.length; i++) {
	console.log(locations[i].title);
}
*/


	var viewModel = function () {
		var self = this;
		self.filter = ko.observable('');
		self.items = ko.observableArray(availableTags)

		self.filteredItems = ko.computed(function () {
			var filter = self.filter();
			if (!filter) {
				return self.items();
			}
			return self.items().filter(function (i) {
				return i.indexOf(filter) > -1;
			});
		});
	};


	ko.applyBindings(new viewModel());



	//	ko.applyBindings(new AppViewModel());


	/*
	var match = function(x)) {

    this.match = function (data, event){
    alert('you clicked: ' + event.target.value);
    }
};

ko.applyBindings(new match());
	*/
	/*
	function match(x) {
	for (var i = 0; i < locations.length; i++) {
		if (locations[i].title == x.title) {
		//	marker = locations[i];
			 console.log(locations[i]);
			/** Centers the clicked marker */
	//	map.panTo({lat: (x.location.lat), lng: (x.location.lng)});
	//	infowindow.open(map, marker); 
	/** Calles toggleBounce, below */
	//	toggleBounce(x, marker);

	/*	}
	}
	}*/

}





// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;

		var coords = marker.position.toString().replace(/[()]/g, "");
		var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + coords + "&sensor=false";
		var imageStreetView = "https://maps.googleapis.com/maps/api/streetview?size=800x400&location=";

		var urlNewYork = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
		urlNewYork += '?' + $.param({
			'api-key': "d025f3b81d514469b78f879e6433e628",
			'q': marker.title,
			'sort': "newest",
			'fl': "lead_paragraph",
			'page': 0
		});

		$.ajax({
			url: url,
			method: 'GET',
			success: function (data) {
				var address = data.results[0].formatted_address;

				$.ajax({
					url: urlNewYork,
					method: 'GET',
					success: function (newdata) {
					var postNewYork = newdata.response.docs[0].lead_paragraph ;
						
								//		console.log(address);
		// console.log(marker);
		infowindow.setContent('<div><h3>' + marker.title + '</h3>' +
			// '<p>' + window.adress + '</p>' +
			'<h4>' + address + '</h4>' +
			'<p>' + postNewYork + '</p>'+  
			'<img src="' + imageStreetView + coords + '"></div>');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function () {
			infowindow.setMarker = null;
		});


					},

				});

			},

		});







	}

}
