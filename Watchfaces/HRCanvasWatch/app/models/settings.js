/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd. All rights reserved.
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

/*global define, console*/

/**
 * Settings model.
 *
 * @requires {@link core/storage/idb}
 * @requires {@link core/event}
 * @namespace models/settings
 * @memberof models
 */
define({
    name: 'models/settings',
    requires: [
        'core/storage/idb',
        'core/event'
    ],
    def: function modelsSettings(req) {
        'use strict';

        /**
         * Core event module.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * IDB storage module.
             *
             * @private
             * @type {Module}
             */
            s = req.core.storage.idb,

            /**
             * Storage key.
             *
             * @private
             * @const {string}
             */
            STORAGE_KEY = 'settings',

            /**
             * Default pressure.
             *
             * @private
             * @const {object}
             */
            DEFAULT = Object.freeze({
                pressure: 1013.25
            }),

            /**
             * Settings object.
             *
             * @private
             * @type {object}
             */
            settings = {};

        /**
         * Saves settings to storage.
         *
         * @private
         */
        function saveSettings() {
            s.add(STORAGE_KEY, settings);
        }

        /**
         * Sets given settings property.
         *
         * @memberof models/settings
         * @public
         * @param {string} property
         * @param {number} value
         * @returns {boolean}
         */
        function set(property, value) {
            if (property !== undefined && value !== undefined) {
                settings[property] = value;
                saveSettings();
                return true;
            }
            return false;
        }

        /**
         * Returns given settings property.
         *
         * @memberof models/settings
         * @public
         * @param {string} property
         * @returns {number}
         */
        function get(property) {
            if (settings[property] === undefined) {
                //console.error('Settings not initialized yet.');
                return null;
            }
            return settings[property];
        }

        /**
         * Initializes module.
         *
         * @private
         */
        function init() {
            s.get(STORAGE_KEY);
        }

        /**
         * Handles core.storage.idb.read event.
         *
         * @private
         * @param {event} ev
         */
        function onRead(ev) {
            if (ev.detail.key !== STORAGE_KEY) {
                return;
            }

            if (typeof ev.detail.value !== 'object') {
                settings = {
                    pressure: DEFAULT.pressure
                };
                saveSettings();
            } else {
                settings = ev.detail.value;
            }
        }

        /**
         * Make sure that init is run when storage is ready.
         *
         * @memberof models/settings
         * @public
         */
        function runInit() {
            if (s.isReady()) {
                init();
            } else {
                e.listen('core.storage.idb.open', init);
            }
        }

        e.listeners({
            'core.storage.idb.read': onRead
        });

        return {
            init: runInit,
            get: get,
            set: set
        };
    }

});
