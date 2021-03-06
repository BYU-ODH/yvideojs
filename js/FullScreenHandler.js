import { CustomEvent } from "./CustomEvent"

var pseudoFullScreen = false,
	exitFullScreen,
	requestFullScreen,
	fullScreenElement,
	isFullScreen,
	getFullScreenElement,
	getAvailableHeight,
	getAvailableWidth,
	eventFullScreen;

// Setup the fullscreen functions
if (typeof document.mozCancelFullScreen === 'function') {
	exitFullScreen = function(){
		document.mozCancelFullScreen();
	};
	requestFullScreen = function(element){
		element.mozRequestFullScreen();
	};
	isFullScreen = function(){
		return document.mozFullScreenElement !== null;
	};
	getFullScreenElement = function(){
		return document.mozFullScreenElement;
	};
	getAvailableHeight = function(){
		return screen.height;
	};
	getAvailableWidth = function(){
		return screen.width;
	};
	eventFullScreen = "mozfullscreenchange";
} else if (typeof document.webkitCancelFullScreen === 'function') {
	exitFullScreen = function(){
		document.webkitCancelFullScreen();
	};
	requestFullScreen = function(element){
		element.webkitRequestFullScreen();
	};
	isFullScreen = function(){
		return document.webkitFullscreenElement !== null;
	};
	getFullScreenElement = function(){
		return document.webkitFullscreenElement;
	};
	getAvailableHeight = function(){
		return screen.height;
	};
	getAvailableWidth = function(){
		return screen.width;
	};
	eventFullScreen = "webkitfullscreenchange";
} else {
	// Pseudo fullscreen
	exitFullScreen = function(){
		var element = fullScreenElement;
		pseudoFullScreen = false;
		fullScreenElement = null;
		element.classList.remove("pseudoFullScreen");
		element.dispatchEvent(new CustomEvent("pseudofullscreenchange",{bubbles:true,cancelable:true}));
	};
	requestFullScreen = function(element){
		pseudoFullScreen = true;
		fullScreenElement = element;
		element.classList.add("pseudoFullScreen");
		element.dispatchEvent(new CustomEvent("pseudofullscreenchange",{bubbles:true,cancelable:true}));
	};
	isFullScreen = function(){
		return pseudoFullScreen;
	};
	getFullScreenElement = function(){
		return fullScreenElement;
	};
	getAvailableHeight = function(){
		return window.innerHeight;
	};
	getAvailableWidth = function(){
		return window.innerWidth;
	};
	eventFullScreen = "pseudofullscreenchange";
}

const FullScreen = Object.create({},{
	enter: { enumerable: true, value: requestFullScreen },
	exit:{ enumerable: true, value: exitFullScreen },
	fullScreenEvent: { enumerable: true, value: eventFullScreen },
	isFullScreen: { enumerable: true, get: isFullScreen },
	fullScreenElement: { enumerable: true, get: getFullScreenElement },
	availableHeight: { enumerable: true, get: getAvailableHeight },
	availableWidth: { enumerable: true, get: getAvailableWidth }
});

export default {
    register: function(ayamel) {
        Ayamel.utils.FullScreen = FullScreen;
    }
}

