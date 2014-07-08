/**
 * Created with IntelliJ IDEA.
 * User: camman3d
 * Date: 5/6/13
 * Time: 1:37 PM
 * To change this template use File | Settings | File Templates.
 */
(function (Ayamel) {
	"use strict";

	var counter = 0;

	function supportsFile(file) {
		return file.streamUri && file.streamUri.substr(0,13) === "brightcove://";
	}

	function findFile(resource) {
		for (var i=0; i<resource.content.files.length; i += 1) {
			var file = resource.content.files[i];
			if (supportsFile(file))
				return file;
		}
		return null;
	}

	function generateBrightcoveTemplate(videoId){
		return Ayamel.utils.parseHTML('<div class="videoBox"><object id="brightcoveExperience'
		+ (counter++).toString(36)
		+ '" class="BrightcoveExperience">\
				<param name="bgcolor" value="#FFFFFF" />\
				<param name="width" value="100%" />\
				<param name="height" value="100%" />\
				<param name="wmode" value="opaque" />\
				<param name="playerID" value="2359958964001" />\
				<param name="playerKey" value="AQ~~,AAABBjeLsAk~,DhYCBe7490IkhazTuLjixXSBXs1PvEho" />\
				<param name="isSlim" value="true" />\
				<param name="dynamicStreaming" value="true" />\
				<param name="includeAPI" value="true" />\
				<param name="templateLoadHandler" value="brightcoveTemplateLoaded" />\
				<param name="@videoPlayer" value="' + videoId + '" />\
				<param name="templateReadyHandler" value="brightcoveTemplateReady" />\
			</object></div>');
	}

	function BrightcoveVideoPlayer(args) {
		var _this = this,
			startTime = +args.startTime || 0,
			stopTime = +args.endTime || -1,
			file = findFile(args.resource),
			videoId = file.streamUri.substr(13),
			element = generateBrightcoveTemplate(videoId),
			captionsElement = document.createElement('div'),
			properties = {
				duration: 0,
				currentTime: 0,
				paused: true
			};

		this.element = element;
		args.holder.appendChild(element);

		// Create a place for captions
		this.captionsElement = captionsElement;
		captionsElement.className = "videoCaptionHolder";
		args.holder.appendChild(captionsElement);

		this.player = null;
		this.properties = properties;

		// Register the global callbacks
		window.brightcoveTemplateLoaded = function brightcoveTemplateLoaded(experienceID) {
			var brightcoveExperience = brightcove.api.getExperience(experienceID);
			_this.player = brightcoveExperience.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
			_this.player.seek(properties.currentTime);
			if(!properties.paused){ _this.player.play(); }
		};

		window.brightcoveTemplateReady = function brightcoveTemplateReady(experienceID) {
			var events = {};
			events[brightcove.api.events.MediaEvent.BEGIN] = "durationchange";
			events[brightcove.api.events.MediaEvent.CHANGE] = "durationchange";
			events[brightcove.api.events.MediaEvent.COMPLETE] = "ended";
			events[brightcove.api.events.MediaEvent.ERROR] = "error";
			events[brightcove.api.events.MediaEvent.PLAY] = "play";
			events[brightcove.api.events.MediaEvent.PROGRESS] = "timeupdate";
			events[brightcove.api.events.MediaEvent.SEEK_NOTIFY] = "seek";
			events[brightcove.api.events.MediaEvent.STOP] = "pause";

			function updateProperties(event) {
				properties.currentTime = event.position;
				properties.duration = event.duration;
				if (event.type === brightcove.api.events.MediaEvent.PLAY) {
					properties.paused = false;
				}
				if (event.type === brightcove.api.events.MediaEvent.STOP || event.type === brightcove.api.events.MediaEvent.COMPLETE) {
					properties.paused = true;
				}
			}

			Object.keys(events).forEach(function (brightcoveEvent) {
				_this.player.addEventListener(brightcoveEvent, function(event) {
					updateProperties(event);
					element.dispatchEvent(new Event(events[brightcoveEvent],{bubbles:true,cancelable:true}));
				});
			});
		};

		// Create the player
		brightcove.createExperiences();

		//TODO: Set up the duration checking

		Object.defineProperties(this, {
			duration: {
				get: function () {
					var stop = stopTime === -1 ? properties.duration : stopTime;
					return stop - startTime;
				}
			},
			currentTime: {
				get: function () {
					return properties.currentTime - startTime;
				},
				set: function (time) {
					time = Math.floor(Number(time)* 100) / 100;
					properties.currentTime = time + startTime;
					this.player && this.player.seek(properties.currentTime);
					return time;
				}
			},
			muted: {
				get: function () {
					return false;
					//return this.video.muted;
				},
				set: function(muted){
					return false;
					//this.video.muted = !!muted;
				}
			},
			paused: {
				get: function(){
					return properties.paused;
				}
			},
			playbackRate: {
				get: function(){
					return 1;
				},
				set: function(playbackRate){
					//this.video.playbackRate = Number(playbackRate);
					return 1;
				}
			},
			readyState: {
				get: function(){
					return 0;//this.video.readyState;
				}
			},
			volume: {
				get: function(){
//                    return this.video.volume;
					return 1;
				},
				set: function(volume){
//                    this.video.volume = +volume;
					return 1;
				}
			},
			height: {
				get: function(){ return element.clientHeight; },
				set: function(h){
					h = +h || element.clientHeight;
					element.style.height = h + "px";
					return h;
				}
			},
			width: {
				get: function(){ return element.clientWidth; },
				set: function(w){
					w = +w || element.clientWidth;
					element.style.width = w + "px";
					return w;
				}
			}
		});
	}

	BrightcoveVideoPlayer.prototype.play = function() {
		this.player && this.player.play();
		this.properties.paused = false;
	};

	BrightcoveVideoPlayer.prototype.pause = function() {
		this.player && this.player.pause();
		this.properties.paused = true;
	};

	BrightcoveVideoPlayer.prototype.enterFullScreen = function(availableHeight){
		this.normalHeight = this.element.clientHeight;
		this.element.style.height = availableHeight + 'px';
	};

	BrightcoveVideoPlayer.prototype.exitFullScreen = function(){
		this.element.style.height = this.normalHeight + 'px';
	};

	BrightcoveVideoPlayer.prototype.features = {
		desktop: {
			captions: true,
			fullScreen: true,
			lastCaption: true,
			play: true,
			rate: false,
			timeCode: true,
			volume: false
		},
		mobile: {
			captions: true,
			fullScreen: true,
			lastCaption: true,
			play: true,
			rate: false,
			timeCode: false,
			volume: false
		}
	};

	Ayamel.mediaPlugins.video.brightcove = {
		install: function(args) {
			// Create the player
			return new BrightcoveVideoPlayer(args);
		},
		supports: function(resource) {
			return resource.content.files.some(function (file) {
				return (resource.type === "video" && supportsFile(file));
			});
		}
	};

}(Ayamel));