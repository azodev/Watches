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

/* global define, window, history, document */

/**
 * Init page module.
 *
 * @module views/init
 * @requires {@link core/event}
 * @requires {@link core/systeminfo}
 * @requires {@link core/application}
 * @requires {@link views/main}
 * @requires {@link models/heartRate}
 * @namespace views/init
 * @memberof views
 */

define({
    name: 'views/init',
    requires: [
        'core/event',
        'core/systeminfo',
        'core/application',
        'views/main',
        'models/heartRate'
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
        var event = req.core.event,

            /**
             * Core application module object.
             *
             * @memberof views/init
             * @private
             * @type {Module}
             */
            app = req.core.application,

            /**
             * Core systeminfo module object.
             *
             * @memberof views/init
             * @private
             * @type {Module}
             */
            sysInfo = req.core.systeminfo,

            /**
             * Model heartRate module object.
             *
             * @memberof views/init
             * @private
             * @type {Module}
             */
            heartRate = req.models.heartRate;


        /**
         * Exits application.
         *
         * @memberof views/init
         * @private
         */
        function exit() {
            app.exit();
        }

        /**
         * Handles tizenhwkey event.
         *
         * @memberof views/init
         * @private
         * @param {Event} ev
         */
        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = page ? page.id : '';

            if (keyName === 'back') {
                if (pageid === 'main' || pageid === 'ajax-loader') {
                    heartRate.stop();
                    exit();
                } else {
                    history.back();
                }
            }
        }

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
            if (document.getElementsByClassName('ui-page-active')[0].id ===
                'register') {
                event.fire('register.menuBack');
            }
            exit();
        }

        /**
         * Registers event listeners.
         *
         * @memberof views/init
         * @private
         */
        function bindEvents() {
            event.on({'core.systeminfo.battery.low': onLowBattery});
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            window.addEventListener('resize', onWindowResize);
            sysInfo.listenBatteryLowState();
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
            sysInfo.checkBatteryLowState();
        }

        return {
            init: init
        };
    }
});
