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
 * @module models/location
 * @requires {@link core/event}
 * @namespace models/location
 * @memberof models/location
 */

define({
	name : 'models/location',
	requires : [ 'core/event' ],
	def : function modelsLocation(ev) {
		'use strict';

		var event = ev,

		/**
		 * Specifies the human activity monitor type.
		 * 
		 * @memberof models/location
		 * @private
		 * @const {string}
		 */
		CONTEXT_TYPE = 'GPS',

		/**
		 * Value of current heart rate.
		 * 
		 * @memberof models/location
		 * @private
		 * @type {object}
		 */
		locationSensor = null, locationWatcher = null,
		/**
		 * Object represents position data.
		 * 
		 * @memberof models/location
		 * @private
		 * @type {object}
		 */
		locationDefault = {
			latitude : null,
			longitude : null,
			altitude : null,
			heading : null,
			speed : null,
			timestamp : null,
			date : null

		};
		var locationDataLastGood = locationDefault;
		var locationData = locationDefault;
		var crd, date, hours, minutes, seconds, formattedTime;
		var positionAquiered = false;
		var errorMsg = '';
		var options = {
			enableHighAccuracy: true,
			timeout : 5000,
			maximumAge : 900000
		};
		var optionGPS = {
			sampleInterval : 2000,  //10000
			callbackInterval : 5000  // 20000
		};

		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/location
		 * @private
		 * @returns {object}
		 */
		function getData() {

			return locationData;
		}
		function getPositionAquiered() {
			return positionAquiered;
		}
		function getDataLastGood() {

			return locationDataLastGood;
		}
		function setOptions(sampleInterval, callbackInterval) {
			options = {
				sampleInterval : sampleInterval,
				callbackInterval : callbackInterval
			};
		}
		function getOptions() {
			return options;
		}
		/**
		 * Resets heart rate data.
		 * 
		 * @memberof models/location
		 * @private
		 */
		function resetData() {
			locationData = locationDefault;

		}
		function getTime(timestamp) {

			date = new Date(timestamp);
			hours = date.getHours();
			minutes = "0" + date.getMinutes();
			seconds = "0" + date.getSeconds();

			formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
			return formattedTime;
		}
		function analyzeCoords(coords){
			if (positionAquiered && 
					(
							Math.abs(locationDataLastGood.latitude -  coords.latitude ) >= 0.05 ||
							Math.abs(locationDataLastGood.longitude -  coords.longitude ) >= 0.05
					))
			{
				//event.fire('distanceChange', getData());
				event.fire('error', 'distanceChange');
				//console.error('distanceChange');
			}
		}
		function successCallback(pos) {
			crd = pos.coords;
			date = new Date(pos.timestamp);
			locationData = {
				latitude : crd.latitude,
				longitude : crd.longitude,
				altitude : crd.altitude,
				heading : crd.heading,
				speed : crd.speed,
				timestamp : pos.timestamp,
				date : getTime(pos.timestamp)
			};
			analyzeCoords(crd);
			locationDataLastGood = locationData;
			
			if (!positionAquiered){
				positionAquiered = true;
				event.fire('found', positionAquiered);
			}
			console.error('Location succcess');
			event.fire('change', getData());
		}
		function succcessFallback(pos) {
			if (pos.gpsInfo) {
				crd = pos.gpsInfo[0];
				locationData = {
					latitude : crd.latitude,
					longitude : crd.longitude,
					altitude : crd.altitude,
					speed : crd.speed,
					timestamp : crd.timestamp,
					date : getTime(crd.timestamp)
				};
				
				if (!positionAquiered){
					positionAquiered = true;
					event.fire('found', positionAquiered);
				}
				
			}
			locationDataLastGood = locationData;
			console.error('Location succcess in fallback');
			event.fire('change', getData());
		}
		function errorFallback(err) {
			errorMsg = err.message;
			console.error('Location error :'+err.message);
//			//event.fire('error', err.message);
			doFallback();
			//event.fire('change', getDataLastGood());
		}

		function doFallback() {
			//event.fire('error', 'doFallback');
			locationSensor.start(CONTEXT_TYPE, succcessFallback, errorFallback, optionGPS);
		}

		function errorCallback(err) {
			switch (err.code) {
			case err.TIMEOUT:
				event.fire('error', err.message);
				// Quick fallback when no suitable cached position exists.
				doFallback();
				console.error(err.message);
				break;
			default:
				event.fire('error', err.message);
				console.error(err.message);
			}

			// event.fire('change', getDataLastGood());

		}

		/**
		 * Starts the sensor and registers a change listener.
		 * 
		 * @memberof models/location
		 * @public
		 */

		function start() {
			resetData();
			console.error( 'start location sensor');

			if (locationWatcher === null) {
				locationWatcher = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
			}

			//doFallback();

		}

		/**
		 * Stops the sensor and unregisters a previously registered listener.
		 * 
		 * @memberof models/location
		 * @public
		 */
		function stop() {
			locationSensor.stop(CONTEXT_TYPE);
			console.error( 'stop location sensor');
			if (locationWatcher !== null) {
				navigator.geolocation.clearWatch(locationWatcher);
				locationWatcher = null;
			}
		}
		function triggerLocationUpdate(ev) {
			console.error('triggerLocationUpdate');
			stop();
			start();
		}
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/location
		 * @private
		 */
		function bindEvents() {
			event.on({
				//'views.main.triggerLocationUpdate' : triggerLocationUpdate
			});

		}

		/**
		 * Initializes the module.
		 * 
		 * @memberof models/location
		 * @public
		 */
		function init() {
			bindEvents();
			resetData();

			locationSensor = (tizen && tizen.humanactivitymonitor) || (window.webapis && window.webapis.motion) || null;
			
		}

		return {
			init : init,
			start : start,
			stop : stop,
			getPositionAquiered : getPositionAquiered,
			getData : getData,
			setOptions : setOptions
		};
	}
});
