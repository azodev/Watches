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
            	
            });
            
            
            
            
        }
        function closePageProperly(){
        	
        }
        function closePage(){
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
            openSettings(); 
            
		}
        function openPage(e){
        	tizen.application.getAppsInfo(onListInstalledApps, null);
        }
        function openSettings(e){
			let container = document.getElementById('container');
        	let settingsPage = document.getElementById('settings');
        	let settingsPageHeader = document.querySelector('#settings .ui-header');
        	
        	
        	setClassAndWaitForTransition(container,'off','opacity').then(function () {
        		container.setAttribute('class', 'hide');
        		settingsPage.setAttribute('class', 'off'); 
        		populateSettingsHTML();
        		setTimeout(function(){
        			setClassAndWaitForTransition(settingsPage,'on','opacity').then(function () {
        				
        				settingsOn =true;
        				settingsPageHeader.addEventListener('click', closeSettings);
        			});
        		},50);
        	});
		}
		function populateSettingsHTML(){
			let myParent = document.querySelector('#settings .ui-content');
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
				    selectList.appendChild(option);
				}
				appline.appendChild(selectList);
				appline.appendChild(label);
				
				myParent.appendChild(appline);
				//console.log(selectList.options);
				selectList.addEventListener('change',function (e){
					let optionId = selectList.options[selectList.selectedIndex].getAttribute('app');
					let optionName = selectList.options[selectList.selectedIndex].innerHTML;
					let iconPath = selectList.options[selectList.selectedIndex].getAttribute('icon');
					label.innerHTML = optionName;
				});
			}
			
			
		}
		function closeSettings(){
			//e.preventDefault(); 
			
			if (settingsOn /*|| !containerOn*/){ 
				console.log('Close settings');
				let container = document.getElementById('container');
	        	let settingsPage = document.getElementById('settings');
	        	let settingsPageHeader = document.querySelector('#settings .ui-header');
				setClassAndWaitForTransition(settingsPage,'off','opacity').then(function () {
					console.log('settings :  off');
					
					container.setAttribute('class', 'off'); 
					settingsPage.setAttribute('class', 'hide');
					
					settingsOn =false;
					setTimeout(function(){
						setClassAndWaitForTransition(container,'on','opacity').then(function () {
							console.log('container :  on');
	    					container.setAttribute('class', 'on'); 

	    				});
					},50);
					settingsPageHeader.removeEventListener('click',closeSettings);
					
				});
			}
			
		}
		async function loadDefaultSettings(){
			return new Promise(function(resolve, reject) {
				 loaderWk = new Worker('lib/workers/jSonReaderWK.js');
				loaderWk.onmessage = function(e) {
					if (e){
						resolve( e.data.json.items);
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
