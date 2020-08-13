/**
 * Init page module.
 *
 * @module    views/radial
 * @requires  {@link core/event}
 * @namespace views/radial
 * @memberof  views
 */

define({
    name: 'views/radial',
    requires: [ 'core/event' ],
    def: function viewsPageRadial(req) {
        'use strict';

        /**
         * Core event module object.
         *
         * @memberof views/radial
         * @private
         * @type {Module}
         */
        var event = req;

        var svgMenu = null;   
        var menuItems = null;
        var theme = 'ice';
        var isOpen = false;
        /**
         * Handles resize event.
         *
         * @memberof views/radial
         * @private
         * @fires views.init.window.resize
         */
        

        function changeTheme(theme){
			theme = theme;
		}

        /**
         * Registers event listeners.
         *
         * @memberof views/radial
         * @private
         */
        function bindEvents() {
           event.on ({
        	   //'views.radial.changeTheme' : changeTheme
           });
           /*window.addEventListener('tizenhwkey', function(ev) {
               if (ev.keyName === 'back') {
            	   svgMenu.close();
               }
           });*/
            
        }

        /**
         * Initializes module.
         *
         * @memberof views/radial
         * @public
         *
         */
        function init() {
            // bind events to page elements
            bindEvents();
            menuItems = [
                             {
                                 id   : 'events',
                                 title: 'Events',
                                 icon: '#events'
                             },
                             {
                                 id   : 'update',
                                 title: 'Update',
                                 icon: '#update'
                             },
                             {
                                 id   : 'exercise',
                                 title: 'GymRun',
                                 icon: '#exercise'
                             },
                             /*{
                                 id   : 'altitude',
                                 title: 'Altitude',
                                 icon: '#altitude'
                             },*/
                             
                             {
                                 id   : 'more',
                                 title: 'More...',
                                 icon: '#more',
                                 items: [
									{
									    id   : 'altitude',
									    title: 'Altitude',
									    icon: '#altitude'
									},
                                     {
                                         id   : 'timer',
                                         title: 'Timer',
                                         icon: '#timer'
                                     },
                                     /*{
                                         id   : 'sleep',
                                         title: 'Sleep',
                                         icon: '#sleep'
                                     },
                                     {
                                         id   : 'shower',
                                         title: 'Take Shower',
                                         icon: '#shower'
                                     },*/
                                     {
                                         id   : 'workout',
                                         icon : '#workout',
                                         title: 'Work Out'
                                     }
                                 ]
                             },
                             {
                                 id: 'colors',
                                 title: 'Colors...',
                                 icon: '#colors',
                                 items: [
                                     
                                     {
                                         id: 'ice',
                                         icon: '#ice',
                                         title: 'Ice'
                                     },
                                     {
                                         id: 'fire',
                                         icon: '#fire',
                                         title: 'Fire'
                                     }, {
                                         id: 'hisakura',
                                         icon: '#hisakura',
                                         title: 'Hisakura'
                                     }
                                 ]
                             }
                         ];
            
            svgMenu = new RadialMenu({
                parent      : document.querySelector('#container'),
                size        : 340,
                closeOnClick: false,
                menuItems   : menuItems,
                theme       : theme,
                onClick     : function (item) {
                	//console.log("svg.menu > g[data-id="+item.id+"] > g");
                	//console.log(document.querySelector("svg.menu > g[data-id="+item.id+"] > path"));
                	document.querySelectorAll("svg.menu > g > path").forEach(function(el) {
                		
              		  el.setAttribute('class', svgMenu.getTheme());
                	});
                	svgMenu.highlightButton(item.id,'selected '+svgMenu.getTheme());//('fill', '#F9A602D0');
                	
                    console.log('You have clicked:', item.id, item.title);
                    if (item.id == 'update'){
                    	event.fire('update',true);
                    	closeMenuProperly(item);
                    	
                    }
                    else if (item.id == 'fire' || item.id == 'hisakura' || item.id == 'ice'){
                    	changeTheme(item.id);
                    	svgMenu.setTheme(item.id);
                    	tizen.preference.setValue('theme', item.id);
                    	event.fire('changeTheme',item.id);
                    	closeMenuProperly(item);
                    }
                    else if (item.id == 'events'){
                    	 
                    	/*var app = tizen.application.getCurrentApplication();*/
                    	var appControl = new tizen.ApplicationControl("com.samsung.w-calendar2.appcontrol.daily")  ;
                    	var appControlReplyCallback = {
                    		     // callee sent a reply
                    		     onsuccess: function(data) {
                    		         console.log(data);
                    		     },
                    		     // callee returned failure
                    		     onfailure: function() {
                    		         console.log('The launch application control failed');
                    		     }
                    		 };
                    	//tizen.application.getAppsInfo(onListInstalledApps);com.samsung.w-calendar2
                    	 // let's assume that application "targetApp0.main" has been installed com.samsung.w-calendar2.appcontrol.daily
                    	/*var appInfo = tizen.application.getAppInfo("com.samsung.w-calendar2.appcontrol.daily");
                    	 console.log(appInfo);
                    	 
                    	 //svgMenu.darkenButton(item.id,item.id);
                    	 */
                    	  tizen.application.launchAppControl(
                    			 appControl,
                    		     'com.samsung.w-calendar2',
                    		     function() {console.log("launch application control succeed"); },
                    		     function(e) {console.log("launch application control failed. reason: " + e.message); },
                    		     appControlReplyCallback );
                    	//tizen.application.launch("com.samsung.w-calendar2", onsuccess,onfail);
                    	  closeMenuProperly(item);     
                    }
                    else if (item.id == 'timer'){
                    	tizen.application.launch("com.samsung.timer-wc1", onsuccess,onfail);
                    	closeMenuProperly(item);
                    }
                    else if (item.id == 'altitude'){
                    	tizen.application.launch("com.samsung.alti-barometer", onsuccess,onfail);
                    	closeMenuProperly(item);	  
                    }
                    else if (item.id == 'exercise'){
                    	tizen.application.launch("GymRunWear.TizenCompanionApp", onsuccess,onfail);
                    	closeMenuProperly(item);	  
                    }
                    else if (item.id == 'workout'){
                    	tizen.application.launch("com.samsung.shealth.exercise", onsuccess,onfail);
                    	closeMenuProperly(item); 
                    }
                    
                }
            });
            if (tizen.preference.exists('theme')) {
				theme = tizen.preference.getValue('theme');
				svgMenu.setTheme(theme);
			}
        }
        function closeMenuProperly(item){
        	setTimeout(function(){
	        	svgMenu.darkenButton(item.id,item.id);
	        	closeMenu();
        	},200);
        }
        function closeMenu(){
        	isOpen = false;
    		svgMenu.close();
        }
        function onsuccess() {
        	
   	     	console.log("The application has launched successfully");
   	 	}
        function setOpen(){
        	isOpen = true;
        }
        function getOpen(){
        	return isOpen;
        } 
        function onfail(e){
        	console.error(e);
        }
        function onListInstalledApps(appsInfo) {
			var appId = null;
			console.log(appsInfo);
			for (var i = 0; i<appsInfo.length; i++ ){
				console.log(appsInfo[i].id);
			}
		}
        function getMenu (){
        	return svgMenu;
        }
        return {
            init: init,
            getMenu : getMenu,
            setOpen : setOpen,
            getOpen : getOpen,
            closeMenu : closeMenu
            
        };
    }
});
