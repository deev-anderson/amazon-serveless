const GoogleMapsLoader = require('google-maps'); // only for common js environments

GoogleMapsLoader.KEY = 'AIzaSyAQYRa4PTUwzH3lEROIjd7dONZkQv83LqU';

export default class RidesMap {

    constructor(rides, mapElement) {
        this._rides = rides;
        this._loadMap(mapElement);
    }

    animate(origin, dest, callback) {
        let startTime;
        const _self = this;
        const step = function animateFrame(timestamp) {
            let progress, progressPct, deltaLat, deltaLon;
            if (!startTime) startTime = timestamp;
            progress = timestamp - startTime;
            progressPct = Math.min(progress / 2000, 1);
            deltaLat = (dest.latitude - origin.latitude) * progressPct;
            deltaLon = (dest.longitude - origin.longitude) * progressPct;

            const newLong = origin.longitude + deltaLon;
            const newLat = origin.latitude + deltaLat;
            const newLocation = new _self._google.maps.LatLng(newLat, newLong);

            _self._marker.setPosition(newLocation);

            if (progressPct < 1) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        };
        requestAnimationFrame(step);
    };

    _loadMap(mapElement) {
        const _self = this;

        GoogleMapsLoader.load(function(google) {
            _self._google = google;

            const mapProp = {
                center: new google.maps.LatLng(51.508742,-0.120850),
                zoom: 8,
            };

            const icon = {
                url: '/images/unicorn-icon.png', // url
                scaledSize: new google.maps.Size(30, 30), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            };

            _self.map = new google.maps.Map(mapElement, mapProp);

            google.maps.event.addListener(_self.map, 'click', function(event) {
                _self._placeMarker(_self.map, event.latLng, icon);
            });
        });
    }


    _placeMarker(map, location, icon) {
        if(this._marker) {
            this.removeMarker();
        }

        this._marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: icon
        });

        this.selectedLocation = location;

        this._rides.handlePickupChanged(location);
    }

    removeMarker() {
        this._marker.setMap(null);
    }
}