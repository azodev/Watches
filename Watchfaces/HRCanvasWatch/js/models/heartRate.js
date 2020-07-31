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
 * @module models/heartRate
 * @requires {@link core/event}
 * @namespace models/heartRate
 * @memberof models/heartRate
 */

define({
	name : 'models/heartRate',
	requires : [ 'core/event' ],
	def : function modelsHeartRate(e) {
		'use strict';

		/**
		 * Core event module object.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @type {Module}
		 */
		var event = e,

		/**
		 * Specifies the human activity monitor type.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @const {string}
		 */
		CONTEXT_TYPE = 'HRM',

		/**
		 * Value of current heart rate.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @type {object}
		 */
		heartRateSensor = null,

		/**
		 * Object represents Heart Rate Monitor data.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @type {object}
		 */
		heartRateData = {
			rate : null,
			rrinterval : null
		};
		var pData = heartRateData;
		var heartRateDataLastGood = heartRateData;
		var options = {
			'callbackInterval' : 1000,
			'sampleInterval' : 1000
		};
		var started = false;
		/**
		 * Sets heart rate and time values received from sensor. Returns heart
		 * rate data.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @param {object}
		 *            heartRateInfo
		 * @returns {object}
		 */
		function setHeartRateData(heartRateInfo) {
			if (heartRateInfo.heartRate > 1) {
				pData = {
					rate : heartRateInfo.heartRate,
					rrinterval : heartRateInfo.rRInterval
				};
				heartRateData = pData;
				heartRateDataLastGood = pData;
			} else {
				heartRateData = heartRateDataLastGood;
				pData = heartRateDataLastGood;
			}

			return pData;
		}

		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @returns {object}
		 */
		function getData() {
			return heartRateData;
		}

		/**
		 * Resets heart rate data.
		 * 
		 * @memberof models/heartRate
		 * @private
		 */
		function resetData() {
			if (heartRateDataLastGood.rate !== null ){
				heartRateData = heartRateDataLastGood;
			}
			else {
				heartRateData = {
						rate : null,
						rrinterval : null
					};
			}
			
		}

		/**
		 * Handles change event on current heart rate.
		 * 
		 * @memberof models/heartRate
		 * @private
		 * @param {object}
		 *            heartRateInfo
		 * @fires models.heartRate.change
		 */
		function handleHeartRateInfo(heartRateInfo) {
			setHeartRateData(heartRateInfo);
//			console.log(heartRateInfo);
			if (getData().rate !== null){
//				console.error('HR found :'+getData().rate);
				event.fire('change', getData());
				event.fire('HRFound', true);
			}
			
		}

		/**
		 * Starts the sensor and registers a change listener.
		 * 
		 * @memberof models/heartRate
		 * @public
		 */
		function start() {
			
//			console.error('Start HR Sensor function');
			if (!started) {
				started = true;
				resetData();
				console.log('Starting HR Sensor');
				heartRateSensor.start(CONTEXT_TYPE, function onChange(heartRateInfo) {
					handleHeartRateInfo(heartRateInfo);
					
				}, function onError(error) {
					console.error('error: ', error.message);
					// event.fire('HRFound', false);
				}, options);
			}
			
		}

		/**
		 * Stops the sensor and unregisters a previously registered listener.
		 * 
		 * @memberof models/heartRate
		 * @public
		 */
		function stop() {
			console.log('Stop HR Sensor function');
			if (started){
				heartRateSensor.stop(CONTEXT_TYPE);
//				console.error('Stopping HR Sensor');
				started = false;
			}
			
		}
		
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/heartRate
		 * @private
		 */
		function bindEvents() {

		}

		/**
		 * Initializes the module.
		 * 
		 * @memberof models/heartRate
		 * @public
		 */
		function init() {
			bindEvents();
			resetData();

			heartRateSensor = (tizen && tizen.humanactivitymonitor) || (window.webapis && window.webapis.motion) || null;

		}

		return {
			init : init,
			start : start,
			stop : stop,
			getData : getData
		};
	}
});
