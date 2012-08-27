// A swipeable item that animates the item out (or back into place).
// Separate for now, so we can limit changes to dashboards only, until they're proven robust.
// May not play nicely with delete confirmation mode.
enyo.kind({
	name: "SwipeableNotificationItem",
	kind: "onyx.SwipeableItem",
	style:"height:100%; width:100%;",
	events: {
		onSwipe: ""
	},
	components: [
		{name: "client", kind: "Slideable", min: 0, max:100, unit: "%", overMoving:false, ondragstart: "clientDragStart"},
		{name: "confirm"}
	],
	create:function(){
		this.inherited(arguments);
	},
});

