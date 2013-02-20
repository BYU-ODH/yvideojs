(function(Ayamel){
	"use strict";
	if(!Ayamel){
		throw new Error("Ayamel Uninitialized");
	}
	
	function VideoPlayer(params){
		if(!(this instanceof VideoPlayer)){return new VideoPlayer(params);}
		if(!(params.element instanceof HTMLElement)){
			params.element = document.createElement('div');
		}
		Ayamel.UniformAspectRatio.call(this,params.element,params.aspectRatio);
		Ayamel.MediaController.call(this,this.aspectElement);
		var self = this, time = 0, controls = this.controls,
			video, cb;
		
		this.events = {
			timeupdate: [
				function(){
					time = self.currentClip.currentTime;
					if(time >= controls.loopEnd){self.currentTime = controls.loopStart;}
					else{controls.progress = time;}
				}
			],
			play: [function(){
				controls.playing = self.attrs.playing = true;
			}],
			pause: [function(){
				controls.playing = self.attrs.playing = false;
			}],
			ended: [function(){
				controls.playing = self.attrs.playing = false;
				self.currentTime = 0;
			}]
		};
		
		video = new Ayamel.Video(this,params.resource)
		this.currentClip = video;
		
		if(video.readyState){
			this.controls.duration = video.duration;
			video.Activate();
		}else{
			cb = function(){
				self.controls.duration = video.duration;
				video.Activate();
				video.removeEventListener('durationchange',cb,false);
			};
			video.addEventListener('durationchange',cb,false);
		}
		
		Object.defineProperty(this,'currentTime',{
			get: function(){return time;},
			set: function(val){ //only takes care of external seeking
				time = +val;
				if(time > this.duration){time = this.duration;}
				else if(time < 0){time=0;}
				this.controls.progress = time;
				this.currentClip.currentTime = time;
			},enumerable: true
		});
		Object.seal(this);
	}
	
	VideoPlayer.prototype = Object.create(Ayamel.AyamelElement,{
		Play: {
			value: function(){
				this.controls.playing = this.attrs.playing = true;
				this.currentClip.Play();
			}
		},
		Pause: {
			value: function() {
				this.controls.playing = this.attrs.playing = false;
				this.currentClip.Pause();
			}
		},
		bindKeys: {
			value: function(){
				var self=this,
					spacebinding = function(e){
						e.repeat || self[self.attrs.playing?'Pause':'Play']();
						e.preventDefault();
					},
					upbinding = function(e){
						if(e.ctrlKey && !e.repeat){self.muted = false;}
						else{self.volume+=1;}
					},
					dnbinding = function(e){
						if(e.ctrlKey){e.repeat || (self.muted = true);}
						else{self.volume-=1;}
					},
					leftbinding = function(e){
						if(e.ctrlKey){self.controls.loopStart-=.25;}
						else if(e.shiftKey){self.controls.loopEnd-=.25;}
						else{self.playbackRate-=.1;}
					},
					rightbinding = function(e){
						if(e.ctrlKey){self.controls.loopStart+=.25;}
						else if(e.shiftKey){self.controls.loopEnd+=.25;}
						else{self.playbackRate+=.1;}
					},
					delbinding = function(e){
						e.repeat || (self.controls.loopPoint = null);
					},
					screenbinding = function(e){
						if(e.ctrlKey && !e.repeat){
							self.EnterFullScreen();
						}
					};
				
				Ayamel.keybindings = {
					13: screenbinding,
					32:	spacebinding,
					37:	leftbinding,
					38:	upbinding,
					39:	rightbinding,
					40:	dnbinding,
					46: delbinding,
					' ':			spacebinding,
					DOM_VK_RETURN:	screenbinding,
					DOM_VK_LEFT:	leftbinding,
					DOM_VK_UP:		upbinding,
					DOM_VK_RIGHT:	rightbinding,
					DOM_VK_DOWN:	dnbinding,
					DOM_VK_DELETE:	delbinding
				};
			}
		},
		duration: {
			get: function(){return this.currentClip.duration;},
			enumerable: true
		},
		muted: {
			get: function() {return this.attrs.muted;},
			set: function(mute) {
				this.attrs.muted = this.controls.muted = mute;
				this.currentClip.muted = this.attrs.muted;
				return mute;
			},enumerable: true
		},
		volume: {
			get: function(){return this.attrs.volume;},
			set: function(val) { //The volume as a percentage
				this.attrs.volume = this.controls.volume = val;
				this.currentClip.volume = this.attrs.volume;
				return val;
			},enumerable: true
		},
		playbackRate: {
			get: function(){return this.attrs.playbackRate;},
			set: function(val) {
				val = +val || 0;
				this.attrs.playbackRate = this.controls.playbackRate = val;
				this.currentClip.playbackRate = this.attrs.playbackRate;
				return val;
			},enumerable: true
		}
	});
	
	Ayamel.VideoPlayer = VideoPlayer;
}(Ayamel));