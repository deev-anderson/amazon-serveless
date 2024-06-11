import RidesMap from 'UnicornRides/RidesMap';
import WildRydes from "WildRydes";


export default class Rides {

    constructor() {
        this._application = new WildRydes();

        this._map = new RidesMap(this, $("#map")[0]);

        this._displayToken();

    }

    _displayToken() {
        this._application.getAuth().getAuthToken().then((token) => {
            if (token) {
                this._displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });
    }

    _requestUnicorn(pickupLocation) {
        this._application.getAuth().getAuthToken().then((token) => {
            $.ajax({
                method: 'POST',
                url: this._application.getConfig().getInvokeUrl() + '/ride',
                headers: {
                    Authorization: token
                },
                data: JSON.stringify({
                    PickupLocation: {
                        Latitude: pickupLocation.latitude,
                        Longitude: pickupLocation.longitude
                    },
                    Rider: this._application.getAuth().getCurrentUser().username
                }),
                contentType: 'application/json',
                success: (result) => this._completeRequest(result),
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR);
                    console.error(textStatus);
                    console.error(errorThrown);
                    console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
                }
            });
        });
    }

    _completeRequest(result) {
        console.log('Response received from API: ', result);
        result = JSON.parse(result.body);
        const unicorn = result.Unicorn;
        const pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        console.log(this);
        this._displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        this._animateArrival(() => {
            this._displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    handlePickupChanged() {
        const requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    handleRequestClick(event) {
        const pickupLocation = { latitude: this._map.selectedLocation.lat(), longitude: this._map.selectedLocation.lng()};
        event.preventDefault();
        this._requestUnicorn(pickupLocation);
    }

    _animateArrival(callback) {
        const dest = { latitude: this._map.selectedLocation.lat(), longitude: this._map.selectedLocation.lng()};
        const origin = {};
        const center = this._map.map.getCenter();
        const centerLat = center.lat();
        const centerLng = center.lng();

        const bounds = this._map.map.getBounds();
        const northEast = bounds.getNorthEast();
        const southWest = bounds.getSouthWest();


        if (dest.latitude > centerLat) {
            origin.latitude = southWest.lat();
        } else {
            origin.latitude = northEast.lat();
        }

        if (dest.longitude > centerLng) {
            origin.longitude = southWest.lng();
        } else {
            origin.longitude = northEast.lng();
        }


        this._map.animate(origin, dest, callback);
    }

    _displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}
