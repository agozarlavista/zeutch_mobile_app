var gmap = {
    map:null,
    walker_marker : null,
    markers_list : null,
    group_marker : null,
    map_markers : [],
    bounds:null,
    isOpen:false,
    iconMission: null,
    localMissions:[],
    init:function(){
        $('.gmap').append('<div class="gmap_canvas" id="gmap-canvas"></div>');
        var h=$(document).height()-50;
        $('.gmap-canvas').css('height', h+'px');
        var centermap = new google.maps.LatLng(50, 3);
        if(utilities.getLocalStorage('lastPosition') && utilities.getLocalStorage('lastPosition') != ""){
            centermap = new google.maps.LatLng(utilities.getLocalStorage('lastPosition').coords.latitude, utilities.getLocalStorage('lastPosition').coords.longitude);
        }
        if (window.google !== undefined) {
			window.map = new google.maps.Map(document.getElementById('gmap-canvas'), {
				zoom: 12,
				center: centermap,
				disableDefaultUI: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
            //this.bounds = new google.maps.LatLngBounds();
            this.add_walker();
            this.update_position();
        }else{
            //alert('not ready');
        }
        var self = this;
        $('.center_map_button').bind('tap', function(){
            self.setMapCenter();
        });
        $('.close_map_button').bind('tap', function(){
            self.hideMap();
        });
    },
    add_walker : function(){
        if(this.walker_marker == null){
            var walkpos = new google.maps.LatLng(50, 3);
            if(utilities.getLocalStorage('lastPosition') && utilities.getLocalStorage('lastPosition') != ""){
                walkpos = new google.maps.LatLng(utilities.getLocalStorage('lastPosition').coords.latitude, utilities.getLocalStorage('lastPosition').coords.longitude);
            }
            this.walker_marker = new RichMarker({
                map: window.map,
                position: walkpos,
                draggable: false,
                anchor: RichMarkerPosition.MIDDLE,
                content: '<div class="walker_marker"><div class="circle_walker_marker animate_circle lightblue"></div><div class="center_walker_marker lightblue"></div></div>',
                shadow:'0px 0px 0px rgba(0,0,0,0)'
            });
            this.setMapCenter();
        }
    },
    update_position:function(){
        if(utilities.getLocalStorage('lastPosition') && utilities.getLocalStorage('lastPosition') != ""){
            latlng = new google.maps.LatLng(utilities.getLocalStorage('lastPosition').coords.latitude, utilities.getLocalStorage('lastPosition').coords.longitude);
            if(window.map){
                //this.map.setCenter(latlng);
                //this.map.panTo(this.walker_marker.getPosition());
                this.walker_marker.setPosition(latlng);
            }
        }
    },
    setMapCenter : function(){
        if(utilities.getLocalStorage('lastPosition') && utilities.getLocalStorage('lastPosition') != ""){
            latlng = new google.maps.LatLng(utilities.getLocalStorage('lastPosition').coords.latitude, utilities.getLocalStorage('lastPosition').coords.longitude);
            if(window.map){
                //this.map.setCenter(latlng);
                window.map.panTo(this.walker_marker.getPosition());
            }
        }
    },
    refreshMarkers : function(markers){
        this.bounds = new google.maps.LatLngBounds(null);
        /* on supprime les markers */
        for(var m=0; m<this.map_markers.length; m++){
            this.map_markers[m].setMap(null);
        }
        this.map_markers = [];
        /* on stock rapido la liste courante */
        this.markers_list = markers;
        this.checkIsMarker(this.markers_list);
    },
    checkIsMarker : function(list){
        this.bounds.extend(this.walker_marker.getPosition());
        for(var i=0; i<list.length; i++){
            if(list[i]['latitude'] && list[i]['longitude']){
                if(list[i]['missionId']){
                    if(parseInt(list[i]['placeId']) == 0){
                        this.localMissions.push(list[i]);
                        this.addLocalMission();
                        //this.addMissionMarker(this.walker_marker.getPosition(), list[i]);
                    }else{
                        this.addMissionMarker(new google.maps.LatLng(list[i]['latitude'], list[i]['longitude']), list[i]);
                    }
                }else{
                    
                }
            }
        }
    },
    addLocalMission : function(){
        if(!this.walker_marker)
            return;
        var self = this;
        self.iconMission =new google.maps.MarkerImage("file:///" + navigation.defaultUri + "img/plugins/maps/marker_green.png",
            null,
            new google.maps.Point(0, 0),
            new google.maps.Point(12.0, 35.0),
            new google.maps.Size(24,35)
        );
        var classicmarker = new google.maps.Marker({
            position: this.walker_marker.getPosition(),
            map: window.map,
            title:app._('MISSIONLIST_ATHOME'),
            icon : self.iconMission
        });
        google.maps.event.addListener(classicmarker, 'click', function() {
            var message = "";
            for(var i=0; i<self.localMissions.length; i++){
                message+= self.getMissionLocaleTemplate(self.localMissions[i]);
            }
            setTimeout(function(){
            caw_ui.cwMessage(app._('TITLE_MISSIONLIST'), message, [
                {"label":app._('CHRONO_ENDED_BUTTON_LATER'), "color":"orangea", "icon":"4"}
            ], function(e){
                if(parseInt(e)==0){
                    // simply close message window ?
                }else{
                    caw_ui.lockScreen();
                    setTimeout(function(){
                        navigation.router.navigate('page/'+e, {trigger: true, replace: false});
                        setTimeout(function(){
                            caw_ui.unLockScreen();
                            gmap.hideMap();
                        }, 500);
                    },800); 
                }
            });
            },500);
        });
        this.map_markers.push(classicmarker);
        
        this.bounds.extend(latlng);
        window.map.fitBounds(this.bounds);
    },
    addMissionMarker : function(latlng, objList){
        var self = this;
        /*var new_marker = new RichMarker({
            map: self.map,
            position: latlng,
            draggable: false,
            anchor: RichMarkerPosition.BOTTOM,
            content: '<div class="mission_marker orangeMarker">clic ici</div>',
            shadow:'0px 0px 0px rgba(0,0,0,0)'
        });
        google.maps.event.addListener(new_marker, 'click', function(){
            //self.map.panTo(latlng);
            alert('hited');
            var message = self.getMissionTemplate(objList);
            caw_ui.cwMessage(app._('TITLE_MISSIONLIST'), message, [
                {"label":app._('CHRONO_ENDED_BUTTON_LATER'), "color":"orangea", "icon":"4"}
            ], function(e){
                if(parseInt(e)==0){
                    // simply close message window ?
                }else{
                    caw_ui.lockScreen();
                    setTimeout(function(){
                        navigation.router.navigate('page/'+e, {trigger: true, replace: false});
                        setTimeout(function(){
                            caw_ui.unLockScreen();
                            gmap.hideMap();
                        }, 500);
                    },800); 
                }
                //navigation.router.navigate('page/dashboard/mission/'+objList['missionId']+'/place/'+objList['placeId']+'/detail/'+objList['missionId'], {trigger: true, replace: true});
            });
            //{"label":app._('TITLE_MISSIONDETAIL'), "color":"greena", "icon":"4"},
            //,{"label":app._('OPEN_GPS_NAVIGATION'), "color":"orangea", "icon":"4"}
            //alert(objList['missionId']+" "+objList['placeId']);
        });
        this.map_markers.push(new_marker);*/
        self.iconMission =new google.maps.MarkerImage("file:///" + navigation.defaultUri + "img/plugins/maps/marker_orange_small.png",
            null,
            new google.maps.Point(0, 0),
            new google.maps.Point(12.0, 35.0),
            new google.maps.Size(24,35)
        );
        var classicmarker = new google.maps.Marker({
            position: latlng,
            map: window.map,
            title:objList.address,
            icon : self.iconMission
        });
        google.maps.event.addListener(classicmarker, 'click', function() {
            var message = self.getMissionTemplate(objList);
            caw_ui.cwMessage(app._('TITLE_MISSIONLIST'), message, [
                {"label":app._('CHRONO_ENDED_BUTTON_LATER'), "color":"orangea", "icon":"4"}
            ], function(e){
                if(parseInt(e)==0){
                    // simply close message window ?
                }else{
                    caw_ui.lockScreen();
                    setTimeout(function(){
                        navigation.router.navigate('page/'+e, {trigger: true, replace: false});
                        setTimeout(function(){
                            caw_ui.unLockScreen();
                            gmap.hideMap();
                        }, 500);
                    },800); 
                }
            });
        });
        this.map_markers.push(classicmarker);
        
        this.bounds.extend(latlng);
        window.map.fitBounds(this.bounds);
    },
    getMissionTemplate : function(mission){
        mission.distance = this.get_distance(this.walker_marker.getPosition(), new google.maps.LatLng(mission['latitude'], mission['longitude']));
        GmapMission = Backbone.Model.extend(mission);
        GmapMissionView = Backbone.View.extend({
            tagName:"div",
            className:"item",
            template:$("#gmap_mission_template").html(),
            render:function () {
                var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html
                this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
                return this;
            }
        });
        var gmapmission = new GmapMission(mission);
            gmapmissionView = new GmapMissionView({ model: gmapmission });
        console.log(gmapmissionView.render().el);
        return gmapmissionView.render().el.innerHTML;
        //return "mission label";
    },
    getMissionLocaleTemplate : function(mission){
        mission.distance = this.get_distance(this.walker_marker.getPosition(), new google.maps.LatLng(mission['latitude'], mission['longitude']));
        GmapMission = Backbone.Model.extend(mission);
        GmapMissionView = Backbone.View.extend({
            tagName:"div",
            className:"item",
            template:$("#gmap_mission_locale_template").html(),
            render:function () {
                var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html
                this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
                return this;
            }
        });
        var gmapmission = new GmapMission(mission);
            gmapmissionView = new GmapMissionView({ model: gmapmission });
        console.log(gmapmissionView.render().el);
        return gmapmissionView.render().el.innerHTML;
        //return "mission label";
    },
    get_distance : function(p1, p2){
        if (!p1 || !p2) {
            return 0;
        }

        var R = 6371; // Radius of the Earth in km
        var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
        var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    },
    showMap : function(markers_data){
        //this.add_walker();
        this.localMissions=[];
        utilities.getposition();
        var h=$(document).height()-50;
        var self = this;
        /*if(this.isOpen){
            this.hideMap();
            return;
        }*/
        this.isOpen = true;
        TweenLite.to($('.gmap'), .5, {css:{'height' : h+'px'}, ease:Power4.easeInOut, onComplete:function(){
			if(window.map == null){
                self.init();
            }
            google.maps.event.trigger(window.map, 'resize');
			self.refreshMarkers(markers_data);
		}});
    },
    hideMap : function(){
        navigator.geolocation.clearWatch(utilities.positionWatchID);
        this.isOpen = false;
		var self = this;
        TweenLite.to($('.gmap'), .5, {css:{'height':'0'}, ease:Power4.easeInOut, onComplete:function(){
			self.destroy();
		}});
    },
    /*showMap : function(markers_data){
        var h=$(document).height();
        $('.gmap').css('height', h+'px');
        this.init();
        this.refreshMarkers(markers_data);
    },
    hideMap : function(){
        $('.gmap').css('height', '0');
        this.destroy();
    },*/
    destroy:function(){
        /* on supprime les markers */
        this.localMissions=[];
        for(var m=0; m<this.map_markers.length; m++){
            this.map_markers[m].setMap(null);
        }
        //this.walker_marker.setMap(null);
        //this.walker_marker = null;
        this.map_markers = [];
        //this.map = null;
        this.walker_marker.setMap(null);
        this.walker_marker = null;
        this.markers_list = null;
        this.bounds = null;
        delete window.map;
        $('.gmap .gmap-canvas').remove();
    }
}