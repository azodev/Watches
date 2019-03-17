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

/*global define, navigator, setInterval, clearInterval*/

/**
 * Vibration helper module.
 *
 * @module helpers/vibration
 * @namespace helpers/vibration
 * @memberof helpers
 */
define({
    name: 'helpers/vibration',
    def: function vibrationModule() {
        'use strict';

        /**
         * Duration of pause between vibrations in milliseconds.
         *
         * @memberof helpers/vibration
         * @private
         * @const {number}
         */
        var PAUSE_DURATION = 1000,

            /**
             * Duration of vibration step in milliseconds.
             *
             * @memberof helpers/vibration
             * @private
             * @const {number}
             */
            VIBRATION_DURATION = 1000,

            /**
             * Duration on whole process in milliseconds.
             * After this time vibration will be stopped
             * even the stop function has not been called.
             *
             * @memberof helpers/vibration
             * @private
             * @const {number}
             */
            PROCESS_DURATION = 20000,

            /**
             * Vibration interval task id.
             *
             * @memberof helpers/vibration
             * @private
             * @type {number}
             */
            intervalId = 0,

            /**
             * Vibration launch time.
             *
             * @memberof helpers/vibration
             * @private
             * @type {number}
             */
            launchTimestamp = 0;

        /**
         * Launches one step of vibration or turns off the vibration process if
         * duration defined by the VIBRATION_DURATION variable passed.
         *
         * @memberof helpers/vibration
         * @private
         */
        function vibrate() {
            var stopTime = launchTimestamp + PROCESS_DURATION,
                currentTime = new Date().getTime();

            if (currentTime > stopTime) {
                clearInterval(intervalId);
            } else {
                navigator.vibrate(VIBRATION_DURATION);
            }
        }

        /**
         * Turns on vibration if it is turned off. After calling this function
         * device will vibrate repeatedly for time defined in the
         * PROCESS_VIBRATION variable.
         *
         * @memberof helpers/vibration
         * @public
         */
        function start() {
            if (intervalId === 0) {
                intervalId = setInterval(vibrate,
                    VIBRATION_DURATION + PAUSE_DURATION);
                launchTimestamp = new Date().getTime();
            }
        }

        /**
         * Turns off vibration if it is turned on.
         *
         * @memberof helpers/vibration
         * @public
         */
        function stop() {
            if (intervalId !== 0) {
                clearInterval(intervalId);
                intervalId = 0;
            }
        }

        return {
            start: start,
            stop: stop
        };
    }
});
