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
                                 id   : 'altitude',
                                 title: 'Altitude',
                                 icon: '#altitude'
                             },
                             
                             {
                                 id   : 'more',
                                 title: 'More...',
                                 icon: '#more',
                                 items: [
                                     {
                                         id   : 'eat',
                                         title: 'Eat',
                                         icon: '#eat'
                                     },
                                     {
                                         id   : 'sleep',
                                         title: 'Sleep',
                                         icon: '#sleep'
                                     },
                                     {
                                         id   : 'shower',
                                         title: 'Take Shower',
                                         icon: '#shower'
                                     },
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
                size        : 360,
                closeOnClick: false,
                menuItems   : menuItems,
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
                    	setTimeout(function(){
                    		svgMenu.darkenButton(item.id,item.id);
                    		svgMenu.close();
                    		
                    		}, 200);
                    }
                    else if (item.id == 'fire' || item.id == 'hisakura' || item.id == 'ice'){
                    	changeTheme(item.id);
                    	svgMenu.setTheme(item.id);
                    	event.fire('changeTheme',item.id);
                    	setTimeout(function(){
                    		svgMenu.darkenButton(item.id,item.id);
                    		svgMenu.close();
                    		
                    		}, 200);
                    }
                    
                }
            });
        }
        function getMenu (){
        	return svgMenu;
        }
        return {
            init: init,
            getMenu : getMenu
        };
    }
});
