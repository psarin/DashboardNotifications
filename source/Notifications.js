enyo.kind({
	name:"opflo.BannerMessageArea",
	kind:"Slideable",
	min:0,
	max:320,
	value:320,
	unit:"px",
	classes:"enyo-unselectable notifications-layer",
	style:"width:320px; position:absolute; right:0px; padding-right:10px; z-index:10; background-color:lightyellow;",
	timeOut:2000,
	handlers:{
		onAnimateFinish: "animateFinished"
	},
	animateFinished: function(){
		if (this.isAtMax()){
			this.hide();
		}
		else{
			this.show();
		}
	},
	
	components:[
	{
		classes:"notifications-text-container",
		name:"bannerMessage",
		allowHtml:true,
		style:"color:gray; font-size:12px; padding-left:20px; font-weight:bold; overflow:hidden;"
	}],
	create:function(){
		this.inherited(arguments);
	},
	scrollMessage:function(){
		this.animateToMin();
		setTimeout(enyo.bind(this, "resetMessage"), this.timeOut);	
		
		/*
		var newLeft = this.$.bannerMessage.getBounds().left - this.getBounds().left;
		var subtractor = 10;
		if (this.direction==-1) 
			subtractor = 1;
		this.$.bannerMessage.applyStyle("left", (newLeft-subtractor) + "px");
		//console.log(newLeft, subtractor, this.direction);
		if (newLeft<=25)
			this.direction = -1;
			
		if (this.direction==-1&&(this.$.bannerMessage.getBounds().left+this.$.bannerMessage.getBounds().width)>=(this.getBounds().left+this.getBounds().width)){
			setTimeout(enyo.bind(this, "resetMessage"), this.timeOut);			
			return;
		}
		if (newLeft>5||(this.direction==-1&&newLeft<300)){
			this.bannerTimeout = setTimeout(enyo.bind(this, "scrollMessage"), 20);
		};
		*/
	},
	setMessage: function(message){
		this.$.bannerMessage.setContent(message);
	},
	resetMessage: function(){
		if (this.bannerTimeout){
			clearTimeout(this.bannerTimeout);
		}
		this.animateToMax();
		//this.setMessage("");
		//this.$.bannerMessage.applyStyle("left", "100%");
		//this.direction=1;
	},
	
	showNewNotification: function(message, timeOut){
		this.resetMessage();
		this.setMessage(message);
		this.scrollMessage();
		if (timeOut){
			this.timeOut=timeOut;
		}
	}
	
});

