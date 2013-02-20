(function(global){
	"use strict";
	var fs = true,
		reqFS, exitFS, eventFS, isFS, FSEl,
		genFrame;
	
	if(!!document.mozCancelFullScreen){
		exitFS = function(){document.fullScreen && document.mozCancelFullScreen();};
		reqFS = function(el){
			el.mozRequestFullScreen();
			FSEl = el;
		};
		isFS = function(){return document.fullScreen;};
		eventFS = "mozfullscreenchange";
	}else if(!!document.webkitCancelFullScreen){
		exitFS = function(){document.webkitIsFullScreen && document.webkitCancelFullScreen();};
		reqFS = function(el){
			el.webkitRequestFullScreen();
			FSEl = el;
		};
		isFS = function(){return document.webkitIsFullScreen;};
		eventFS = "webkitfullscreenchange";
	}else{fs = false;}
	
	if(!global.Ayamel){
		genFrame = document.createElement('iframe');
		
		genFrame.style.width = "100%";
		genFrame.style.height = "100%";
		genFrame.style.position = "absolute";
		genFrame.frameBorder = "0";
		//	genFrame.sandbox = "allow-same-origin";
		genFrame.mozallowfullscreen = true;
		genFrame.seamless = true;
		
		//set up hot-key handlers
		global.addEventListener('keydown',function(e){
			var action = Ayamel.keybindings[e.key || e.keyCode];
			if(action){
				if(typeof e.repeat === 'undefined'){
					e.repeat = !!action.done;
				}
				action(e);
				action.done = true;
			}
		},false);
		global.addEventListener('keyup',function(e){
			var action = Ayamel.keybindings[e.key || e.keyCode];
			action && (action.done = false);
		},false);
		
		global.Ayamel = {
			TimedMedia:		function(){throw "Ayamel.TimedMedia Uninitialized";},
			VideoPlayer:	function(){throw "Ayamel.VideoPlayer Uninitialized";},
			Video:		function(){throw "Ayamel.Video Uninitialized";},
			Text:		function(){throw "Ayamel.Text Uninitialized";},
			AyamelElement: {
				get supportsFullscreen() {return fs;},
				get isFullScreen() {return document.fullScreenElement === this.element || isFS();},
				EnterFullScreen:function() {fs && reqFS(this.element);},
				LeaveFullScreen:function() {fs && exitFS();},
			},
			FSElement: function(){return isFS() && FSEl;},
			keybindings:{},
			genFrame:genFrame
		};
	}
}(window));