/**
 * Init page module.
 *
 * @module    views/settings
 * @requires  {@link core/event}
 * @namespace views/settings
 * @memberof  views
 */

define({
    name: 'views/settings',
    requires: [ 'core/event' ],
    def: function viewsPageRadial(e) {
        'use strict';

        /**
         * Core event module object.
         *
         * @memberof views/radial
         * @private
         * @type {Module}
         */
        var event = e;

       
        var isOpen = false;
        
        var appsInstalled = [];
        var shortcuts = [];
        var default_settings = [];
        var current_settings = [];
        var settingsOn = false;  
        var loaderWk;

       

        /**
         * Registers event listeners.
         *
         * @memberof views/settings
         * @private
         */
        function bindEvents() {
        	event.on({
				
				'views.radial.openSettings' : openPage,
				
			});
           
            
        }

        /**
         * Initializes module.
         *
         * @memberof views/radial
         * @public
         *
         */
        function parseMenuItems(mi){
        	
        }
        
        
        function init() {
            // bind events to page elements
        	
            bindEvents();
            
            let loader = loadDefaultSettings().then((settings) => {
            	default_settings = settings;
            	if (tizen.preference.exists('settings.particules')) {
            		
            		loadSettings();
            		
    			}
            	else {
            		current_settings = default_settings;
            		saveSettings();
            	}
            	
            	event.fire('initApps',current_settings.apps);
            });
            
            
            
            
        }
        function closePageProperly(){
        	
        }
        function closePage(){
        	isOpen = false;
    		
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
        	let appInfo = null;
        	appsInstalled = [];
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
            openSettings(); 
            
		}
        function openPage(e){
        	let container = document.getElementById('container');
        	let splash = document.getElementById('splash-page');
        	setClassAndWaitForTransition(container,'off','opacity').then(function () {
        		splash.setAttribute('class', 'off');
        		setTimeout(function(){
	        		setClassAndWaitForTransition(splash,'on','opacity').then(function () {
	        			tizen.application.getAppsInfo(onListInstalledApps, null);
	        		});
        		},100);
        		
        		//.setAttribute('class', 'on');
        		
        	});
        	
        }
        function openSettings(e){
			let container = document.getElementById('container');
        	let settingsPage = document.getElementById('settings');
        	let splash = document.getElementById('splash-page');
        	let settingsPageHeader = document.querySelector('#settings .ui-header');
        	loadSettings();
        	
        	//setClassAndWaitForTransition(container,'off','opacity').then(function () {
        		splash.setAttribute('class', 'hide');
        		container.setAttribute('class', 'hide');
        		settingsPage.setAttribute('class', 'off'); 
        		populateSettingsHTML();
        		setTimeout(function(){
        			setClassAndWaitForTransition(settingsPage,'on','opacity').then(function () {
        				
        				settingsOn =true;
        				settingsPageHeader.addEventListener('click', closeSettings);
        			});
        		},50);
        	//});
		}
        function loadSettings(){
        	current_settings = JSON.parse(tizen.preference.getValue('settings.particules'));
        }
        function saveSettings(){
        	tizen.preference.setValue('settings.particules',JSON.stringify(current_settings));
        } 
		function populateSettingsHTML(){
			let settingsPage = document.querySelector('#settings');
			let myParent = document.createElement("div"); 
			myParent.className = 'ui-content';
				//document.querySelector('#settings .ui-content');
			//console.log(current_settings);
			//let option, appline, selectList, label, optionId, optionName, iconPath;
			myParent.innerHTML = '';
			for (let i=1;i<=8;i++){
				
				
				let appline = document.createElement("div");
				let selectList = document.createElement("select");
				//selectList.setAttribute('data-native-menu','false');
				//selectList.setAttribute('data-hide-placeholder-menu-items','false');
				let label = document.createElement("span");
				
				appline.className = 'app-line';
				selectList.id = 'app_select_'+i;
				selectList.className = 'app-selector';
				//selectList.setAttribute('id', 'app'+i);
				selectList.setAttribute('name', 'app'+i);
				
				
				
				
				label.id = 'app-label-'+i;
				label.className = 'app-label';
				label.innerHTML = 'Click Button';
				
				let option = document.createElement("option");
				option.value = '';
			    option.text = '';
			    option.style.setProperty('display','none');
			    selectList.appendChild(option);
				//console.log(appsInstalled[0].name);
				//Create and append the options
				for (let j = 0; j < appsInstalled.length; j++) {
					let option = document.createElement("option");
				    option.value = appsInstalled[j].id;
				    option.setAttribute('app', appsInstalled[j].id);
				    option.text = appsInstalled[j].name;
				    option.setAttribute('icon',appsInstalled[j].iconPath);
				    if (current_settings.apps && current_settings.apps['slot_'+i] && current_settings.apps['slot_'+i].appid == appsInstalled[j].id ){
				    	option.setAttribute('selected', "SELECTED");
				    }
				    selectList.appendChild(option);
				}
				appline.appendChild(selectList);
				
				if (current_settings.apps && current_settings.apps['slot_'+i]){
					label.innerHTML = current_settings.apps['slot_'+i].title;
				}
				
				
				appline.appendChild(label);
				
				myParent.appendChild(appline);
				//console.log(selectList.options);
				selectList.addEventListener('change',function (e){
					let optionId = selectList.options[selectList.selectedIndex].getAttribute('app');
					let optionName = selectList.options[selectList.selectedIndex].innerHTML;
					let iconPath = selectList.options[selectList.selectedIndex].getAttribute('icon');
					label.innerHTML = optionName;
					
					
					let appArray = {};
					appArray.id = 'app'+i;
					appArray.title = optionName;
					appArray.appid = optionId;
					appArray.icon = '#app_svg_'+i;
					appArray.iconPath = iconPath;
					
					current_settings.apps['slot_'+i] = appArray;
					
					event.fire('reloadApps',current_settings.apps);
					saveSettings();
					
				});
				if (i==1 && Object.keys(current_settings.apps).length >= 4){
					let divider = document.createElement("div");
					divider.className = 'divider';
					myParent.appendChild(divider);
				}
			}
			settingsPage.appendChild(myParent);
			
		}
		
		function closeSettings(){
			//e.preventDefault(); 
			
			if (settingsOn /*|| !containerOn*/){ 
				//console.log('Close settings');
				let container = document.getElementById('container');
	        	let settingsPage = document.getElementById('settings');
	        	let settingsPageHeader = document.querySelector('#settings .ui-header');
				setClassAndWaitForTransition(settingsPage,'off','opacity').then(function () {
					//console.log('settings :  off');
					
					container.setAttribute('class', 'off'); 
					settingsPage.setAttribute('class', 'hide');
					
					settingsOn =false;
					setTimeout(function(){
						setClassAndWaitForTransition(container,'on','opacity').then(function () {
							//console.log('container :  on');
	    					container.setAttribute('class', 'on'); 

	    				});
					},50);
					settingsPageHeader.removeEventListener('click',closeSettings);
					settingsPage.removeChild(document.querySelector('#settings .ui-content'));
				});
			}
			
		}
		async function loadDefaultSettings(){
			return new Promise(function(resolve, reject) {
				 loaderWk = new Worker('lib/workers/jSonReaderWK.js');
				loaderWk.onmessage = function(e) {
					if (e){
						resolve( e.data.json);
						loaderWk.terminate();
					}
				}
				loaderWk.onerror = function (err){
					 reject(new TypeError('Menu loading failed'));
				};
				let uri = "../../data/default_settings.json";
				loaderWk.postMessage({
		            'url': uri
		        });
			  });
		}
        
        
        
        return {
            init: init,
            
            setOpen : setOpen,
            getOpen : getOpen,
            closePage : closePage
            
        };
    }
});
