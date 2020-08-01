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

/* global define, console, window, tizen */

/**
 * Heart Rate Monitor module.
 * 
 * @module models/pedometer
 * @requires {@link core/event}  
 * @requires {@link core/storage/idb}
 * @namespace models/pedometer
 * @memberof models/pedometer
 */

define({
	name : 'models/pedometer',
	requires : [ 'core/event', 'core/storage/idb' ],
	def : function modelsPedometer(req) {
		'use strict';
		
		/**
		 * Core storage idb module object.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @type {Module}
		 */
		var indexedDB = req.core.storage.idb,
		/**
		 * Core event module object.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @type {Module}
		 */
		event = req.core.event,

		/**
		 * Specifies the human activity monitor type.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @const {string}
		 */
		CONTEXT_TYPE = 'PEDOMETER',

		/**
		 * Value of current heart rate.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @type {object}
		 */
		pedometerSensor = null,

		/**
		 * Object represents Heart Rate Monitor data.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @type {object}
		 */
		
		pedometerData = {
			stepStatus : null,
			speed : null,
			walkingFrequency : null,
			accumulativeTotalStepCount : null,
			cumulativeCalorie: null,
			cumulativeTotalStepCount: null,
			stepCountDifferences: null
		};
		var pData = pedometerData;
		var pedometerDataLastGood = pedometerData;
		var started = false;
		var firstSteps = 0;
		var lasthour = null;

		/**
		 * Sets heart rate and time values received from sensor. Returns heart
		 * rate data.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @param {object}
		 *            pedometerInfo
		 * @returns {object}
		 */
		function setPedometerData(pedometerInfo) {
			
			if (firstSteps == 0) {
				firstSteps = pedometerInfo.accumulativeTotalStepCount;
			}
			
			if (lasthour >  tizen.time.getCurrentDateTime().getHours()){
				firstSteps = pedometerInfo.accumulativeTotalStepCount;
			}
			lasthour = tizen.time.getCurrentDateTime().getHours();
			pData = {
					stepStatus : pedometerInfo.stepStatus,
					speed : pedometerInfo.speed,
					walkingFrequency : pedometerInfo.walkingFrequency,
					accumulativeTotalStepCount : pedometerInfo.accumulativeTotalStepCount-firstSteps,
					cumulativeCalorie: pedometerInfo.cumulativeCalorie,
					cumulativeTotalStepCount: pedometerInfo.cumulativeTotalStepCount,
					stepCountDifferences: pedometerInfo.stepCountDifferences
				};
			pedometerData = pData;
			
			
			pedometerDataLastGood = pData;
			
			return pData;
		}

		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @returns {object}
		 */
		function getData() {
			return pedometerData;
		}

		/**
		 * Resets heart rate data.
		 * 
		 * @memberof models/pedometer
		 * @private
		 */
		function resetData() {
			pedometerData = {
				stepStatus : '-',
				speed : 0,
				walkingFrequency : '-',
				accumulativeTotalStepCount : 0,
				cumulativeCalorie: 0,
				cumulativeTotalStepCount: 0
				
			};
		}

		/**
		 * Handles change event on current heart rate.
		 * 
		 * @memberof models/pedometer
		 * @private
		 * @param {object}
		 *            pedometerInfo
		 * @fires models.pedometer.change
		 */
		function handlePedometerInfo(pedometerInfo) {
			//console.log(pedometerInfo);
			setPedometerData(pedometerInfo);
			//pedometerSensor.unsetAccumulativePedometerListener();
			//started = false;
			//event.fire('change', getData());
			
		}
		function onchangedCB(pedometerInfo){
			  console.log("From now on, you will be notified when the pedometer data changes.");
			//pedometerSensor.getHumanActivityData(CONTEXT_TYPE, handlePedometerInfo, onerrorCB);
		}
		function onerrorCB(error){
			 event.fire('error',"Error occurs. name:"+error.name + ", message: "+error.message);
			 console.log("Error occurs. name:"+error.name + ", message: "+error.message);
		}
		/**
		 * Starts the sensor and registers a change listener.
		 * 
		 * @memberof models/pedometer
		 * @public
		 */
		function start() {
			//resetData();
			console.log('Starting PEDO Sensor');
			if (started === false){
				//pedometerSensor.getHumanActivityData(CONTEXT_TYPE, handlePedometerInfo,onerrorCB);
				pedometerSensor.setAccumulativePedometerListener(handlePedometerInfo);
				
				started = true;
			}
			
		}

		/**
		 * Stops the sensor and unregisters a previously registered listener.
		 * 
		 * @memberof models/pedometer
		 * @public
		 */
		function stop() {
			pedometerSensor.unsetAccumulativePedometerListener();
		}

		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/pedometer
		 * @private
		 */
		function bindEvents() {

			event.on({
			// 'core.storage.idb.write' : onWriteLimit,
			// 'core.storage.idb.read' : onReadLimit
			});
		}

		/**
		 * Initializes the module.
		 * 
		 * @memberof models/pedometer
		 * @public
		 */
		function init() {
			bindEvents();
			resetData();
			
			pedometerSensor = (tizen && tizen.humanactivitymonitor)
			|| (window.webapis && window.webapis.motion) || null;
			
		}

		return {
			init : init,
			start : start,
			stop : stop,
			getData: getData
		};
	}
});
