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
        var defaultMenuItems = [];
        var menuItems = [];
        var appsItems = [];
        var theme = 'ice';
        var isOpen = false;
        var loaderWk;
        const APP_LIMIT = 4;
        
        var shortcuts = [];
        
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
        	   'RadialMenu.closing' : setClose,
        	   'views.settings.reloadApps' : reloadApps,
        	   'views.settings.initApps' : initApps
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
        
        function reloadApps(e){
        	
        	let mi = processSettings(e);
        	svgMenu.setMenuItems(defaultMenuItems.concat(mi));
        }
        
        
        
        function initApps(e){
        	
        	let loader = loadMenuItems().then((mi) => {
            	defaultMenuItems = mi;
            	mergeMenuItems();
            	
            	svgMenu = new RadialMenu({
                    parent      : document.querySelector('#container'),
                    size        : 340,
                    closeOnClick: false,
                    //menuItems   : menuItems,
                    theme       : theme,
                    onClick     : function (item) {
                    	//console.log("svg.menu > g[data-id="+item.id+"] > g");
                    	//console.log(document.querySelector("svg.menu > g[data-id="+item.id+"] > path"));
                    	document.querySelectorAll("svg.menu > g > path").forEach(function(el) {
                    		
                  		  el.setAttribute('class', svgMenu.getTheme());
                    	});
                    	svgMenu.highlightButton(item.id,'selected '+svgMenu.getTheme());//('fill', '#F9A602D0');
                    	
                        //console.log('You have clicked:', item.id, item.title);
                        if (item.id == 'update'){
                        	event.fire('update',true);
                        	closeMenuProperly(item);
                        	
                        }
                        else if (item.id == 'fire' || item.id == 'hisakura' || item.id == 'ice' || item.id == 'metal'){
                        	changeTheme(item.id);
                        	svgMenu.setTheme(item.id);
                        	//tizen.preference.setValue('theme', item.id);
                        	event.fire('changeTheme',item.id);
                        	closeMenuProperly(item);
                        }
                        else if (item.id == 'attraction' || item.id == 'repulsion' || item.id == 'flower' || item.id == 'lightspeed' ){
                        	event.fire('changeEffect',item.id);
                        	//tizen.preference.setValue('effect', item.id);
                        	closeMenuProperly(item);
                        }
                       /* 
                        else if (item.id == 'timer'){
                        	tizen.application.launch("com.samsung.timer-wc1", onsuccess,onfail);
                        	closeMenuProperly(item);
                        }*/
                        else if (item.appid ){
                        	tizen.application.launch(item.appid, onsuccess,onfail);
                        	closeMenuProperly(item);	  
                        }
                        /*else if (item.id == 'altitude'){
                        	tizen.application.launch("com.samsung.alti-barometer", onsuccess,onfail);
                        	closeMenuProperly(item);	  
                        }*/
                        
                        else if (item.id == 'params'){
                        	//tizen.application.launch("com.samsung.clocksetting", onsuccess,onfail);
                        	//closeMenuProperly(item);
                        	//tizen.application.getAppsInfo(onListInstalledApps, null);
                        	closeMenuProperly(item);
                        	
                        	event.fire('openSettings', true);
                        	
                        }
                        
                    } 
                });
                if (tizen.preference.exists('theme')) {
    				theme = tizen.preference.getValue('theme');
    				svgMenu.setTheme(theme);
    			}
                //svgMenu.setMenuItems(menuItems);
                let apps = processSettings(e);
                svgMenu.setMenuItems(defaultMenuItems.concat(apps));
                
            });
        	
        }
        
        function processSettings(e){
        	if (e.detail) {
        		let mi = [];
        		menuItems = defaultMenuItems;
        		let i;
        		let apps = e.detail;
        		let app_limit_crossed = false;
        		
        		appsItems = [];
        		//console.log(apps);
        		let nb_items = Object.keys(apps).length;
        		if (nb_items >= APP_LIMIT){
        			app_limit_crossed = true;
        		}
    			let secondLevel = {
    				      "id": "shortcuts",
    				      "title": "Apps...",
    				      "icon": "#applist",
    				      "items": []};
    			/*Object.keys(apps).forEach(key => {
        			appsItems.push(apps.key);
        			console.log(key);
        			if (i>2){
        				secondLevel.items.push(apps.key);
        			}
            			
    				i++;
    			});*/
    			
    			for (i=1 ; i <= nb_items ; i++){
    				if (apps['slot_'+i].title.length > 12){
    					apps['slot_'+i].title = apps['slot_'+i].title.substring(0,11)+'...';
    				}
        			
        			if (app_limit_crossed && i>1){
        				secondLevel.items.push(apps['slot_'+i]);
        			}
        			else {
        				appsItems.push(apps['slot_'+i]);
        			}
        			
        		}
        		if (nb_items >= APP_LIMIT){
        			appsItems.push(secondLevel);
        		}
        		
        		
        		//console.log(appsItems);
        		//console.log(mi);
        		
        		for (i = 0 ; i< appsItems.length ; i++){
        			mi.push(appsItems[i]);
        		}
        		//appsItems.forEach(element => menuItems.push(element));
        		//console.log(mi);
        		//svgMenu.setMenuItems(menuItems);
        		return mi;
        	} 
        }
        
        function mergeMenuItems(){
        	menuItems = defaultMenuItems;
        	//menuItems.items.push();
        }
        
        
        function init() {
            // bind events to page elements
        	
            bindEvents();
            
            
            
            
            
            
        }
        function loadMenu(){
        	
        }
        function closeMenuProperly(item){
        	setTimeout(function(){
	        	svgMenu.darkenButton(item.id,item.id);
	        	closeMenu();
        	},100);
        }
        function closeMenu(){
        	isOpen = false;
    		svgMenu.close();
        }
        function onsuccess() {
        	
   	     	//console.log("The application has launched successfully");
   	 	}
        function setOpen(){
        	isOpen = true;
        }
        function setClose(){
        	isOpen = false;
        }
        function getOpen(){
        	return isOpen;
        } 
        function onfail(e){
        	console.error(e.message);
        }
        function onListInstalledApps(applications) {
        	let appInfo;
            for (var i = 0; i < applications.length; i++) {
	        	appInfo = applications[i];
	        	
	        	if (appInfo.show && appInfo.name != ''){
	        		appsInstalled.push(appInfo);
	        		/*console.log('Application ID: ' + appInfo.id);
	        		console.log('Name: ' + appInfo.name);
	        		console.log('Icon Path: ' + appInfo.iconPath);*/
	        	}
        		
            }
            appsInstalled= multiSort(appsInstalled, {
                name: 'asc'
            });
            event.fire('openSettings', {'shortcuts':shortcuts,'apps':appsInstalled});
		}
        function getMenu (){
        	return svgMenu;
        }
        
        async function loadMenuItems(){
			return new Promise(function(resolve, reject) {
				 loaderWk = new Worker('lib/workers/jSonReaderWK.js');
				loaderWk.onmessage = function(e) {
					if (e){
						resolve( e.data.json.items);
						loaderWk.terminate();
					}
				}
				loaderWk.onerror = function (err){
					 reject(new TypeError('Menu loading failed'));
				};
				let uri = "../../data/radial.json";
				loaderWk.postMessage({
		            'url': uri
		        });
			  });
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
