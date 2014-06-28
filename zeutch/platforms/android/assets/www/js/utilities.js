var utilities = {
    callBack : null,
    pushNotification:null,
    facebook : null,
    regId : null,
    bgGeo : null,
    positionWatchID : null,
    loadPlugins : function(){
        this.initKeyboardListeners();
        alert('hello');
    },
    initKeyboardListeners : function(){
        window.addEventListener('native.hidekeyboard', keyboardHideHandler);
        function keyboardHideHandler(e){
            $('input').blur();
            $('textarea').blur();
        }
    },
    translateCurrency : function(balance, devise){
        if(balance == null || balance ==''){
            balance = "0.00";
        }
        if(devise == "EURO" || devise == "€"){
            return balance+"€";
        }else if(devise.toUpperCase() == "CP" || devise.toUpperCase()=="CLICPOINTS" || devise.toUpperCase()=="CLICPOINT"){
            return Math.round(balance)+"Cpts";
        }else{
            return "£"+balance;
        }
    },
    scan : function(callBack){
        utilities.callBack = callBack;
        this.scanner.scan( function (result) { 
            utilities.callBack(result.text);
        }, function (error) { 
            utilities.callBack(error);          
        } );
    },
    takePicture : function(callBack, params){
        utilities.callBack = callBack;
        navigator.camera.getPicture( function(result){
            console.log('success '+result);
            utilities.callBack(result);
        }, function(error){
            console.log('fail '+error);
            utilities.callBack(error);
        }, params);
    },
    takeAudio : function(callBack, params){
        utilities.callBack = callBack;
        var src = params.name;
        var mediaRec = new Media(src,
            function(e){
                
            },
            function(err) {
                console.log("recordAudio():Audio Error: "+ err.code);
            }
        );
        // On affiche la div component caw_ui
        TweenLite.to($('.caw_component'), .1, {opacity:0, onComplete:function(){
            $('.caw_component').css('display', 'block');
            TweenLite.to($('.caw_component'), .5, {opacity:1, onComplete:function(){
                //on crée le tempplate du composant audio et on l'ajoute au component caw_ui
                var Audio = Backbone.Model.extend({
                    defaults:{}
                });
                var AudioView = Backbone.View.extend({
                    tagName:"div",
                    className:"audio_component",
                    template:$("#audio_component_template").html(),
                    render:function () {
                        var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html
                        this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
                        return this;
                    }
                });
                $(".caw_component").html('');
                var audio = new Audio({});
                audioView = new AudioView({ model: audio });
                $(".caw_component").append(audioView.render().el);
                $('.audio_component').css('top', '100%');
                //on replace le composant audio au centre de la fenetre
                TweenLite.to($('.audio_component'), .5, {css:{top:0}, onComplete:function(){
                    //on crée un décompte avant le lancement de l'enregistrement pour le clicwalker se prépare avant d'enregistrer
                    var decompte = {value:5};
                    TweenLite.to(decompte, 5, {
                        value:0, 
                        ease:Linear.easeNone,
                        onUpdate:function(){
                            $('.compteur').html(Math.round(decompte.value));
                        },
                        onComplete:function(){
                            //le décompte est fini on lance l'enregistrement et on anime une progress barre le temps de l'enregistrement max
                            mediaRec.startRecord();
                            var comptage = {value:0, percent:0};
                            TweenLite.to(comptage, (parseInt(params.duration)/1000), {
                                value:(parseInt(params.duration)/1000), 
                                percent:100,
                                ease:Linear.easeNone,
                                onUpdate:function(){
                                    $('.compteur').html((comptage.value).toFixed(2)+' / '+(parseInt(params.duration)/1000).toFixed(2));
                                    $('.progress_bar').css('width', comptage.percent+'%');
                                },
                                onComplete:function(){
                                    //on termine l'enregistrement et on balance le fichier au callback audio
                                    mediaRec.stopRecord();
                                    function gotFS(fileSystem) {
                                        fileSystem.root.getFile(src, {create: true, exclusive: false}, gotFileEntry, fail);
                                    }
                                    function gotFileEntry(fileEntry) {
                                        utilities.callBack(fileEntry.toURL());
                                    }
                                    function fail(e){
                                        alert('fail file system '+e);   
                                    }
                                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
                                    //on supprime le player audio
                                    navigator.notification.beep(0);
                                    navigator.notification.vibrate(100);
                                    TweenLite.to($('.audio_component'), .5, {css:{top:'150%'}, delay:.5, ease:Power4.easeIn, onComplete:function(){
                                        $('.caw_component').html('');
                                        TweenLite.to($('.caw_component'), .5, {opacity:0, onComplete:function(){
                                            $('.caw_component').css('display', 'none');
                                        }});
                                    }});
                                }
                            });
                        }
                    });
                }});
            }});
        }});
    },
    listenAudio : function(params){
        TweenLite.to($('.caw_component'), .1, {opacity:0, onComplete:function(){
            $('.caw_component').css('display', 'block');
            var Audio = Backbone.Model.extend({
                defaults:{}
            });
            var AudioView = Backbone.View.extend({
               tagName:"div",
                className:"audio_component",
                template:$("#audio_component_template").html(),
                render:function () {
                    var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html
                    this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
                    return this;
                }
            });
            $(".caw_component").html('');
            var audio = new Audio({});
            audioView = new AudioView({ model: audio });
            $(".caw_component").append(audioView.render().el);
            $('.audio_component').css('top', '100%');
            TweenLite.to($('.caw_component'), .5, {opacity:1, onComplete:function(){
                TweenLite.to($('.audio_component'), .5, {css:{top:'0'}, onComplete:function(){
                    var src = params.name;
                    var mediaRec = new Media(src,
                        function(e){
                            
                        },
                        function(err) {
                            console.log("play():Audio Error: "+ err.code);
                        }
                    );
                    // Record audio
                    mediaRec.play();
                    var comptage = {value:0, percent:0};
                    TweenLite.to(comptage, (parseInt(params.duration)/1000), {
                        value:(parseInt(params.duration)/1000), 
                        percent:100,
                        ease:Linear.easeNone,
                        onUpdate:function(){
                            $('.compteur').html((comptage.value).toFixed(2)+' / '+(parseInt(params.duration)/1000).toFixed(2));
                            $('.progress_bar').css('width', comptage.percent+'%');
                        },
                        onComplete:function(){
                            mediaRec.stop();
                            navigator.notification.beep(2);
                            navigator.notification.vibrate(100);
                            TweenLite.to($('.audio_component'), .5, {css:{top:'150%'}, delay:.5, ease:Power4.easeIn, onComplete:function(){
                                $('.caw_component').html('');
                                TweenLite.to($('.caw_component'), .5, {opacity:0, onComplete:function(){
                                    $('.caw_component').css('display', 'none');
                                }});
                            }});
                        }
                    });
                }});
            }});
        }});
    },
    takeVideo : function(callBack, params){
        //alert('take video');
        window.plugins.videocaptureplus.captureVideo(
          callBack, // your success callback
          function(error){
              alert(error);
          },// your error callback
          {
            limit: 1, // the nr of videos to record, default 1 (on iOS always 1)
            duration: params.duration, // max duration in seconds, default 0, which is 'forever'
            highquality: false, // set to true to override the default low quality setting
            frontcamera: false, // set to true to override the default backfacing camera setting
            // you'll want to sniff the useragent/device and pass the best overlay based on that.. assuming iphone here
            portraitOverlay: 'www/img/cameraoverlays/overlay-iPhone-portrait.png', // put the png in your www folder
            landscapeOverlay: 'www/img/cameraoverlays/overlay-iPhone-landscape.png' // not passing an overlay means no image is shown for the landscape orientation
          }
      );
    },
    openBrowser : function(callBack, params){
        utilities.callBack = callBack;
        var ref = window.open(params['url'], '_blank', 'location=no');
         ref.addEventListener('loadstart', function(event) { /*utilities.callBack('start: ' + event.url);*/ });
         ref.addEventListener('loadstop', function(event) { /*utilities.callBack('stop: ' + event.url);*/ });
         ref.addEventListener('loaderror', function(event) { /*utilities.callBack('error: ' + event.message);*/ });
         ref.addEventListener('exit', function(event) { utilities.callBack(event.type); });
    },
    settingPushNotifications : function(){
        if ( device.platform == 'android' || device.platform == 'Android' )
        {
            this.pushNotification.register(
                successHandler,
                errorHandler, 
                {
                    "senderID":"149820887887",
                    "ecb":"utilities.onNotificationGCM"
                }
            );
        }
        else
        {
            this.pushNotification.register(
                tokenHandler,
                errorHandler, {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"utilities.onNotificationAPN"
                });
        }
        // result contains any message sent from the plugin call
        function successHandler (result) {
            console.log('result = ' + result);
        }
        function errorHandler (error) {
            console.log('error = ' + error);
        }
        function tokenHandler (result) {
            // Your iOS push server needs to know the token before it can push to this device
            // here is where you might want to send it the token for later use.
            console.log('device token = ' + result);
        }
    },
    onNotificationGCM  : function(e){
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    //alert('regid = '+e.regid);
                    utilities.regId = e.regid;
                    app._GCM = e.regid;
                }
            break;
        
            case 'message':
                if ( e.foreground )
                {
                    var my_media = new Media("/android_asset/www/"+e.soundname);
                    my_media.play();
                }
                else
                {
                    if ( e.coldstart )
                    {
                        //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                    }
                    else
                    {
                        //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                    }
                }
                console.log(e.payload.message);
            break;
        
            case 'error':
                alert(e.msg);
            break;
        
            default:
                alert('UNKNOW NOTIFICATION EVENT');
            break;
        }
    },
    onNotificationAPN  : function(event){
        if ( event.alert )
        {
            navigator.notification.alert(event.alert);
        }
    
        if ( event.sound )
        {
            var snd = new Media(event.sound);
            snd.play();
        }
    
        if ( event.badge )
        {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }   
    },
    getposition : function(){
        /*if(app.position != null && app.position.timestamp + (75 * 60) <  new Date().getTime()){
            //alert("last position = "+JSON.stringify(app.position));
            return true;
        }*/
        this.positionWatchID = null;
        var options = { maximumAge: 3000, timeout: 30000 };
        this.positionWatchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
        function onSuccess(position) {
            //console.log('get position ok '+position.coords.latitude+" "+position.coords.longitude);
            app.position = position;
            utilities.saveLocalStorage('lastPosition', position);
            gmap.update_position();
            return true;
        }
        function onError(error) {
            navigator.geolocation.clearWatch(utilities.positionWatchID);
            caw_ui.cwMessage(
                app._('GEOLOC_TITLE'), 
                '<div class="image image_geolocation"></div><br>'+app._('GEOLOC_ACTIVATE'), 
                [
                    {"label":"OK", "color":"greya", "icon":"4"}
                ], function(e){
                    //utilities.setPosition();
                }
            );
            //utilities.navigateTest();
            //alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
            app.position = error;
            //utilities.saveLocalStorage('lastPosition', error);
            return false;
        }
    },
    setPosition : function(param){
	console.log("setting position utilities");
        /* on garde la geolocation sur les 10 dernières minutes, sinon on la rafraichie < 600000! */
        //console.log(new Date().getTime() - utilities.getLocalStorage('lastPosition_date'));
        //alert(new Date().getTime() - utilities.getLocalStorage('lastPosition_date'));
        if(utilities.getLocalStorage("lastPosition") != '' && utilities.getLocalStorage('lastPosition_date') != '' && new Date().getTime() - utilities.getLocalStorage('lastPosition_date') < 600000){
            //alert("last position = "+JSON.stringify(app.position));
            //navigator.geolocation.clearWatch(watchID);
	    if (param && param.onSuccess)
		param.onSuccess();
            return true;
        }
        var onSuccess = function(position) {
            utilities.saveLocalStorage('lastPosition', position);
            //gmap.update_position();
            /*alert('Latitude: '          + position.coords.latitude          + '\n' +
                  'Longitude: '         + position.coords.longitude         + '\n' +
                  'Altitude: '          + position.coords.altitude          + '\n' +
                  'Accuracy: '          + position.coords.accuracy          + '\n' +
                  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                  'Heading: '           + position.coords.heading           + '\n' +
                  'Speed: '             + position.coords.speed             + '\n' +
                  'Timestamp: '         + new Date(position.timestamp)      + '\n');*/
	    if (param && param.onSuccess)
		param.onSuccess();
        };
        var onError = function(error) {
	    if (param && param.onError)
		param.onError();
            utilities.saveLocalStorage('lastPosition', '');
            caw_ui.cwMessage(
                app._('GEOLOC_TITLE'), 
                '<div class="image image_geolocation"></div><br>'+app._('GEOLOC_ACTIVATE'), 
                [
                    {"label":"OK", "color":"greya", "icon":"4"}
                ], function(e){
                    //utilities.getPosition();
                }
            );
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout:3000});
    },
    navigateGPS : function(address, latitude, longitude){
        navigator.google_navigate.navigate(address, function() {
            console.log('Success');
        }, function(errMsg) {
            console.log("Failed: " + errMsg);
        });  
    },
    saveLocalStorage: function(key, obj) {
        window.localStorage.setItem(key+'_date', new Date().getTime());
	instant_log.checkStorageState(key);
	window.localStorage.setItem(key, JSON.stringify(obj));
    },
    getLocalStorage: function(key) {
		try {
			var content = window.localStorage.getItem(key);
			return content ? JSON.parse(content) : [];
		} catch(err) {
		    console.log("getLocalStorage error:", err);
		    return [];
		}
	},
    dateConverter : function(time, typ, locale){
		var dayArrayFR = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
		var monthArrayFR =["janvier","f&eacute;vrier","mars","avril","mai","juin","juillet","ao&ucirc;t","septembre","octobre","novembre","d&eacute;cembre"];
		var dayArrayDE = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
		var monthArrayDE =["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
		if(locale == "fr-FR" || locale == "fr_FR"){
			var dayArray 	= 	dayArrayFR;
			var monthArray 	=	monthArrayFR;
		}else if(locale == "de-DE" || locale == "de_DE"){
			var dayArray 	= 	dayArrayDE;
			var monthArray 	=	monthArrayDE;
		}else{
			return new Date(time * 1000).toLocaleDateString();
		}
		
		var timing = new Date(time*1000);
		var year = timing.getFullYear();
		var month = timing.getUTCMonth();
		var day = timing.getDay();
		var dayofmonth = timing.getUTCDate();
		var hour = timing.getHours();
		var mins = timing.getMinutes();
		var returnString = "";
		var today = new Date();
		if(today.getTime()-(time*1000) < 3600000 && typ!="mmYY"){
			if(today.getTime()-(time*1000) < 60000*10){
                if(typ == "connexion"){
                	if(locale == "fr-FR" || locale == "fr_FR"){
						returnString = "A l'instant";
					}else if(locale == "de-DE" || locale == "de_DE"){
						returnString = "Gerade eben";
					}
                }else{
                	if(locale == "fr-FR" || locale == "fr_FR"){
						returnString = "Il y a "+Math.round((today.getTime()-(time*1000))/60000)+" minutes";
					}else if(locale == "de-DE" || locale == "de_DE"){
						returnString = "Vor "+Math.round((today.getTime()-(time*1000))/60000)+" Minuten";
					}
                }
			}else{
				if(locale == "fr-FR" || locale == "fr_FR"){
					returnString = "Il y a moins d'une heure";
				}else if(locale == "de-DE" || locale == "de_DE"){
					returnString = "Vor weniger als einer Stunde";
				}
			}
		}else if(today.getFullYear() == year && today.getUTCMonth()+1 == month && today.getUTCDate() == dayofmonth && typ!="mmYY"){
			if(locale == "fr-FR" || locale == "fr_FR"){
				returnString = "Aujourd'hui à "+hour+":"+mins;
			}else if(locale == "de-DE" || locale == "de_DE"){
				returnString = "Heute um "+hour+":"+mins;
			}
		}else if(today.getFullYear() == year && today.getUTCMonth()+1 == month && today.getUTCDate() == dayofmonth-1 && typ!="mmYY"){
			if(locale == "fr-FR" || locale == "fr_FR"){
				returnString = "Hier à "+hour+":"+mins;
			}else if(locale == "de-DE" || locale == "de_DE"){
				returnString = "Gestern um "+hour+":"+mins;
			}
		}else{
			if(typ == "mmYY"){
				returnString = monthArray[month]+" "+year;
			}else if(typ == "small"){
				returnString = dayofmonth+" "+monthArray[month]+" "+year;
			}else if(typ == "connexion"){
				returnString = dayofmonth+" "+monthArray[month]+" "+year;
			}else{
				returnString = dayArray[day]+" "+dayofmonth+" "+monthArray[month]+" "+year+" à "+hour+":"+mins;
			}
		}
		return returnString;
    },
    substring:function(str, start, end, max){
        if(str == null)
            str="";
        if(str.length > max){
            return str.substring(start, end)+' (...)';
        }else{
            return str;
        }
    },
    encodeString : function(str, type){
        if(str == null)
            return "******";
        switch(type){
            case 'email':
                lastChar = str.substring(str.length-4, str.length);
                str = str.replace(/[0-9a-zA-Z]/g, '*').substring(0, str.length-4)+""+lastChar;
                break;
            case 'iban':
                lastChar = str.substring(str.length-4, str.length);
                str = str.replace(/[0-9a-zA-Z]/g, '*').substring(0, str.length-4)+""+lastChar;
                break;
            case 'bic':
                lastChar = str.substring(str.length-4, str.length);
                str = str.replace(/[0-9a-zA-Z]/g, '*').substring(0, str.length-4)+""+lastChar;
                break;
            default:
                lastChar = str.substring(str.length-4, str.length);
                str = str.replace(/[0-9a-zA-Z]/g, '*').substring(0, str.length-4)+""+lastChar;
                break;
        }
        return str;
    },
    checkConnexion : function(){
        var networkState = navigator.connection.type;
        var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';
        return states[networkState];
    },
    isConnected : function(){
        if(utilities.checkConnexion() == 'No network connection'){
            return false;
        }else{
            return true;
        }
    },
    getProfilePercent:function(){
        var total = 15;
        var informed = 0;
        var user = utilities.getLocalStorage('user');
        console.log(user);
        if(user.avatar && user.avatar != '')
            informed +=1;
        if(user.pseudo && user.pseudo != '')
            informed +=1;
        if(user.email && user.email != '')
            informed +=1;
        if(user.state && user.state == 'valid')
            informed +=1;
        if(user.first_name && user.first_name != '')
            informed +=1;
        if(user.last_name && user.last_name != '')
            informed +=1;
        if(user.civility && user.civility != '')
            informed +=1;
        if(user.birth_date && user.birth_date != '')
            informed +=1;
        if(user.mobile_tel && user.mobile_tel != '')
            informed +=1;
        if(user.country && user.country != '')
            informed +=1;
        if(user.address && user.address != '')
            informed +=1;
        if(user.cp && user.cp != '')
            informed +=1;
        if(user.city && user.city != '')
            informed +=1;
        if(user.code_postal && user.code_postal != '')
            informed +=1;
        if(user.country_name && user.country_name != '')
            informed +=1;
        /*if(user.nationality && user.nationality != '')
            informed +=1;
        if(user.nationality_name && user.nationality_name != '')
            informed +=1;*/
        return (informed*100) / total;
    },
    slug:function(str) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents, swap √± for n, etc
	var from = "√£√†√°√§√¢·∫Ω√®√©√´√™√¨√≠√Ø√Æ√µ√≤√≥√∂√¥√π√∫√º√ª√±√ß¬∑/_,:;";
	var to   = "aaaaaeeeeeiiiiooooouuuunc------";
	for (var i=0, l=from.length ; i<l ; i++) {
	    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
	    .replace(/\s+/g, '-') // collapse whitespace and replace by -
	    .replace(/-+/g, '-'); // collapse dashes
	return str;
    }
}












// Temps restant
function remaining(date2, date1) {
	if (date1 === undefined)
		var date1 = new Date();
	var sec = (date2 - date1) / 1000;
	var n = 24 * 3600;
	if (sec > 0) {
		j = Math.floor (sec / n);
		h = Math.floor ((sec - (j * n)) / 3600);
		mn = Math.floor ((sec - ((j * n + h * 3600))) / 60);
		sec = Math.floor (sec - ((j * n + h * 3600 + mn * 60)));
		if (j > 0) {
			return j + ' ' + app._('TIME_D') + ' ' + h + ' ' + app._('TIME_H') + ' ' + mn + ' ' + app._('TIME_M');
		} else {
			return h + ' ' + app._('TIME_H') + ' ' + mn + ' ' + app._('TIME_M');
		}
	} else {
		return ': ' + app._('MISSION_EXPIRE');
	}
}
/*String.format */
String.format = function() {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {       
		var reg = new RegExp("\\{" + i + "\\}", "gm");
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}
/* permet de binder le scope */
function bind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}
// g√©n√®re une string al√©atoire de 5 char
function makeRandomString(char)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < char; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
// Format 00
var addZero = function(number) {
  if (number > 9) {
    return number;
  } else {
    return '0' + number;
  }
}
