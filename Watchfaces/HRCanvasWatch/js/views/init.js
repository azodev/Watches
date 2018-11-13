/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global define, window */

/**
 * Init page module.
 *
 * @module    views/init
 * @requires  {@link core/event}
 * @requires  {@link views/main} * 
 * @requires  {@link models/heartRate}
 * @namespace views/init
 * @memberof  views
 */

define({
    name: 'views/init',
    requires: [
        'core/event',
        'views/main'
        
    ],
    def: function viewsPageInit(req) {
        'use strict';

        /**
         * Core event module object.
         *
         * @memberof views/init
         * @private
         * @type {Module}
         */
        var event = req.core.event;

            



        

        /**
         * Handles resize event.
         *
         * @memberof views/init
         * @private
         * @fires views.init.window.resize
         */
        function onWindowResize() {
            event.fire('window.resize', { height: window.innerHeight });
        }

        /**
         * Handler onLowBattery state.
         *
         * @memberof views/init
         * @private
         * @fires views.init.window.register.menuBack
         */
        function onLowBattery() {
            /*if (document.getElementsByClassName('ui-page-active')[0].id === 'register') {
                event.fire('register.menuBack');
            }*/
            
        }

        /**
         * Registers event listeners.
         *
         * @memberof views/init
         * @private
         */
        function bindEvents() {
            event.on({'core.systeminfo.battery.low': onLowBattery});
            
            window.addEventListener('resize', onWindowResize);
            
        }

        /**
         * Initializes module.
         *
         * @memberof views/init
         * @public
         *
         */
        function init() {
            // bind events to page elements
            bindEvents();
            
        }

        return {
            init: init
        };
    }
});
