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
            MAX_LENGTH = 2,

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
        	var refferencePressure = null;
        	var refferencePressureSea = null;
        	var temp_kf  = 1.7;
        	var text = '';
        	var altitude = null;
        	var temperature = 20;
        	var isEnable = false;
        	var old_timestamp = null, interval, navStart = performance.timing.navigationStart;
        	
        
        
        
        

        /**
         * Updates the average pressure value.
         *
         * @private
         * @param {number} currentPressure
         * @returns {number}
         */
        function updateAveragePressure(currentPressure,direct) {
        	if (typeof direct !== 'undefined' && direct){
        		averagePressure = currentPressure;
        	}
        	else {
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
        	}
           
            return averagePressure;
        }
        function updateAltitudeValue(){
        	//reference = 1007;
			//altitude = -8727 * Math.log(averagePressure / refferencePressure);
        	
        	if (refferencePressure != null) altitude = ((Math.pow(refferencePressure/averagePressure,1/5.257)-1)*(temperature+273.15)/0.0065);
        	if (refferencePressureSea != null) altitude = altcalc(refferencePressureSea*100, temperature+273.15, currentPressure*100);
			if (altitude === '-0' ||  altitude == null) {
				altitude = '0';
			} 
        }
        function getAltitude(){
        	return altitude;
        }
        
        function altcalc(a, k, i) {
            if ((a / i) < (101325 / 22632.1)) {
                var d = -0.0065;
                var e = 0;
                var j = Math.pow((i / a), (R * d) / (g * M));
                return e + ((k * ((1 / j) - 1)) / d)
            } else {
                if ((a / i) < (101325 / 5474.89)) {
                    var e = 11000;
                    var b = k - 71.5;
                    var f = (R * b * (Math.log(i / a))) / ((-g) * M);
                    var l = 101325;
                    var c = 22632.1;
                    var h = ((R * b * (Math.log(l / c))) / ((-g) * M)) + e;
                    return h + f
                }
            }
            return NaN
        }
        function noChange(a) {
            return a
        }
        var M = 0.0289644;
        var g = 9.80665;
        var R = 8.31432;
        var p_default = 101325;
        var t_default = 288.15;
        
        function convertUnits(a, c, b) {
            b = b == null ? "standard" : b;
            return unitConversions[c][b](a)
        }
        var unitConversions = {
            F: {
                F: noChange,
                C: function(a) {
                    return ((a - 32) * 5) / 9
                },
                K: function(a) {
                    return (a - 32) / 1.8 + 273.15
                },
                standard: function(a) {
                    return (a - 32) / 1.8 + 273.15
                }
            },
            C: {
                F: function(a) {
                    return (a * 1.8) + 32
                },
                C: noChange,
                K: function(a) {
                    return a + 273.15
                },
                standard: function(a) {
                    return a + 273.15
                }
            },
            K: {
                F: function(a) {
                    return (a * 1.8) - 459.67
                },
                C: function(a) {
                    return a - 273.15
                },
                K: noChange,
                standard: noChange
            },
            ft: {
                m: function(a) {
                    return a * 0.3048
                },
                ft: noChange,
                standard: function(a) {
                    return a * 0.3048
                }
            },
            m: {
                m: noChange,
                ft: function(a) {
                    return a * 3.2808
                },
                standard: noChange
            },
            Pa: {
                Pa: noChange,
                psi: function(a) {
                    return a / 6894.75729
                },
                atm: function(a) {
                    return a / 101325
                },
                standard: noChange
            },
            psi: {
                Pa: function(a) {
                    return a * 6894.75729
                },
                psi: noChange,
                atm: function(a) {
                    return a / 14.6959488
                },
                standard: function(a) {
                    return a * 6894.75729
                }
            },
            atm: {
                Pa: function(a) {
                    return a * 101325
                },
                psi: function(a) {
                    return a * 14.6959488
                },
                atm: noChange,
                standard: function(a) {
                    return a * 101325
                }
            }
        };
        
        /**
         * Performs action on start sensor success.
         *
         * @private
         * @fires models.pressure.start
         */
        function onSensorStartSuccess() {
        	//setChangeListener();
        	pressureSensor.getPressureSensorData(onSensorChange);
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
         * Performs action on sensor change.
         *
         * @private
         * @param {object} data
         */
        function onSensorChange(data) {
            currentPressure = data.pressure;
            updateAveragePressure(currentPressure,true);
            updateAltitudeValue();
            e.fire('change', {
                current: data.pressure,
                average: averagePressure,
                altitude: altitude
            });
            stop();
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
        	console.log( 'stop pressure sensor');
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
        function setReferencePressure(main){
        	refferencePressure = main.pressure;
        	//refferencePressureSea = main.sea_level;
        	//temp_kf = main.temp_kf
        }
        function setReferencePressureSea(main){
        	refferencePressureSea = main.sea_level;
        	temp_kf = main.temp_kf;
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
        		setReferencePressure (weatherInformation.main);
        		setTemperature (weatherInformation.main.temp);
        	}
        	triggerUpdate();
        }
        function triggerPressureSea(weatherInfo){
        	if (weatherInfo.detail) {
        		let main = weatherInfo.detail.main;
        		setReferencePressureSea(main);
        	}
        }
        function triggerUpdate(){
        	if (!isEnable) {
        		start();
        	}else {
        		stop();
        		start();
        	}
        	
        	
        }
        
        function handleUpdate(timestamp){
			
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
				'models.weather.found': onWeatherFound,
				'models.weather.triggerPressureSea' : triggerPressureSea,
				'views.radial.update' : triggerUpdate
				
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
                    pressureSensor = sensorService.getDefaultSensor(SENSOR_TYPE);
                    pressureSensor.getPressureSensorData(onSensorChange);
                } catch (error) {
                    if (error.type === ERROR_TYPE_NOT_SUPPORTED) {
                        e.fire('error', {type: 'notsupported'});
                    } else {
                        e.fire('error', {type: 'unknown'});
                    }
                }
            }
        }
        function setIntervalUpdate(i){
			interval = i;
		}
		function handleUpdate(ts){
			if (old_timestamp == null){
				old_timestamp = ts;
			}
			
			if (ts-old_timestamp >=  interval ){
				old_timestamp = ts;
				start();
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
            getAltitude: getAltitude,
            setIntervalUpdate:setIntervalUpdate,
			handleUpdate:handleUpdate
        };
    }

});
