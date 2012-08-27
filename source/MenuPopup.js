/** MENU LIST POP UP 
*/
enyo.kind({
	name: "MenuPopup",
	kind: "onyx.MenuDecorator", 
	defaultClientKind:"onyx.MenuItem",
	published:{
		menuButton:{content:"Menu"},
		showOnTop:true,
	},
	
	clientControls: [
		{		
			name: "menuButton",
			classes: "menupopup-menuButton",
			layoutKind:"FittableColumnsLayout",
			style:"padding:5px;",
			components:[]
		},
		{
			name: "menu",
			kind:"onyx.Menu", 
			classes: "onyx enyo-unselectable menupopup-menu", 
			style: "min-width: 320px; margin-top:-5px; padding:0px;",
			floating:true, 
			showOnTop:true,
			activable:true,
			//defaultKind:"onyx.MenuItem",
			onRequestShowMenu: "requestMenuShow",
			components:[{
				name:"client",
				kind: "enyo.Scroller", defaultKind: "onyx.MenuItem", vertical: "auto", classes: "enyo-unselectable", 
					maxHeight: "300px", strategyKind: "TouchScrollStrategy", 
			}
			],
			requestMenuShow: function(inSender, inEvent) {
				if (this.activable){
					if (this.floating) {
						var n = inEvent.activator.hasNode();
						if (n) {
							var r = this.activatorOffset = this.getPageOffset(n);
							this.applyPosition({top: r.top + (this.showOnTop ? 0 : r.height+5), left: r.left + (this.showOnTop ? r.width : 0) , width: r.width});
						}
					}
					this.show();
				}
				return true;
			},

		}
	],
	
	/** create calls the constructor inherited which give us access to the calling 
		function's scope, and sets up the change handlers for the published properties */	
	create: function(){
		this.inherited(arguments);
		this.$.menu.showOnTop = this.showOnTop;
	},

	initComponents: function() {
		this.createChrome(this.clientControls);
		this.setMenuButton(this.menuButton);
		this.$.menuButton.addClass("userDiv");
		this.inherited(arguments);
	},

	addControl: function(inControl) {
		this.defaultKind=this.defaultClientKind;
		this.inherited(arguments);
		return true;
	},
	
	setMenuButton: function(newLabelComponent){
		this.$.menuButton.destroyComponents();
		this.$.menuButton.createComponent(newLabelComponent);
		this.$.menuButton.render();
	},
});


