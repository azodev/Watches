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

/*global define, console, tizen */

/**
 * Sensor model.
 *
 * @requires {@link core/event}
 * @requires {@link core/window}
 * @namespace models/motion
 * @memberof models
 */
define({
    name: 'models/motion',
    requires: [
        'core/event',
        'core/window'
    ],
    def: function modelsMotion(e, window) {
        'use strict';

        /**
         * Name of the sensor type.
         *
         * @private
         * @const {string}
         */
        var 
        event = e,
        
        SENSOR_TYPE = 'ACCELERATION',

            /**
             * Error type name.
             *
             * @private
             * @const {string}
             */
            ERROR_TYPE_NOT_SUPPORTED = 'NotSupportedError',

            /**
             * Maximum size of the previousMotions array.
             *
             * @private
             * @const {number}
             */
            MAX_LENGTH = 7,

            /**
             * Reference to the sensor service.
             *
             * @private
             * @type {SensorService}
             */
            sensorService = null,

            /**
             * Reference to the motion sensor.
             *
             * @private
             * @type {MotionSensor}
             */
            motionSensor = null,

            /**
             * Array of registered motions.
             *
             * @private
             * @type {number[]}
             */
            previousMotions = [],


            /**
             * Current motion.
             *
             * @private
             * @type {number}
             */
            currentMotion = {accelerationIncludingGravity : {x:null,y:null}};
        	var options = {
    			sampleInterval : 100,
    			maxBatchCount : 1000
    		};


        	
        
        
        
        /**
         * Performs action on start sensor success.
         *
         * @private
         * @fires models.motion.start
         */
        function onSensorStartSuccess() {
            e.fire('start');
        }

        /**
         * Performs action on start sensor error.
         *
         * @private
         * @param {Error} e
         * @fires models.motion.error
         */
        function onSensorStartError(e) {
            console.error('Motion sensor start error: ', e);
            e.fire('error', e);
        }

        /**
         * Updates the average motion value.
         *
         * @private
         * @param {number} currentPressure
         * @returns {number}
         */
        function updateAveragePressure(currentPressure) {
            previousPressures.push(currentPressure);

            var len = previousPressures.length;

            if (len <= MAX_LENGTH) {
                // nothing to shift yet, recalculate whole average
                averagePressure = previousPressures.reduce(function sum(a, b) {
                    return a + b;
                }) / len;
            } else {
                // add the new item and subtract the one shifted out
                averagePressure += (
                    currentPressure - previousPressures.shift()
                ) / len;
            }
            return averagePressure;
        }


        /**
         * Performs action on sensor change.
         *
         * @private
         * @param {object} data
         */
        function onSensorChange(SensorAccelerationData) {
        	
        	currentMotion.accelerationIncludingGravity = {
					x : SensorAccelerationData.x,
					y : SensorAccelerationData.y
			};
            e.fire('change',  	getSensorValue());
        }

        /**
         * Starts motion sensor.
         *
         * @memberof models/motion
         * @public
         */
        function start() {
            motionSensor.start(onSensorStartSuccess, onSensorStartError);
            console.log( 'start motion sensor');
        }
        function stop(){
        	motionSensor.stop();
        }
        /**
         * Sets sensor change listener.
         *
         * @memberof models/motion
         * @public
         */
        function setChangeListener() {
        	try{
        		 motionSensor.setChangeListener(onSensorChange,options.sampleInterval,options.maxBatchCount);
        	}
        	catch (e) {
        		motionSensor.setChangeListener(onSensorChange);
			}
           
            //
        }
        function setOptions(options){
        	options = options;
        }

        /**
         * Returns sensor value.
         *
         * @memberof models/motion
         * @public
         * @returns {number}
         */
        function getSensorValue() {
            return currentMotion;
        }

        

       
        /**
         * Returns true if motion sensor is available, false otherwise.
         *
         * @memberof models/motion
         * @public
         * @returns {boolean}
         */
        function isAvailable() {
            return !!motionSensor;
        }
        function setCurrentMotionValue(data) {
        	currentMotion.accelerationIncludingGravity.x =data.x;
        	currentMotion.accelerationIncludingGravity.x =data.y;
        }
        
        /**
		 * Registers event listeners.
		 * 
		 * @memberof models/location
		 * @private
		 */
		function bindEvents() {

			
			 
		}
        function init() {
        	bindEvents();
            sensorService = tizen.sensorservice ||
                (window.webapis && window.webapis.sensorservice) ||
                null;
            if (!sensorService) {
                e.fire('error', {type: 'notavailable'});
            } else {
                try {
                    motionSensor = sensorService
                        .getDefaultSensor(SENSOR_TYPE);
                    motionSensor
                        .getMotionSensorData(setCurrentMotionValue);
                } catch (error) {
                    if (error.type === ERROR_TYPE_NOT_SUPPORTED) {
                        e.fire('error', {type: 'notsupported'});
                    } else {
                        e.fire('error', {type: 'unknown'});
                    }
                }
            }
        }

        return {
            init: init,
            start: start,
            stop: stop,
            isAvailable: isAvailable,
            setChangeListener: setChangeListener,
            getSensorValue: getSensorValue,
            setOptions: setOptions
        };
    }

});
