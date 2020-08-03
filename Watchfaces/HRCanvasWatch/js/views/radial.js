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
        console.log(req);
        var event = req;

        var svgMenu = null;   
        var menuItems = null;
        /**
         * Handles resize event.
         *
         * @memberof views/radial
         * @private
         * @fires views.init.window.resize
         */
        

        

        /**
         * Registers event listeners.
         *
         * @memberof views/radial
         * @private
         */
        function bindEvents() {
           
            
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
                                 id   : 'walk',
                                 title: 'Walk',
                                 icon: '#walk'
                             },
                             {
                                 id   : 'run',
                                 title: 'Run',
                                 icon: '#run'
                             },
                             {
                                 id   : 'drive',
                                 title: 'Drive',
                                 icon: '#drive'
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
                                 id: 'weapon',
                                 title: 'Weapon...',
                                 icon: '#weapon',
                                 items: [
                                     {
                                         id: 'firearm',
                                         icon: '#firearm',
                                         title: 'Firearm...',
                                         items: [
                                             {
                                                 id: 'glock',
                                                 title: 'Glock 22'
                                             },
                                             {
                                                 id: 'beretta',
                                                 title: 'Beretta M9'
                                             },
                                             {
                                                 id: 'tt',
                                                 title: 'TT'
                                             },
                                             {
                                                 id: 'm16',
                                                 title: 'M16 A2'
                                             },
                                             {
                                                 id: 'ak47',
                                                 title: 'AK 47'
                                             }
                                         ]
                                     },
                                     {
                                         id: 'knife',
                                         icon: '#knife',
                                         title: 'Knife'
                                     },
                                     {
                                         id: 'machete',
                                         icon: '#machete',
                                         title: 'Machete'
                                     }, {
                                         id: 'grenade',
                                         icon: '#grenade',
                                         title: 'Grenade'
                                     }
                                 ]
                             }
                         ];
            svgMenu = new RadialMenu({
                parent      : document.body,
                size        : 360,
                closeOnClick: true,
                menuItems   : menuItems,
                onClick     : function (item) {
                    console.log('You have clicked:', item.id, item.title);
                    if (item.id == 'run'){
                    	event.fire('run',true);
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
