var geolocation = {
    bgGeo : null,
    init : function(){
        window.navigator.geolocation.getCurrentPosition(function(location) {
            console.log('Location from Phonegap');
        });
        
        this.bgGeo = window.plugins.backgroundGeoLocation;
        var yourAjaxCallback = function(response) {
            console.log('callBack bg position');
            //geolocation.bgGeo.finish();
        };
        var callbackFn = function(location) {
            utilities.saveLocalStorage('lastPosition', location);
            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitudue + ',' + location.longitude);
            yourAjaxCallback.call(this);
        };
        var failureFn = function(error) {
            console.log('BackgroundGeoLocation error');
        }
        if ( device.platform == 'android' || device.platform == 'Android' )
        {
            geolocation.bgGeo.configure(callbackFn, failureFn, {
                url: service.urlService+'/', // <-- only required for Android; ios allows javascript callbacks for your http
                params: {                                            // HTTP POST params sent to your server when persisting locations.
                    walker_id:utilities.getLocalStorage('user').id,
                    auth_token: 'user_secret_auth_token',
                    foo: 'bar'
                },
                desiredAccuracy: 10,
                stationaryRadius: 20,
                distanceFilter: 30,
                debug: true // <-- enable this hear sounds for background-geolocation life-cycle.
            });
        }
        this.bgGeo.start();
        // If you wish to turn OFF background-tracking, call the #stop method.
        // bgGeo.stop()
    }
}