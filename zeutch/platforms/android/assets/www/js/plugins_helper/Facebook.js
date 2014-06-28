/*
** ##### ClicAndWalk facebook javascript plugin #####
** It offers the following functionalities :
**	- Connect / request permissions
**	- Post a message on the user wall
**	- Check if the user is fan of a page
**	- show a 'like' button on the page
**	- Get the user friends (thoses who already uses the application)
**
** Note :
**	Every function parameters can have this form :
**	params: {
**	    onSuccess: function()
**	    onError: function()
**	    ...
**	}
**	But remember that sometimes, only the success callback is called
**	(when the FB api does not let us get the result)
**	Doc is inside this document
*/


var CWFacebook = (CWFacebook != undefined ? CWFacebook : null);

if (CWFacebook == null){
    CWFacebook = {
	/*
	** defaults values.
	** Theses are used by some functions when the parameter is
	** not given. Change it if you want
	*/
	_defaults: {
	    likeDiv: 'likeButton', //showLikeButton()
	    likeLink: 'https://www.facebook.com/clicandwalk', // -
	    perms: 'email, user_likes, publish_actions, user_friends'
		// init
	},
	// Do not care. Internal function to call callbacks
	_calls: function(params, name, ret){
	    if (params && params[name]){
		params[name](ret);
		return true;
	    }
	    return false;
	},

	/*
	** Initialize the plugin
	** params:{
	**    appId:string - The facebook app id
	** }
	*/
	init: function(params){
	    if (!params || !params.appId){
		  console.log("CWFacebook error : init: Unknown params");
		  return;
	    }
        FB.init({ appId: params.appId, nativeInterface: CDV.FB, useCachedDialogs: false, version:'v2.0'});
	},

	/*
	** Ask the user to connect. Also request new permissions
	** if needed.
	** params:{data:{}}
	** params.data: {
	**    scope: string - The permissions, separated by ','
	** }
	*/
	requestConnect:function(params){
	    if (!params || !params.data){
		if (!params)
		    params = {};
		params.data = {scope:this._defaults.perms};
	    }
	    FB.login(params.onSuccess, params.data);
	},

	/*
	** Post a message on user wall
	** params.data:{
   	**      message: string
	**	link:string
	**	action: array[object{}] : name, link
	**	place: string
 	**	tags: array[userId]
	**	object_attachement: string (id of picture)
	**    }
	*/
	postMessage: function(params){
	    if (!params || !params.data)
		return (console.log('CWFacebook error : postMessage: Wrong parameters'));
	    var self = this;
	    FB.api(
		"/me/feed",
		"POST",
		params.data,
		function(response){
		    if (response && !response.error) {
			console.log("CWFacebook : Message posted successfully");
			self._calls(params, 'onSuccess', response);
		    }
		    else {
			console.log("CWFacebook error : postMessage: ", response ? response.error : 'unknown error');
			self._calls(params, 'onError', response);
		    }
		}
	    );
	},

	/*
	** Check if the user is fan of a page
	** params:{
	**    pageId : string
	** }
	*/
	isFan: function(params){
	    if (!params || !params.pageId)
		return (console.log('CWFacebook : isFan(): Wrong parameters'));
	    var self = this;
	    FB.api('/me/likes/' + params.pageId, function(response){
		var result = false;
		if (response){
		    if (!response.error)
			result = response.data.length == 0 ? false : true;
		    else {
			console.log("CWFacebook error : isFan : ", response.error);
			result = false;			
		    }
		}
		else {
		    console.log("CWFacebook error : isFan : Could not send request");
		    result = false;
		}
		if (!self._calls(params, (result ? 'onSuccess' : 'onError'), result))
		    console.log("IsUserFan : " + result);
		return result;
	    });
	},

	/*
	** Show the like button on a div
	** params : {
	**    div:string - div id
	**    link: string - The page link associated to the like button
	** }
	*/
	showLikeButton: function(params){
	    if (!params || params.div == undefined || params.link == undefined){
		div = document.getElementById(this._defaults.likeDiv);
		link = this._defaults.likeLink;
		console.log("CWFacebook warning: showLikeButton() : No parameters given. Using default values");
	    }
	    var elem = document.createElement("div");
	    elem.className = elem.className + " fb-like";
	    elem.setAttribute('data-href', link);
	    elem.setAttribute('data-layout', 'standard');
	    elem.setAttribute('data-action', 'like');
	    elem.setAttribute('data-show-faces', 'true');
	    elem.setAttribute('data-share', 'true');
	    div.appendChild(elem);
	    FB.XFBML.parse(div);
	    this._calls(params, 'onSuccess');
	},

	/*
	** Show the share button on a div
	** params : {
	**    div:string - div id
	**    link: string - The page link associated to the like button
	** }
	*/
	showShareButton: function(params){
	    if (!params || params.div == undefined || params.link == undefined){
		div = document.getElementById(this._defaults.likeDiv);
		link = this._defaults.likeLink;
		console.log("CWFacebook warning: showLikeButton() : No parameters given. Using default values");
	    }
	    var elem = document.createElement("div");
	    elem.className = elem.className + " fb-share-button";
	    elem.setAttribute('data-href', link);
	    elem.setAttribute('data-type', "button");
	    div.appendChild(elem);
	    FB.XFBML.parse(div);
	    this._calls(params, 'onSuccess');
	},

	/*
	** Share dialog is not working
	** It seems i can't use it with the facebook sdk provided by the
	** plugin. (Since the plugin has a custom fb sdk.js)
	** Using the original one just mess it all
	*/
	// shareDialog: function(params){
	//     console.log("share:", params.link);
	//     FB.ui({
	// 	method:'share',
	// 	href:params.link
	//     }, function(response){
	// 	console.log("response:", response);
	// 	if (response && !response.error)
	// 	    this._calls(params, 'onSuccess');
	// 	else
	// 	    this._calls(params, 'onError', response);
	//     });
	// },


	/*
	** getFriends() returns the friends that are already
	**   using the app.
	** Warning : getFriends return an empty array if the
	**   user has no friends (using the app).
	** on error, it returns null
	*/
	getFriends: function(params){
	    var self = this;
	    FB.api('/me/friends', function(response){
		if (response){
		    if (!response.error){
			self._calls(params, 'onSuccess', response.data);
			return response.data;
		    }
		    console.log("CWFacebook error: getFriends() : " + response.error);
		}
		else
		    console.log("CWFacebook error: getFriends() : unknown error");
		self._calls(params, 'onError', response);
		return null;
	    });
	},
	// Check if the user is connected.
	// You MUST provide onSucces and onError
	isConnected: function(params){
	    if (!params || !params.onSuccess || !params.onError){
		console.log("CWFacebook error: isConnect(): You must provide onSuccess and onError callbacks in parameters");
		return;
	    }
	    FB.getLoginStatus(function(response){
		if (response.status == 'connected')
		    params.onSuccess(response);
		else
		    params.onError(response);
	    });
	},
	// Params:{type: string - the data you want to retrieve (mail, name)}
	getUserInfo: function(params){
	    if (!params || !params.type){
		console.log("CWFacebook error: userInfo(): You must provide data you want to access ('field1, field2', '...')");
		return;
	    }
	    FB.api('/me', {fields:params.type}, function(response){
		if (response && !response.error)
		    params.onSuccess(response);
		else
		    params.onError(response);
	    });
	},
	// params :none
	getProfilPicture: function(params){
	    FB.api("/me/picture", function(response){
		if (!response || response.error)
		    params.onError(response);
		else
		    params.onSuccess(response);
	    });
	}
    }
}
