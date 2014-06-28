var maps = {
    showMap: function() {
    	var pins = [
        {
            lat: 49.28115,
            lon: -123.10450,
            title: "A Cool Title",
            snippet: "A Really Cool Snippet",
            icon: plugin.mapKit.iconColors.HUE_ROSE
        },
        {
            lat: 49.27503,
            lon: -123.12138,
            title: "A Cool Title, with no Snippet",
            icon: {
              type: "asset",
              resource: "www/img/logo.png", //an image in the asset directory
              pinColor: plugin.mapKit.iconColors.HUE_VIOLET //iOS only
            }
        },
        {
            lat: 49.28286,
            lon: -123.11891,
            title: "Awesome Title",
            snippet: "Awesome Snippet",
            icon: plugin.mapKit.iconColors.HUE_GREEN
        }];
        var error = function() {
            console.log('error');
        };
        var success = function() {
            plugin.mapKit.addMapPins(
                pins, 
                function() { 
                    console.log('adMapPins success');  
                },
                function() { 
                    console.log('error'); 
                }
            );
        };
        plugin.mapKit.showMap(
            success, 
            error, 
            {
              height: 400, // height of the map (width is always full size for now)
              diameter: 1000,   // unused for now
              atBottom: true,   // bottom or top of the webview
              lat: 49.281468,   // initial camera position latitude
              lon: -123.104446  // initial camera position latitude
            }
        );
    },
    hideMap: function() {
        var success = function() {
          console.log('Map hidden');
        };
        var error = function() {
          console.log('error');
        };
        plugin.mapKit.hideMap(success, error);
    },
    clearMapPins: function() {
        var success = function() {
          console.log('Map Pins cleared!');
        };
        var error = function() {
          console.log('error');
        };
        plugin.mapKit.clearMapPins(success, error);
    },
    changeMapType: function() {
        var success = function() {
          console.log('Map Type Changed');
        };
        var error = function() {
          console.log('error');
        };
        plugin.mapKit.changeMapType(mapKit.mapType.MAP_TYPE_SATELLITE, success, error);
    }
}