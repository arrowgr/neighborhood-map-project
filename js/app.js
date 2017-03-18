'use strict';


var map;

// Create a new blank array for all the listing markers.
var markers = [];

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

function initMap() {
	var styles = [{
		featureType: 'water',
		stylers: [{
			color: '#19a0d8'
		}]
	}];


	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 40.6312524,
			lng: 22.9613079
		},
		zoom: 15
	});

	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();


	// The following group uses the location array to create an array of markers on initialize.

	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var image = 'img/marker.png';
		var marker = new google.maps.Marker({
			icon: image,
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i

		});
		marker.setVisible(true);
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);

			toggleBounce(this);
		});
		//	marker.addListener('click', toggleBounce);

		bounds.extend(markers[i].position);
	}
	// Extend the boundaries of the map for each marker
	//map.fitBounds(bounds);

	google.maps.event.addDomListener(window, 'resize', function () {
		map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
	});

	function toggleBounce(marker) {
		if (marker.getAnimation() !== null) {

			marker.setAnimation(null);

		} else {

			marker.setAnimation(google.maps.Animation.BOUNCE);
			window.setTimeout(function () {
				marker.setAnimation(null);
			}, 2000);
		}
	}


	function stopAnimateMarkers() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setAnimation(null);
		}

	}

	function visibleMarkers() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setVisible(true);
		}
		
	}

	function visibleMarkersConc(filter) {

		for (var i = 0; i < markers.length; i++) {
			//	 console.log(markers[i].title.toLowerCase());
			//	 console.log(filter);

			if (markers[i].title.toLowerCase().search(filter) >= 0) {
				//	console.log(markers[i].title.toLowerCase());
				markers[i].setVisible(true);
			} else {

				markers[i].setVisible(false);
			}

		}

	}
	
	var viewModel = function () {
		var self = this;
		self.filter = ko.observable('');
		self.title = ko.observableArray(locations);
		self.filteredItems = ko.computed(function () {
			var filter = self.filter().toLowerCase();

			if (!filter) {
				visibleMarkers();
				return self.title();


			} else {
				visibleMarkersConc(filter);
				return ko.utils.arrayFilter(self.title(), function (i) {
					var string = i.title.toLowerCase();
					var result = (string.search(filter) >= 0);

					// var mark = (string.search(markers.title) >= 0);
					// console.log(filter);
					// console.log(self.markers);
					return result;


				});
			}
		});
	};


	ko.applyBindings(new viewModel());


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

						if (newdata.response.docs.length > 0) {
							infowindow.setContent('<div class="col-sx12"><h3>' + marker.title + '</h3>' +
								'<h4>' + address + '</h4>' +
								'<p>' + newdata.response.docs[0].lead_paragraph + '</p>' +
								'<img class="img-responsive" src="' + imageStreetView + coords + '"></div>');
							infowindow.open(map, marker);
							// Make sure the marker property is cleared if the infowindow is closed.
							infowindow.addListener('closeclick', function () {
								infowindow.setMarker = null;
							});

						} else {

							infowindow.setContent('<div class="col-sx12"><h3>' + marker.title + '</h3>' +
								'<h4>' + address + '</h4>' +
								'<img class="img-responsive" src="' + imageStreetView + coords + '"></div>');
							infowindow.open(map, marker);
							// Make sure the marker property is cleared if the infowindow is closed.
							infowindow.addListener('closeclick', function () {
								infowindow.setMarker = null;
							});


						}


					},
					error: function (xhr, ajaxOptions, thrownError) {
						alert("Ooopps something going wrong pls retry");
						//	alert(thrownError);
					}

				});

			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert("Ooopps something going wrong pls retry");
				//	alert(thrownError);
			}
		});






	}

}
