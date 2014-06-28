var navigation = {
    navStory : [],
    root : null,
    router : null,
    pageInfos : [],
    oldPage : null,
    transition : null,
    tweentime:.5,
    defaultUri : null,
    _pageDefault : 'home',
    _currentPageScript : '',
    shutterNavigation:null,
    shutterScroll : null,
    _refreshable:{
        "profile":{up:false, down:true}, 
        "dashboard":{up:false, down:true}, 
        "missions":{up:false, down:true}, 
        "wallet":{up:false, down:true}, 
        "current_missions":{up:false, down:true}, 
        "bank":{up:false, down:true}, 
        "history":{up:false, down:true},
        "walkerhistory":{up:true, down:true}, 
        "settings":{up:false, down:true}, 
        "sponsorship":{up:false, down:true}, 
        "invite_friends":{up:true, down:true}
    },
    _geolocationNeeded:{
	"missions":true,
	"current_missions":true
    },
    // Application Constructor
    initialize: function() {
        if ( device.platform == 'android' || device.platform == 'Android' )
        {
               
        }
        navigation.initRoot();
        navigation.setListeners();
        
        this.shutterScroll = new IScroll('.shutterNavigation', {
            scrollbars: true,
            /*interactiveScrollbars: true,*/
            /*shrinkScrollbars: 'scale',*/
            fadeScrollbars: true
        });
    },
    setListeners : function(){
        var self = this;
        this.shutterNavigation = new shutter();
        this.shutterNavigation.init();
        $('.shutterNavigation .txtdyn').each(function(index){
            $(this).html(app._($(this).data('text')));
        });
        document.addEventListener('menubutton', function(){
            self.shutterNavigation.open();
        }, false);
        
        document.addEventListener("backbutton", function(){
            if(window.history.length>0){
                navigation.transition = 'swipeRight';
                navigation.getLogicBack();
            }else{
                navigator.app.exitApp();
            }
        }, false);
        
        $(document).bind('tap', function(e){
            var page = "";
            if($(e.target).parent().attr('data-navigate')){
                utilities.navigateGPS($(e.target).parent().attr('data-navigate'));
            }
            if($(e.target).parent().attr('data-action')){
                if($(e.target).parent().attr('data-action') == "refresh"){
                    navigation._currentPageScript.refresh();
                }
            }
            if($(e.target).attr('data-browser')){
                utilities.openBrowser(function(){},{url:$(e.target).attr('data-browser')});
            }else{
                if($(e.target).parent().attr('data-browser')){
                    utilities.openBrowser(function(){},{url:$(e.target).parent().attr('data-browser')});
                }else{
                }
            }
            if($(e.target).attr('data-page')){
                self.motionTouchScreen(e);
                if($(e.target).attr('data-page') == 'backbutton'){
                    navigation.transition = 'swipeRight';
                    navigation.getLogicBack();
                    return;
                }else{
                    page = $(e.target).attr('data-page');
                }
            }else{
                if(!$(e.target).parent().attr('data-page')){
                    return false;
                }else{
                    self.motionTouchScreen(e);
                    if($(e.target).parent().attr('data-page') == 'backbutton'){
                        navigation.transition = 'swipeRight';
                        navigation.getLogicBack();
                        return;
                    }else{
                        page = $(e.target).parent().attr('data-page');
                    }
                }
            }
            if($(e.target).attr('data-transition')){
                navigation.transition = $(e.target).attr('data-transition');
            }else{
                if($(e.target).parent().attr('data-transition')){
                    navigation.transition = $(e.target).parent().attr('data-transition');
                }else{
                    navigation.transition = null;
                }
            }
            navigation.router.navigate('page/'+page, {trigger: true, replace: false});
			//Backbone.history.stop();
        });
    },
    motionTouchScreen : function(e, target){
        /* ---------------------------  DISPLAY TOUCH SCREEN EVENT --------------------------- */
        var TouchScreen = Backbone.Model.extend({
            defaults:{}
        });
        var TouchScreenView = Backbone.View.extend({
            tagName:"div",
            className:"",
            template:$("#touch_event").html(),
            render:function () {
                var tmpl = _.template(this.template);
                this.$el.html(tmpl(this.model.toJSON()));
                return this;
            }
        });
        caw_ui.lockScreen();
        $(".lock").html('');
        //$('.lock').addClass('touchGardient');
        var touchscreen = new TouchScreen({});
        touchscreenView = new TouchScreenView({ model: touchscreen });
        $(".lock").append(touchscreenView.render().el);
        
        $('.touchBlock').css('width', target.width());
        $('.touchBlock').css('height', target.height());
        
        
        TweenLite.to($(".lock .touchRound"), .2, {
            scaleX:2, scaleY:2, opacity:.3, ease:Power4.easeOut, onComplete:function(){
                TweenLite.to($(".lock .touchRound"), .4, {
                    scaleX:2.5, scaleY:2.5, opacity:0, ease:Power4.easeIn, onComplete:function(){
                        caw_ui.unLockScreen();
                        //$('.lock').removeClass('touchGardient');
                    }
                });
            }
        });
        var touch = e.gesture.touches[0];
        //$('.touchRound').css('left', (touch.clientX-25)+"px");
        //$('.touchRound').css('top', (touch.clientY-25)+"px");
        
        //$('.lock').css('background-image', '-webkit-gradient(radial, '+touch.clientX+' '+touch.clientY+', 0px, '+touch.clientX+' '+touch.clientY+', 100%, color-stop(0%,rgba(255,255,255,0.84)), color-stop(100%,rgba(255,255,255,0)));');
        
        
        /* ---------------------------  DISPLAY TOUCH SCREEN EVENT --------------------------- */
    },
    getLogicBack : function(){
        var keys = [];
        for(var key in _logicBack){
            keys.push(key);
        }
        var isLogic = false;
        var logicPage = "";
        for(var i=0; i<keys.length; i++){
            if(keys[i] == navigation.getPage()){
                isLogic = true;
                logicPage = _logicBack[keys[i]];
            }
        }
        if(isLogic){
            if(logicPage == "dashboard" && this.getPage() == "dashboard"){
                caw_ui.cwMessage("", app._('KILL_THE_APP'), [
                    {"label":app._('KILL_THE_APP_TRUE'), "color":"orangea", "icon":"4"},
                    {"label":app._('KILL_THE_APP_FALSE'), "color":"greena", "icon":"4"}
                ], function(e){
                    if(e==0){
                        navigator.app.exitApp();   
                    }
                });
            }else{
                navigation.router.navigate('page/'+logicPage, {trigger: true, replace: true});
            }
        }else{
            window.history.back();
        }
    },
    initRoot : function(){
        var ApplicationRouter = Backbone.Router.extend({
            routes: {
                  "": "loadPage",
                  "*page":"loadPage"
            },
            loadPage : function(params){
                if(typeof navigation._currentPageScript.destroy != 'undefined'){
                    navigation._currentPageScript.destroy();
                }
                if(navigation.defaultUri == null){
                    navigation.defaultUri = params.replace('index.html', '');
                }
                navigation.pageInfos = {};
                if(!params) return false;
                //params = params.replace('#','');
                var paramsArray = params.split('/');
                if(paramsArray[0] == "page"){
                    //paramsArray = paramsArray.splice(0, 1);
                    var param = 0;
                    for(var i = 0; i < paramsArray.length; i += 2){
                        //alert('{"tag" : "' + paramsArray[i] + '", "value" : "' + paramsArray[i+1] + '"}');
                        navigation.pageInfos[paramsArray[i]] = JSON.parse('{"tag" : "' + paramsArray[i] + '", "value" : "' + paramsArray[i+1] + '"}');
                        //alert(paramsArray[i] + " " + navigation.pageInfos[paramsArray[i]]);
                        param++;
                    }
                    navigation.changePage();
                    //alert(JSON.stringify(navigation.pageInfos));
                }
            }
        });
        //Backbone.emulateHTTP = true;
        navigation.router = new ApplicationRouter();
        Backbone.history.start({pushState:true});
        navigation.transition = 'instant';
        var startPage = navigation._pageDefault;
        if (utilities.getLocalStorage('user') != '') {
            startPage = 'dashboard';
		}
        if (utilities.getLocalStorage('first_run') == ''){
            startPage = 'first_run';
        }
        navigation.router.navigate('page/'+startPage, {trigger: true, replace: false});
        //navigation.setSampleListeners();
        //Backbone.history.stop();
    },
    goBack : function(){
        Backbone.history.start();
        Backbone.history.back();
        Backbone.history.stop();
    },
    setSampleListeners : function(){
        $('.button').bind('click',function(e){
           	//Backbone.history.start({ pushState: true });
            //navigation.router.navigate($(e.target).attr('data-page'));
			Backbone.history.start({pushState:true});
			navigation.router.navigate($(e.target).attr('data-page'), {trigger: true, replace: false});
			Backbone.history.stop();
		});
        $('.backButton').bind('click', function(e){
            //console.log('hello');
            //navigation.goBack();
        });
	},
    getPage : function(){
        var keys = [];
        for(var key in navigation.pageInfos){
            keys.push(key);
        }
        var pageName = navigation.pageInfos[keys[keys.length-1]]['tag'];
        if(pageName == "page"){
            pageName = navigation.pageInfos[keys[keys.length-1]]['value'];
        }
        return pageName;
    },
    changePage : function(){
        if(this.shutterNavigation != null)
            this.shutterNavigation.close();
        //console.log(JSON.stringify(navigation.pageInfos));
        var keys = [];
        for(var key in navigation.pageInfos){
            keys.push(key);
        }
        var pageName = navigation.pageInfos[keys[keys.length-1]]['tag'];
        if(pageName == "page"){
            pageName = navigation.pageInfos[keys[keys.length-1]]['value'];
        }
	if (typeof this._geolocationNeeded[pageName] != "undefined" &&
	    this._geolocationNeeded[pageName] == true &&
	   utilities.getLocalStorage("lastPosition") == ''){
	    caw_ui.cwMessage(
                app._('GEOLOC_TITLE'), 
                '<div class="image image_geolocation"></div><br>'+app._('GEOLOC_ACTIVATE'), 
                [{"label":"OK", "color":"greya", "icon":"4"}],
		function(e){}
            );
	    return;
	}
        //alert(JSON.stringify(navigation.pageInfos));
        caw_ui.lockScreen();
        navigation.oldPage = $('#screen div').first();
        //alert(navigation.oldPage);
        console.log(navigation.oldPage.attr('id'));
        var leftPos = 0;
        var nextLeftPos = 0;
        switch(navigation.transition)
        {
            case 'swipeLeft':
                leftPos = '-100%';
                nextLeftPos = '100%';
                navigation.tweentime = .4;
                break;
            case 'swipeRight':
                leftPos = '100%';
                nextLeftPos = '-100%';
                navigation.tweentime = .4;
                break;
            case 'instant':
                leftPos = '0';
                nextLeftPos = '0';
                navigation.tweentime = 0;
                break;
            default:
                leftPos = '-100%';
                nextLeftPos = '100%';
                navigation.tweentime = .4;
                break;
        }
        navigation.transition = null;
        navigation.addResource(pageName, 'css');
        $('#screen').prepend('<div class="content" id="' + pageName + '"></div>');
        //$('#' + navigation.pageInfos[0]['value']).css('left', '0');
        $('#' + pageName).css('left', nextLeftPos);
        //$('#' + navigation.pageInfos[0]['value']).addClass('transition');
        //console.log( navigation.defaultUri + 'content/pages/' + navigation.pageInfos[0]['value'] + '.html');
        $('#' + pageName).load('file:///' + navigation.defaultUri + 'content/pages/' + pageName + '.html', function(response, status, xhr) {
            if(status == 'success'){
                navigation.addResource(pageName, 'js');
                //$('#' + navigation.pageInfos[0]['value']).html(response);
                caw_ui.setPage(pageName);
                //TRADUCTION DE LA PAGE 
                $('#' + pageName + ' .txtdyn').each(function(index){
                    $(this).html(app._($(this).data('text')));
                });
                // Pour les valeurs
                $('#' + pageName + ' .valdyn').each(function(index){
                    $(this).attr('value', app._($(this).data('value')));
                });
                /* CSS VERSION
                setTimeout(function(){
                    $('#' + navigation.pageInfos[0]['value']).css('left', '0');
                    $('#' + navigation.oldPage.attr('id')).css('left', leftPos);
                },300);
                setTimeout(function(){
                    navigation.removeResource(navigation.oldPage.attr('id'), 'css');
                    navigation.removeResource(navigation.oldPage.attr('id'), 'js');
                    $('#' + navigation.oldPage.attr('id')).remove();
                    caw_ui.setWrapper();
                    caw_ui.unLockScreen();
                },500);
                */
                /* TWEENLITE VERSION */
                TweenLite.to($('#' + pageName), navigation.tweentime, {css:{'left':'0'}, ease:Power4.easeOut, delay:.5});
                TweenLite.to($('#' + navigation.oldPage.attr('id')), navigation.tweentime, {css:{'left':leftPos}, ease:Power4.easeOut, delay:.5, onComplete:function(){
                    navigation.removeResource(navigation.oldPage.attr('id'), 'css');
                    navigation.removeResource(navigation.oldPage.attr('id'), 'js');
                    $('#' + navigation.oldPage.attr('id')).remove();
                    caw_ui.setWrapper();
                    caw_ui.unLockScreen();
                    //navigation._currentPageScript.init();
                    //navigation.testtransition(navigation.pageInfos[0]['value']);
                }});
            }
        });
    },
    testtransition : function(obj){
        if($('#'+obj).position().left == 0){
            TweenLite.to($('#'+obj), .5, {css:{'left':"100%"}, onComplete:function(){
                navigation.testtransition(obj);
            }});
        }else{
            TweenLite.to($('#'+obj), .5, {css:{'left':"0"}, onComplete:function(){
                navigation.testtransition(obj);
            }});
        }
    },
    addResource: function(filename, filetype) {
		if (filetype == 'js'){
			var fileref = document.createElement('script')
			fileref.setAttribute('type','text/javascript');
			fileref.setAttribute('src', 'file:///' + navigation.defaultUri + 'js/pages/' + filename + '.js');
		} else if (filetype=='css'){
			// CSS
			var fileref = document.createElement('link')
			fileref.setAttribute('rel', 'stylesheet');
			fileref.setAttribute('type', 'text/css');
			fileref.setAttribute('href', 'file:///' + navigation.defaultUri + 'css/pages/' + filename + '.css');
		}
		// Ajout du fichier dans le head
	 	if (typeof fileref!='undefined')
  			document.getElementsByTagName('head')[0].appendChild(fileref)
	},
    removeResource: function(filename, filetype) {
		var targetelement = (filetype=='js')? 'script' : (filetype=='css')? 'link' : 'none' 
		var targetattr = (filetype=='js')? 'src' : (filetype=='css')? 'href' : 'none' 
		var allsuspects = document.getElementsByTagName(targetelement)
		for (var i=allsuspects.length; i>=0; i--){ 
			if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename+'.')!=-1){
				allsuspects[i].parentNode.removeChild(allsuspects[i]);
			}
		}
	},
    addPureResource: function(filename, filetype) {
		if (filetype == 'js'){
			var fileref = document.createElement('script')
			fileref.setAttribute('type','text/javascript');
			fileref.setAttribute('src', filename);
		} else if (filetype=='css'){
			// CSS
			var fileref = document.createElement('link')
			fileref.setAttribute('rel', 'stylesheet');
			fileref.setAttribute('type', 'text/css');
			fileref.setAttribute('href', filename);
		}
		// Ajout du fichier dans le head
	 	if (typeof fileref!='undefined')
  			document.getElementsByTagName('head')[0].appendChild(fileref)
	}
};


var _logicBack = {
    "dashboard":"dashboard",
    "missions":"dashboard",
    "current_missions":"dashboard",
    "current_detail":"current_missions",
    "bank":"dashboard",
    "add_banking":"bank",
    "edit_banking":"bank",
    "profile":"dashboard",
    "places":"missions",
    "detail":"missions",
    "messagerie":"messagerie",
    "messages":"dashboard",
    "mission_upload":"dashboard",
    "history":"dashboard",
    "settings":"dashboard",
    "sponsorship":"dashboard",
    "subscribe":"home",
    "wallet":"dashboard",
    "login":"home",
    "home":"home"
}
