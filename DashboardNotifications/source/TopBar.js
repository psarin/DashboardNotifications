enyo.kind({
	name:"opflo.TopBar",
	kind:"FittableColumns",
	style:"height:25px; padding:0px; background-color:gray; width:100%; border:1px solid green;",
	clientControls:[
	{
		kind: "Signals", 
		onSendDashboardMessage:"processNewMessage"
	},
	{
		name:"client"
	},
	{
		fit:true
	},
	{
		name:"bannerArea",
		kind:"opflo.BannerMessageArea",
	},
	{
		name:"notificationArea",
		kind:"MenuPopup",
		menuButton:
		{
			kind:"opflo.SwipeNotificationIcons",
		},
		showOnTop:false,
		components:[
		/*
		{
			name:"swipeNotificationFB",
			kind:"SwipeNotification",
			onMessageTap:"messageTap",
			onIconTap: "",
			//onLayerSwipe: "test",
			icon:"../lib/addon/Dashboard/images/notification-alert.png",
			smallIcon:"../assets/favicon.ico"
		}*/
		]
	}],
	create: function(){
		this.inherited(arguments);
	},

	initComponents: function() {
		this.createComponents(this.clientControls);
		if (this.notificationIconComponents){
			this.$.notificationArea.createComponents(this.notificationIconComponents, {owner:this});
		}
		this.inherited(arguments);
	},

	processNewMessage: function(inSender, inEvent){
		if (inEvent&&inEvent.message){
			if (inEvent.destination&&!this.$[inEvent.destination]){
				this.$.notificationArea.createClientComponents([{name:inEvent.destination, 
										kind:"opflo.SwipeNotification",
										onMessageTap:"messageTap",
										smallIcon:"../assets/favicon.ico"}], {owner:this});
				this.$[inEvent.destination].render();
				this.$[inEvent.destination].setLayers(inEvent.message);
			}
			
			if (!inEvent.silent&&typeof(inEvent.message)=="object"&&inEvent.message.length){
				var startFrom = Math.min(inEvent.message.length-1, 10);
				for (var i=startFrom; i>=0; i--){
					var messageToProcess = inEvent.message[i+(inEvent.message.length-startFrom-1)];
					var message = (messageToProcess.title?(messageToProcess.title + ":  "):"") + (messageToProcess.text?messageToProcess.text+"":"");
					setTimeout(enyo.bind("this", function(obj, message){obj.showNewNotification(message)}, this.$.bannerArea, message), (startFrom-i)*3000);
				}
			}
			else if (!inEvent.silent){
				var message = inEvent.title?(inEvent.title + ":"):"" + inEvent.text?(inEvent.text):"";
				this.$.bannerArea.showNewNotification(message);
			}
		};
	},

});
