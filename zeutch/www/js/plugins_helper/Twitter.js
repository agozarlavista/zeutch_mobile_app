/*
  ###### ClicAndWalk twitter javascript plugin
  It offers the following functionalities :
      - Connect to twitter account
         - Get user infos (id, name, profile picture)
      - Tweet a message on user account
      - Show a Follow @ button (Not working atm)

  Note:
      - About the follow button. The buttons show up in an iframe. Clicking on the iframe breaks the while application, redirecting the user on the twitter page. No return is possible actually
      
//id_clicandwalk = 386117918
*/


var CWTwitter = (CWTwitter != undefined ? CWTwitter : null);
if (CWTwitter == null){
    var defaultsValues = {
	    consumerKey:'gPUTZI8PKC764bjzK0VrvUMEk',
	    consumerSecret:'eZNo0lvVy5A7IZW8PHh2brT7UDoBDKXUIBosT0hKU5GUvGD4Yp'
	};
    switch(app._language){
        case 'fr':
            defaultsValues = {
                consumerKey:'mKe1MvoUqFwknvmj1xMdfBAET',
                consumerSecret:'mPnBV4yXRFG8AQKr7EqWHmId9WpDIdpuSdgRfYvrjl3SozcDHt'
            };
            break;
        case 'en':
            defaultsValues = {
                consumerKey:'gPUTZI8PKC764bjzK0VrvUMEk',
                consumerSecret:'eZNo0lvVy5A7IZW8PHh2brT7UDoBDKXUIBosT0hKU5GUvGD4Yp'
            };
            break;
        case 'de':
            defaultsValues = {
                consumerKey:'ijQeceum1U4y6e87nJrAdStCy',
                consumerSecret:'93mWHKUCF4YMoefM91AGo4aQfexu3cOo9SPE54DtKq1h8fthoR'
            };
            break;
        default:
            defaultsValues = {
                consumerKey:'gPUTZI8PKC764bjzK0VrvUMEk',
                consumerSecret:'eZNo0lvVy5A7IZW8PHh2brT7UDoBDKXUIBosT0hKU5GUvGD4Yp'
            };
            break;
    }
    CWTwitter = {
	_defaults:defaultsValues,
	_options:{
	    storageKey:'twitterApi'
	},
	_user:{
	    consumerKey:'',
	    consumerSecret:'',
	    accessTokenSecret:'',
	    callbackUrl:'index.html',
	},
	_oauth:null,
	_browser:null,
	_loggin:false,
	_onUrlChanged: function(url, requestParams, successCallback, errorCallback){
	    if (url.indexOf(CWTwitter._user.callbackUrl) >= 0){
		this._onSignin(url, requestParams, successCallback);
	    }
	},
	_onSignin: function(url, requestParams, successCallback, errorCallback){
	    var index, verifier = '';
	    var params = url.substr(url.indexOf('?') + 1);
	    params = params.split('&');
	    for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if(y[0] === 'oauth_verifier') {
		    verifier = y[1];
                }
	    }
	    // User is logged. Get access token for other request
	    CWTwitter._browser.close();
	    CWTwitter._browser = null;
	    CWTwitter._oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,function(data){
		var accessParams = {};
                var qvars_tmp = data.text.split('&');
                for (var i = 0; i < qvars_tmp.length; i++) {
                    var y = qvars_tmp[i].split('=');
                    accessParams[y[0]] = decodeURIComponent(y[1]);
                }
		CWTwitter._oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
		localStorage.setItem(CWTwitter._options.storageKey,
            JSON.stringify({
				accessTokenKey:accessParams.oauth_token,
				accessTokenSecret:accessParams.oauth_token_secret
            }
        ));
		/*
		  Now accessToken is set, get user info
		 */
		CWTwitter._oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true', function(data){
		    console.log("user data:", JSON.parse(data.text));
		    console.log(successCallback);
		    CWTwitter._logging = false;
		    successCallback(JSON.parse(data.text));
		}, function(error){
		    console.log("CWTwitter error: unable to get user infos - ", error);
		    CWTwitter._logging = false;
		    errorCallback(error);
		});
	    }, function(error){
		console.log("CWTwitter error: unable to get access user token - ", error);
		CWTwitter._logging = false;
		errorCallback(error);
	    });
	},
	/*
	  Initialize twitter login
	  keys:{
	      consumerKey: string - the consumer key of the app
	      consumerSecret: string - the consumer secret key
	  }
	  If no params, take the keys in the default values
	 */
	init: function(keys){
	    this._user.consumerKey = keys ? keys.consumerKey : this._defaults.consumerKey;
	    this._user.consumerSecret = keys ? keys.consumerSecret : this._defaults.consumerSecret;
	},
	login: function(params){
	    if (CWTwitter._logging) // login process already started
		  return;
	    CWTwitter._logging = true;
	    var rawData = localStorage.getItem(this._options.storageKey);
	    var jsonData;
	    this._oauth = OAuth(this._user);
	    if (rawData != "null"){ // User already have access token
            jsonData = JSON.parse(rawData);
            this._user.accessTokenScret = jsonData.accessTokenSecret;
            this._oauth.get(
                'https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true', 
                function(data){
                    console.log("User had access token ready. Now connected", data);
                    if (params && params.onSuccess)
                        params.onSuccess(JSON.parse(data.text));
                }, function(e){
                    console.log(e);
                    CWTwitter._logging = false;
                }
            );
	    }
	    else {
            // User never logged in. Ask for account infos and login
            this._oauth.get('https://api.twitter.com/oauth/request_token', function(data){
                CWTwitter._browser = window.open('https://api.twitter.com/oauth/authorize?' + data.text, '_blank');
                CWTwitter._browser.addEventListener("exit", function(){
                CWTwitter._loggin = false;
                });
                CWTwitter._browser.addEventListener("loadstart", function(event){
                var successCallback = null;
                var errorCallback = null;
                if (params && params.onSuccess)
                    successCallback = params.onSuccess;
                if (params && params.onError)
                    errorCallback = params.onError;
                CWTwitter._onUrlChanged(event.url, data.text, successCallback, errorCallback);
                });
            }, function(authError){
                console.log("CWTwitter error: failed to get access token - ", authError);
                if (params && params.onError)
                params.onError(authError);
            });
	    }
	},
	/*
	  Tweet a message on the user feed
	  messageData:{
	      text:string - The string to tweet
	  }
	 */
	tweet: function(messageData){
	    var accessData = JSON.parse(localStorage.getItem(this._options.storageKey));
	    this._user.accessTokenKey = accessData.accessTokenKey;
	    this._user.accessTokenSecret = accessData.accessTokenSecret;
	    this._oauth = OAuth(this._user);
	    this._oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
			    function(data){
				CWTwitter._oauth.post('https://api.twitter.com/1.1/statuses/update.json',
						      {
							  'status':messageData.text,
							  'trim_user':'true'
						      }, function(data){
							  console.log("CWTwitter: success posting ", data);
						      }, function(error){
							  console.log("CWTwitter: error tweet() : Unable to tweet post - ", error);
						      });
			    }
			   );
	},
	/*
	  params: {
	      div: parent div (in which the button is added)
	      lang:string (en,fr, ..)
	      link:string (link to follow)
	      text:string (text for the button)
	  }
	 */
	showFollowButton: function(params){
	    if (!params || !params.div ||
		!params.lang || !params.link || !params.text)
	    {
		console.log("CWTwitter error: showFollowButton() : Invalid parameters");
		return;
	    }
	    var elem = document.createElement("a");
	    elem.className += "twitter-follow-button";
	    elem.setAttribute('data-show-count', true);
	    elem.setAttribute('data-lang', params.lang);
	    elem.setAttribute('href', params.link);
	    elem.innerHTML = params.text;
	    params.div.appendChild(elem);
	    $(elem).on('tap', function(e){
		e.preventDefault();
		console.log(e, e.currentTarget);
		return false;
	    });
	    twttr.widgets.load();
	},

	followFriend: function(id){
	    var accessData = JSON.parse(localStorage.getItem(this._options.storageKey));
	    this._user.accessTokenKey = accessData.accessTokenKey;
	    this._user.accessTokenSecret = accessData.accessTokenSecret;
	    this._oauth = OAuth(this._user);
	    this._oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
			    function(data){
				CWTwitter._oauth.post('https://api.twitter.com/1.1/friendships/create.json',
						      {
							  'user_id':id,
							  'follow':'true'
						      }, function(data){
							  console.log("CWTwitter: success following ", data);
						      }, function(error){
							  console.log("CWTwitter: error followFriend() : Unable to follow - ", error);
						      });
			    }
			   );	    
	}
    }
}
