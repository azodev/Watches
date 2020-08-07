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
 * @namespace models/pressure
 * @memberof models
 */
define({
    name: 'models/pressure',
    requires: [
        'core/event',
        'core/window'
    ],
    def: function modelsPressure(e, window) {
        'use strict';

        /**
         * Name of the sensor type.
         *
         * @private
         * @const {string}
         */
        var 
        event = e,
        
        SENSOR_TYPE = 'PRESSURE',

            /**
             * Error type name.
             *
             * @private
             * @const {string}
             */
            ERROR_TYPE_NOT_SUPPORTED = 'NotSupportedError',

            /**
             * Maximum size of the previousPressures array.
             *
             * @private
             * @const {number}
             */
            MAX_LENGTH = 5,

            /**
             * Reference to the sensor service.
             *
             * @private
             * @type {SensorService}
             */
            sensorService = null,

            /**
             * Reference to the pressure sensor.
             *
             * @private
             * @type {PressureSensor}
             */
            pressureSensor = null,

            /**
             * Array of registered pressures.
             *
             * @private
             * @type {number[]}
             */
            previousPressures = [],

            /**
             * Average pressure.
             *
             * @private
             * @type {number}
             */
            averagePressure = 0,

            /**
             * Current pressure.
             *
             * @private
             * @type {number}
             */
            currentPressure = 0;
        	var options = {
    			sampleInterval : 1000,
    			maxBatchCount : 5000
    		};
        	var weatherInformation = null;
        	var refferencePressure = 1013.25;
        	var text = '';
        	var altitude = null;
        	var temperature = 20;
        	var isEnable = false;
        	
        
        
        
        /**
         * Performs action on start sensor success.
         *
         * @private
         * @fires models.pressure.start
         */
        function onSensorStartSuccess() {
            e.fire('start');
            isEnable = true;
        }

        /**
         * Performs action on start sensor error.
         *
         * @private
         * @param {Error} e
         * @fires models.pressure.error
         */
        function onSensorStartError(e) {
            console.error('Pressure sensor start error: ', e);
            e.fire('error', e);
        }

        /**
         * Updates the average pressure value.
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
        function updateAltitudeValue(){
        	//reference = 1007;
			//altitude = -8727 * Math.log(averagePressure / refferencePressure);
        	altitude = ((Math.pow(refferencePressure/averagePressure,1/5.257)-1)*(temperature+273.15)/0.0065);
			if (altitude === '-0') {
				altitude = '0';
			}
        }
        function getAltitude(){
        	return altitude;
        }

        /**
         * Performs action on sensor change.
         *
         * @private
         * @param {object} data
         */
        function onSensorChange(data) {
            currentPressure = data.pressure;
            updateAveragePressure(currentPressure);
            updateAltitudeValue();
            e.fire('change', {
                current: data.pressure,
                average: averagePressure,
                altitude: altitude
            });
        }

        /**
         * Starts pressure sensor.
         *
         * @memberof models/pressure
         * @public
         */
        function start() {
            pressureSensor.start(onSensorStartSuccess, onSensorStartError);
            console.log( 'start pressure sensor');
            
        }
        function stop(){
        	pressureSensor.stop();
        	isEnable = false;
        }
        function isStarted(){
        	return isEnable;
        }

        /**
         * Sets sensor change listener.
         *
         * @memberof models/pressure
         * @public
         */
        function setChangeListener() {
        	try{
        		 pressureSensor.setChangeListener(onSensorChange,options.sampleInterval,options.maxBatchCount);
        	}
        	catch (e) {
        		pressureSensor.setChangeListener(onSensorChange);
			}
           
            //
        }
        function setOptions(options){
        	options = options;
        }
        function setReferencePressure(reff){
        	refferencePressure = reff; 
        }
        function setTemperature(t){
        	temperature = t;
        }
        /**
         * Returns sensor value.
         *
         * @memberof models/pressure
         * @public
         * @returns {number}
         */
        function getSensorValue() {
            return currentPressure;
        }

        /**
         * Returns average pressure value.
         *
         * @memberof models/pressure
         * @public
         * @returns {number}
         */
        function getAverageSensorValue() {
            return averagePressure;
        }

        /**
         * Sets current pressure value.
         *
         * @private
         * @param {object} data
         */
        function setCurrentPressureValue(data) {
            currentPressure = data.pressure;
        }

        /**
         * Returns true if pressure sensor is available, false otherwise.
         *
         * @memberof models/pressure
         * @public
         * @returns {boolean}
         */
        function isAvailable() {
            return !!pressureSensor;
        }
        function onPositionFound(positionInfo){
        	
        }
        function onWeatherFound(weatherInfo){
        	if (weatherInfo.detail) {
        		weatherInformation = weatherInfo.detail;
        		setReferencePressure (weatherInformation.main.pressure);
        		setTemperature (weatherInformation.main.temp);
        	}
        }
        /**
         * Initializes module.
         *
         * @memberof models/pressure
         * @public
         * @fires 'models.pressure.error'
         */
        /**
		 * Registers event listeners.
		 * 
		 * @memberof models/location
		 * @private
		 */
		function bindEvents() {

			event.on({ 
				'models.location.found': onPositionFound,
				'models.weather.found': onWeatherFound
				});
			 
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
                    pressureSensor = sensorService
                        .getDefaultSensor(SENSOR_TYPE);
                    pressureSensor
                        .getPressureSensorData(setCurrentPressureValue);
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
            isStarted : isStarted,
            isAvailable: isAvailable,
            setChangeListener: setChangeListener,
            getAverageSensorValue: getAverageSensorValue,
            getSensorValue: getSensorValue,
            setOptions: setOptions,
            getAltitude: getAltitude
        };
    }

});
