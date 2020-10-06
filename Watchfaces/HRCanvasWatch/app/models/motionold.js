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
	name : 'models/motion',
	requires : [ 'core/event', 'core/window' ],
	def : function modelsMotion(e, window) {
		'use strict';

		/**
		 * Name of the sensor type.
		 * 
		 * @private
		 * @const {string}
		 */
		var event = e,

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
		MAX_LENGTH = 2,

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
		gyroscopeSensor = null,

		/**
		 * Array of registered motions.
		 * 
		 * @private
		 * @type {number[]}
		 */
		previousMotions = [], len = 0,

		/**
		 * Average pressure.
		 * 
		 * @private
		 * @type {number}
		 */
		averageMotion = {
			accelerationIncludingGravity : {
				x : 0,
				y : 0
			}
		}, firstElement = {
			accelerationIncludingGravity : {
				x : 0,
				y : 0
			}
		},

		/**
		 * Current motion.
		 * 
		 * @private
		 * @type {number}
		 */
		currentMotion = {
			accelerationIncludingGravity : {
				x : null,
				y : null
			}
		};
		var options = {
			sampleInterval : 100,
			maxBatchCount : 1000
		};
		var isEnable = false;
		var initialValue = 0;
		var elem  = null;
		var found = false;
		/**
		 * Performs action on start sensor success.
		 * 
		 * @private
		 * @fires models.motion.start
		 */
		function onSensorStartSuccess() {
			//e.fire('start');
			isEnable = true;
		}

		/**
		 * Performs action on start sensor error.
		 * 
		 * @private
		 * @param {Error}
		 *            e
		 * @fires models.motion.error
		 */
		function onSensorStartError(e) {
			console.error('Motion sensor start error: ', e);
			//e.fire('error', e);
		}

		/**
		 * Updates the average motion value.
		 * 
		 * @private
		 * @param {number}
		 *            currentPressure
		 * @returns {number}
		 */
		function updateAverageMotion(currentMotion) {

			try {
				previousMotions.push(currentMotion.accelerationIncludingGravity);
				initialValue = 0;
				len = previousMotions.length;
				if (len <= MAX_LENGTH) {
					// nothing to shift yet, recalculate whole average
					averageMotion.accelerationIncludingGravity.x = previousMotions.reduce(function(accumulator, currentValue) {
						return accumulator + currentValue.x;
					},initialValue) / len;
					averageMotion.accelerationIncludingGravity.y = previousMotions.reduce(function(accumulator, currentValue) {
						return accumulator + currentValue.y;
					},initialValue) / len;
					averageMotion.accelerationIncludingGravity.z = previousMotions.reduce(function(accumulator, currentValue) {
						return accumulator + currentValue.z;
					},initialValue) / len;
				} else {
					// add the new item and subtract the one shifted out
					firstElement = previousMotions.shift();
					averageMotion.accelerationIncludingGravity.x += (currentMotion.accelerationIncludingGravity.x - firstElement.x) / len;
					averageMotion.accelerationIncludingGravity.y += (currentMotion.accelerationIncludingGravity.y - firstElement.y) / len;
					averageMotion.accelerationIncludingGravity.z += (currentMotion.accelerationIncludingGravity.z - firstElement.z) / len;
				}
				return averageMotion;
			} catch (exept) {
				//e.fire('error', exept.message);
				averageMotion = currentMotion;
			}

		}

		/**
		 * Performs action on sensor change.
		 * 
		 * @private
		 * @param {object}
		 *            data
		 */
		function onSensorChange(SensorAccelerationData) {
			
			currentMotion.accelerationIncludingGravity = {
				x : SensorAccelerationData.x,
				y : SensorAccelerationData.y,
				z : SensorAccelerationData.z
			};
			updateAverageMotion(currentMotion);
			if (!found){
				found = true;
			}
			e.fire('change', getSensorValueAvg());
		}
		function setCurrentMotionValue(data) {
			currentMotion.accelerationIncludingGravity.x = data.x;
			currentMotion.accelerationIncludingGravity.y = data.y;
			currentMotion.accelerationIncludingGravity.z = data.z;
			//updateAverageMotion(currentMotion);
		}

		/**
		 * Starts motion sensor.
		 * 
		 * @memberof models/motion
		 * @public
		 */
		function start() {
			motionSensor.start(onSensorStartSuccess, onSensorStartError);
			//console.log('start motion sensor');

		}
		function stop() {
			motionSensor.stop();
			isEnable = false;
			//e.fire('reset', true);
		}
		function isStarted() {
			return isEnable;
		}
		function isMotionFound(){
			return found;
		}
		/**
		 * Sets sensor change listener.
		 * 
		 * @memberof models/motion
		 * @public
		 */
		function setChangeListener() {
			try {
				motionSensor.setChangeListener(onSensorChange, options.sampleInterval, options.maxBatchCount);
				//gyroscopeSensor.setChangeListener(onGetSuccessCB, options.sampleInterval, options.maxBatchCount);
				//gyroscopeSensor.getGyroscopeSensorData(onGetSuccessCB, onerrorCB);
			} catch (e) {
				motionSensor.setChangeListener(onSensorChange);
				//gyroscopeSensor.setChangeListener(onGetSuccessCB);
			}

			//
		}
		function setOptions(options) {
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
		function getSensorValueAvg() {
			return averageMotion;
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
			sensorService = tizen.sensorservice || (window.webapis && window.webapis.sensorservice) || null;
			if (!sensorService) {
				event.fire('error', {
					type : 'notavailable'
				});
			} 
			else {
				try {
					motionSensor = sensorService.getDefaultSensor(SENSOR_TYPE);
					motionSensor.getMotionSensorData(setCurrentMotionValue);
				} 
				catch (error) {
					if (error.type === ERROR_TYPE_NOT_SUPPORTED) {
						event.fire('error', {
							type : 'notsupported'
						});
					} 
					else {
						event.fire('error', {
							type : 'unknown'
						});
					}
				}
			}
			elem = document.querySelector("div.menuHolder"); 
		

			
		}
		

		return {
			init : init,
			start : start,
			stop : stop,
			isStarted : isStarted,
			isAvailable : isAvailable,
			setChangeListener : setChangeListener,
			getSensorValue : getSensorValue,
			getSensorValueAvg : getSensorValueAvg,
			setOptions : setOptions,
			isMotionFound: isMotionFound
		};
	}

});
