import { SidebarTab } from './SidebarTab'

function renderEmptySidebar(sidebar){
	var result = document.createElement('div');
	result.className = 'sidebar';
	if(sidebar.side === 'right'){
		result.classList.add('rightBar');
	}
	if(sidebar.visible){
		result.classList.add('visible');
	}
	return result;
}

function renderEmptyTabList(){
	var result = document.createElement('ul');
	result.className = 'sidebarHeads';
	return result;
}

function renderEmptyHead(){
	var result = document.createElement('nav');
	result.className = 'sidebarNav';
	return result;
}

function renderEmptyBody(){
	var result = document.createElement('div');
	result.className = 'tabContent';
	return result;
}

function renderTabs(sidebar, headList, sidebarBody){
	sidebar.tabs.forEach(function(tab){
		headList.appendChild(tab.head);
		sidebarBody.appendChild(tab.body);
		if(sidebar.selected === tab){
			sidebar._selectTab(tab);
		}
	});
}

function render(sidebar){
	var result = renderEmptySidebar(sidebar),
		head = renderEmptyHead(),
		headList = renderEmptyTabList(),
		body = renderEmptyBody();
	result.appendChild(head);
	head.appendChild(headList);
	result.appendChild(body);
	renderTabs(sidebar, headList, body);
	sidebar.headList = headList;
	sidebar.resize();
	return result;
}

function deselectAll(sidebar){
	sidebar.tabs.forEach(function(t){ t._deselect(); });
}

function showSidebar(sidebar){
	if(sidebar.visible || !sidebar.selectedTab){ return; }
	sidebar.visible = true;
	sidebar.element.classList.add('visible');
	sidebar.player.resetSize();
}

class Sidebar {
	constructor(args) {
		var tabs, that = this;
		tabs = args.tabs.map(function (tdata) {
			return new SidebarTab({
				title: tdata.title,
				content: tdata.content,
				player: args.player,
				sidebar: that
			});
		});
		this.player = args.player;
		this.side = args.side;
		this.tabs = tabs;
		this.selectedTab = tabs.filter(function (_, i) {
			return args.tabs[i].selected;
		})[0] || null;
		this.visible = !!this.selectedTab;
		this.baseVisible = this.visible;
		this.baseTab = this.selectedTab;
		this.headList = null;
		this.element = render(this);
		args.holder.appendChild(this.element);
	}
}

Sidebar.prototype = {
	show: function(tab){
		// if a tab is not provided, try to re-open the last
		// selected tab, or fall back to the top of the list.
		if(!(tab instanceof SidebarTab)){
			tab = this.selectedTab || this.tabs[0];
		}
		if(tab){ tab.select(); }
	},
	hide: function(){
		if(!this.visible){ return; }
		this.visible = false;
		this.element.classList.remove('visible');
		deselectAll(this);
		this.player.resetSize();
	},
	resize: function(){
		var scale = this.player.height / this.headList.clientWidth;
	},
	restore: function(){
		if(this.baseVisible){
			this.show(this.baseTab);
		}else{
			this.hide();
		}
	},
	_selectTab: function(tab){
		var oldTab = this.selectedTab;
		if(oldTab !== tab){
			if(oldTab){ oldTab._deselect(); }
			this.selectedTab = tab;
		}
		showSidebar(this);
	},
	get offsetWidth(){
		return this.visible?this.element.offsetWidth:0;
	},
	get offsetHeight(){
		return this.visible?this.element.offsetHeight:0;
	}
};

export { Sidebar }