enyo.kind({
	name: "opflo.SwipeNotification",
	kind: enyo.Control,
	classes: "notifications notification-module",

	published: {
		/** Array of layer objects specifying contents of dashboard.*/
		layers: null,
		/** Optional path to small icon to display when this dashboard window is hidden. */
		smallIcon:"",
		icon:"",
		numNotifications: 0
	},
	events: {
		/** Fired when user taps the icon portion of a dashboard. Event includes the top layer object.*/
		onIconTap: "",
		/** Fired when user taps the message portion of a dashboard. Event includes the top layer object.*/
		onMessageTap: "",
		/** Fired when user taps anywhere in a dashboard. Event includes the top layer object.*/
		onTap: "",
		/** Fired when user swipes away the dashboard (or the last layer).  NOT sent when it is programmatically closed by emptying the layer stack.*/
		onUserClose: "",
		/** Fired when user swipes a dashboard layer away, unless it's the last one (that's onUserClose instead). Event includes the top layer object.*/
		onLayerSwipe: "",
		/** Fired when the dashboard window is displayed/maximized. */
		onDashboardActivated: "",
		/** Fired when user dashboard window is concealed/minimized. */
		onDashboardDeactivated: "",
	},
/*	handlers:{
		ondragstart: "dragstart"
	},
	
	dragstart:function(inSender, inEvent){
		this.inherited(arguments);
		if (inEvent.vertical&&inEvent.yDirection>0){
			//console.log(inSender, inEvent);
			this.applyStyle("height","20px");		
			
		}
		else if (inEvent.vertical&&inEvent.yDirection<0){
			this.show();
			this.$.topSwipeable.$.client.applyStyle("height", null);
			this.applyStyle("height",null);		
		}
	},
*/
	components: [
		{
			kind: "Signals", 
			onWindowActivated:"dbActivated", 
			onWindowDeactivated:"dbDeactivated",
			onSendDashboardMessage:"processNewMessage"
		},
		{
			name: 'topSwipeable', 
			kind:"opflo.SwipeableNotificationItem",
			contentClasses: "notifications-layer enyo-unselectable", 
			allowLeft:false, 					
			onSwipe:"topLayerSwiped",
			//ondrag: "clientDragStart",
			//ondragstart: "clientDragStart",
			style:"padding:0px;",
			handlers:{
				onAnimateFinish:"animateFinished"
			},
			
			animateFinished:function(){
				this.doSwipe();
			},
	
			components: [ 
			{ 
				layoutKind:"FittableColumnsLayout",
				style:"width:95%; height:100%;",
				
				components:[
				{
					classes:'notification-icon-container', 
					ontap: "iconTapHandler", 
					components: [
						{name:'icon', kind:"Image"},
						{name: 'badge', classes:'notifications-count', components:[
							{name: 'count', nodeTag:'span', classes:'notifications-count-label'}]}
					]
				},
				{
					fit:true,
					kind:"FittableColumns",
					style:"width:100%; ",
					components:[
					{name: 'layer0', kind: "opflo.SwipeNotificationLayer", classes: 'layer-0', draggable:false, ontap:"messageTap", onSwipe:"layerSwiped"},
					{name: 'layer1', kind: "opflo.SwipeNotificationLayer", classes: 'layer-1', draggable:false, ontap:"messageTap", onSwipe:"layerSwiped"},
					{name: 'layer2', kind: "opflo.SwipeNotificationLayer", classes: 'layer-2', leftOffset:25, ontap:"messageTap", onSwipe:"layerSwiped"},
				
					]
				},
				]
			},
				
		]},

	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.layers = [];
		// Messages for us should have this id, since we cannot otherwise distinguish between messages from different closed dashboard windows.
		this.dashboardId = Math.random();
		// Configure listener for dashboard events.
		//this.handleMessageHitched = enyo.bind(this, "handleMessage");
		//swindow.addEventListener('message', this.handleMessageHitched);

		// Configure layer clipping properly.
		// This lets upper layers clip out lower ones, which is needed since they're transparent.
		//this.$.layer1.setClipControl(this.$.layer0);
		//this.$.layer2.setClipControl(this.$.layer1);

		// This is how our owner tells us about layer updates:
		//enyo.windowParamsChangeHandler = enyo.bind(this, "handleNewLayers");
	},
	
	processNewMessage: function(inSender, inEvent){
		//console.log("new message received", inSender, inEvent);
		if (inEvent&&inEvent.destination==this.name){
			this.push(inEvent.message);
		};
	},
	
	updateDashboard: function() {
		var len = this.getNumNotifications();

		if (!len){
			this.hide();
			this.doUserClose();
		}
		else{
			this.show();
	
			// Configure last 3 layers in our list:
			var layers = this.layers.slice(-3);
	
			this.$.layer1.setDraggable(true);
			this.$.layer0.setDraggable(true);
			
			this.$.layer2.setLayer(layers[2]);
			if (len > 2){
				this.$.layer2.show();
				this.$.layer1.setDraggable(false);
				this.$.layer0.setDraggable(false);
	
				setTimeout(enyo.bind(this, "animateToMax", this.$.layer2), 5);			
			}
			else{
				this.$.layer2.hide();
			}
				
			if (len > 1){
				this.$.layer1.show();
				setTimeout(enyo.bind(this, "animateToMax", this.$.layer1), 5);			
			}
			else{
				this.$.layer1.hide();
			}
			this.$.layer1.setLayer(layers[1]);
	
			if (len > 0){
				this.resetTopSwipeable();
				this.$.layer0.show();
				if (len==1){
					this.$.layer0.$.layerContainer.applyStyle("background", "none");
				}
				else{
					this.$.layer0.$.layerContainer.applyStyle("background", null);
				}
				
				setTimeout(enyo.bind(this, "animateToMax", this.$.layer0), 10);			
			}
			else{
				this.$.layer0.hide();
			}
			this.$.layer0.setLayer(layers[0]);
	
			// Set icon to match top layer:
			if (len)
				this.setIcon(layers[layers.length-1].icon);

			if (len > 1) {
				this.$.count.setContent(len);
				this.$.badge.show();
			} else {
				this.$.badge.hide();
			}
		}
	},

	topLayerSwiped: function() {
		this.setLayers ([]);
		//this.updateDashboard();
		//this.doLayerSwipe([layer]);
		return true;
	},

	layerSwiped: function() {
		var layer = this.pop();
		this.doLayerSwipe([layer]);
		return true;
	},

	messageTap:function(inSender, inEvent){
		inEvent.layer = inSender;
		this.doMessageTap(inEvent);
	},
	
	animateToMax:function(obj){
		//obj.$.client.animateToMin();
		obj.$.client.setValue(0);
	},

	resetTopSwipeable: function(){
		this.$.topSwipeable.$.client.setValue(0);
	},
	iconChanged: function(path) {
		if(!path) {
			return;
		}
		this.$.icon.setSrc(path);
	},

	//* @public
	/** Add a notification layer to the top of the stack. */
	push: function(layer) {
		if(layer) {
			if (typeof(layer)=="object"&&layer.length){
				this.layers = this.layers.concat(layer);
			}
			else {
				this.layers.push(layer);
			}
			this.layersChanged(this.layers);
		}
	},
	/** Remove the topmost notification layer from the stack. */
	pop: function() {
		var layer = this.layers.pop();
		this.layersChanged(this.layers);
		return layer;
	},
	/** Set current stack of notification layers to a copy of the given array. */
	setLayers: function(layers) {
		this.layersChanged(layers.slice(0));
	},	
	layersChanged: function(layers){
		this.indicateNewContent(layers && layers.length && layers.length >= this.layers.length);
		this.layers = layers || [];
		this.setNumNotifications(this.layers.length);
		this.updateDashboard();
	},
	numNotificationsChanged: function(oldValue){
		//console.log("changed", this.numNotifications, oldValue);
		var inEvent = {};
		inEvent.originator = this;
		inEvent.layers = this.layers;
		if (this.numNotifications==0){
			enyo.Signals.send("onNumNotificationsChanged", inEvent);
		}
		else if (this.numNotifications!=oldValue){
			enyo.Signals.send("onNumNotificationsChanged", inEvent);
		}
	},
	indicateNewContent: function(layersChanged){
		//TODO: Nothing here yet.		
	},
	destroy: function() {
		// Close window if there is one.
		this.layers.length = 0;
		this.updateDashboard();
		this.inherited(arguments);
	},

});




