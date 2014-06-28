function shutter () {
    this._sliding = false;  
    this._width = ($(document).width() * 80)/100;
    this._X=0;
    this._lastPosX=0;
    this._isOpen = false;
}
shutter.prototype.init = function(){
    alert('init');
    var thisObj = this;
	Hammer( document ).on("touchstart", function(event) {
        if(event.touches[0].pageX < 10 && event.touches[0].pageY > 50){
            TweenLite.to($('.shutterNavigation'), .1, {css:{width:'35px'}, ease:Power4.easeOut});
            TweenLite.to($('.app'), .1, {css:{left:'35px'}, ease:Power4.easeOut}); 
            TweenLite.to($('.lock'), .1, {css:{left:'35px'}, ease:Power4.easeOut}); 
            $('.lock').css('display', 'block');
            thisObj._sliding = true;
        }
        if(thisObj._isOpen == true && event.touches[0].pageX >= thisObj._width){
            thisObj._sliding = true;
        }
    });
    Hammer( document ).on("touchmove", function(event) {
        if(thisObj._sliding == true){
            thisObj._lastPosX = event.touches[0].pageX;
            if(event.touches[0].pageX < thisObj._width){
                var moveX = event.touches[0].pageX;
                if(moveX<35)
                    moveX = 35;
                $('.shutterNavigation').css('width', moveX+'px');
                $('.app').css('left', moveX+'px');
                $('.lock').css('left', moveX+'px');
            }
        }
        event.preventDefault();
    });
    Hammer( document ).on("touchend", function(event) {
        if(thisObj._sliding == true){
            thisObj._sliding = false;
            if(thisObj._lastPosX > thisObj._width/2){
                thisObj.open();
            }else{
                thisObj.close();
            }
        }
    });
    alert('hello');
}
shutter.prototype.open = function(){
    alert('open');
    this._sliding = false;
    this._isOpen = true;
	$('.lock').css('display', 'block');
    TweenLite.to($('.shutterNavigation'), .5, {css:{width:this._width+'px'}, ease:Power4.easeOut}); 
    TweenLite.to($('.lock'), .5, {css:{backgroundColor:'rgba(0,0,0,.5)'}}); 
    TweenLite.to($('.app'), .5, {css:{left:this._width+'px'}, ease:Power4.easeOut}); 
    TweenLite.to($('.lock'), .5, {css:{left:this._width+'px'}, ease:Power4.easeOut}); 
}
shutter.prototype.close = function(){
    this._sliding = false;
    this._isOpen = false;
    $('.lock').css('display', 'none');
    TweenLite.to($('.shutterNavigation'), .5, {css:{width:'0px'}, ease:Power4.easeOut}); 
    TweenLite.to($('.lock'), .5, {css:{backgroundColor:'rgba(0,0,0,0)'}}); 
    TweenLite.to($('.app'), .5, {css:{left:'0px'}, ease:Power4.easeOut}); 
    TweenLite.to($('.lock'), .5, {css:{left:'0px'}, ease:Power4.easeOut}); 
}