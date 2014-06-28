function service() {
    this.urlService = "http://localhost/~simondelamarre/zeutch/www/zeutch_services_ci/index.php/";
    this.timeout = 12000; //12sec
	this.tokenAccess = null; // Token access
	this.tokenSecret = null; // Token secret
    service.prototype.initialize = function() {
        var token = utilities.getLocalStorage('tokenSecret');
		if (token != '')
			this.tokenSecret = token;
		// Si on a un tokenAccess en localstorage c'est que l'appli a √©t√© kill
		var token = utilities.getLocalStorage('tokenAccess');
		if (token != '')
			this.tokenAccess = token;
    }
    service.prototype.reset = function() {
		this.tokenAccess = null;
		this.tokenSecret = null;
    }
    service.prototype.getSig = function(obj)
	{
        return CryptoJS.MD5(this.tokenSecret + '' + this.tokenAccess + '' + JSON.stringify(obj).replace(/"/g, ''));
    }
    service.prototype.getSigUrl = function(obj, methodeName)
	{
		//console.log('log tokens : methode : ' + methodeName+ ' || this.tokenSecret : ' + this.tokenSecret + ' || this.tokenAccess : ' + this.tokenAccess);
		var sig = '';
		if (this.methodWithoutSig.join(',').indexOf(methodeName) == -1) {
			sig = '/sig/' + this.getSig(obj);
		}
		return this.urlService + '/' + methodeName + '' + sig + '/locale/' + app._locale + '/lang/' + app._language + '?' + new Date().getTime();
	}
    service.prototype.getSomeParams = function(obj, methodeName)
	{
		instant_log.saveServiceState(methodeName, obj);
        return o;
	}
    service.prototype.ajaxErrorCallBack = function(e, f, g) {
    	console.log(e);
        caw_ui.hideLoader();
    	caw_ui.cwMessage(app._('SERVICES_NORESPONSE_TITLE'), app._('SERVICES_NORESPONSE_MESSAGE'), [
            {"label":"OK", "color":"greya", "icon":"4"}
        ], function(e){
        });
    	if (e.status == 0) {
		}
    }
    service.prototype.getResponseData = function(response) {
    	if (response != null) {
        	instant_log.saveServiceResponse(JSON.stringify(response));
        	if (response.code == 405 || response.code == 401) {
        		return;
			}
            if (response.code == 400 || response.code == 404) {
        		return;
			}
            // Dans le cas d'une r√©ponse on r√©cup√®re les tokens
			if (response.code == 200 || response.code == 201) {
				
			} else {
				if (response.error !== undefined) {
				}
			}
            return response;
        }
    }
    // Set TokenSecret
	service.prototype.setTokenSecret = function(token) {
		utilities.saveLocalStorage('tokenSecret', token);
		this.tokenSecret = token;
		//console.log('setTokenSecret : ' + token);
	}
    // Set TokenAccess
	service.prototype.setTokenAccess = function(token) {
		utilities.saveLocalStorage('tokenAccess', token);
		this.tokenAccess = token;
		//console.log('setTokenAccess : ' + token);
	}
    service.prototype.loadService = function(data, delegate, serviceURI){
        if(!utilities.isConnected()){
            return false;
        }
        var params = this.getSomeParams(data, serviceURI);
        $.ajax(
            {
                url: this.getSigUrl(params, serviceURI),
                type: 'POST',
                data: params,
                dataType: 'json',
				cache: false,
				timeout: this.timeout,
                context: this,
				contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                success: function(data) {
                    delegate(this.getResponseData(data));
                },
                error: this.ajaxErrorCallBack
            }
        );
    }
    // special profile photo upload
    service.prototype.saveProfilPhoto = function (imageURI, data, delegate) {
       	var ft;
		var params = new Object();
		params = { walker_id: data.walker_id };
		options = new FileUploadOptions();
		options.fileKey = "photo";
		options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		options.mimeType = "text/plain";
		options.params = params;
		ft = new FileTransfer();
		caw_ui.showLoader();
        ft.upload(
            imageURI, 
            this.urlService + '/upload_avatar', 
            function(win){ 
                caw_ui.hideLoader();
                delegate(win) 
            }, function(fail){ 
                caw_ui.hideLoader();
                delegate(fail) 
            }, options);
	}
}