/** @private Text-label layer within dashboard window.*/
enyo.kind({
	name: "opflo.SwipeNotificationLayer",
	kind:"opflo.SwipeableNotificationItem",
	contentClasses: "notifications-layer enyo-unselectable", //palm-dashboard-text-container",
	style:"width:100%",
	preventDragPropagation:true,
	published: {
		layer: null,
		draggable:true,
	},
	clientComponents: [
		{
			name:"layerContainer",
			kind:"FittableRows",
			classes:"notifications-text-container",
			style:"width:100% ",
			components:[
			]
		}
	],	
	handlers:{
		onAnimateFinish:"animateFinish"
	},
	initComponents: function(){
		this.inherited(arguments);
		this.$.client.createComponents(this.clientComponents, {owner:this});
		this.setDraggable(this.draggable);
	},
	setDraggable: function(newValue){
		this.$.client.setDraggable(newValue);
	},
	create: function() {
		this.inherited(arguments);
	},
	animateFinish: function(inSender, inEvent){
		//console.log(this.swiped, this.$.client.getValue(),this.$.client.calcMin());
		if (this.$.client.isAtMax()){
			//console.log('stop', inSender, inEvent, inEvent.originator.dragging);
			this.doSwipe();
		}
		return true;
	},
	

	layerChanged: function() {
		this.$.layerContainer.destroyComponents();
		if (this.layer&&!this.layer.kind) {
			//console.log(this.layer);
			this.$.layerContainer.createComponent({name:"defaultNotification", kind:"opflo.DefaultNotification"});

			//console.log(this.$.layerContainer);
			this.$.layerContainer.$.defaultNotification.setTitle(this.layer.title);
			this.$.layerContainer.$.defaultNotification.setText(this.layer.text);
			//this.$.layerContainer.render();
		}
		else if (this.layer&&this.layer.kind){
			//console.log(this.layer);
			this.$.layerContainer.createComponent({kind:"Control", components:[this.layer]});
		};
		this.$.layerContainer.render();
	}
});



enyo.kind({
	name: "opflo.DefaultNotification",
	kind:"Control",
	classes:"notifications",
	published: {
		title: null,
		text: null,
	},
	components: [
		{name:'title', classes:"notifications-title", allowHtml:true,},
		{name:'text', classes:"notifications-text", allowHtml:true, style:"margin-top:3px;", fit:true}
	],	
	create: function() {
		this.inherited(arguments);
	},

	titleChanged: function() {
		this.$.title.destroyComponents();
		if (typeof(this.title)!="object"){
			this.$.title.setContent(this.title);
		}
		else if (typeof(this.title)=="object"){
			this.$.title.createComponent(this.title);
		}
		this.$.title.render();
	},
	
	textChanged: function(){
		this.$.text.destroyComponents();
		if (typeof(this.text)!="object"){
			this.$.text.setContent(this.text);
		}
		else if (typeof(this.text)=="object"){
			this.$.text.createComponent(this.text);
		}
		this.$.text.render();
	}
});


enyo.kind({
	name:"opflo.SwipeNotificationIcons", 
	kind:"Control",
	components:[
	{
		kind:"Signals",
		onNumNotificationsChanged: "renderNotificationIcons"
	},
	{
		name:"client",
		//style:"float:right;"
	}
	],
	create: function(){
		this.inherited(arguments);
	},
	renderNotificationIcons: function(inSender, inEvent){
		//console.log("num notifications changes", inSender, inEvent);
		if (inEvent.layers.length!=0){
			if (this.$[inEvent.originator.name]){
				this.$[inEvent.originator.name].show();
			}
			else{
				this.$.client.createComponent({
						name: inEvent.originator.name,
						kind:"onyx.Icon", 
						src:"assets/favicon.ico", 
						style:"width:20px;",
				}, {owner:this});
			}
		}
		else{
			if (this.$[inEvent.originator.name]){
				this.$[inEvent.originator.name].hide();
			}
			
		}
		//this.applyStyle("width", (inEvent.layers.length+1)*25 +"px");
		//console.log("blah", this.owner, this.parent);
		this.render();
	}
});

