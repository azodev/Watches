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
			sampleInterval : 1000,  //10000
			callbackInterval : 1000  // 20000
		};
		var tizenSensor =false;
		var running = false;
		var old_timestamp= null, interval, navStart = performance.timing.navigationStart;
		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/location
		 * @private
		 * @returns {object}
		 */
		function loadSettings(){
			locationData = JSON.parse(tizen.preference.getValue('location.position'));
			locationDataLastGood = locationData;
        }
        function saveSettings(){
        	tizen.preference.setValue('location.position',JSON.stringify(locationData));
        } 
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
							Math.abs(locationDataLastGood.latitude -  coords.latitude ) >= 0.02 ||
							Math.abs(locationDataLastGood.longitude -  coords.longitude ) >= 0.02
					))
			{
				event.fire('distanceChange', 'distanceChange');
			}
		}
		function successNavigator(pos) {
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
				//event.fire('log', 'positionAquiered');
			}
			saveSettings();
			//console.log('Location succcess');
			event.fire('change', getData());
			stop();
		}
		function succcessTizen(pos) {
			if (pos.gpsInfo) {
				crd = pos.gpsInfo[0];
				date = new Date(pos.timestamp);
				locationData = {
					latitude : crd.latitude,
					longitude : crd.longitude,
					altitude : crd.altitude,
					speed : crd.speed,
					timestamp : crd.timestamp,
					date : getTime(crd.timestamp)
				};
				analyzeCoords(crd);
				locationDataLastGood = locationData;
				if (!positionAquiered){
					positionAquiered = true;
					event.fire('found', positionAquiered);
					//event.fire('log', 'positionAquiered fallback');
				}
				saveSettings();
				//console.log('Location succcess in fallback');
				event.fire('change', getData());
				stop();
			}
			else {
				console.error('Location fallback gpsInfo issue');
				event.fire('error', 'gpsInfo issue');
			}
			
		}
		function doFallback() {
			//event.fire('error', 'doFallback');
			console.warn('doFallback');
			//event.fire('error', 'doFallback');
			tizenSensor = true;
			//locationWatcher = navigator.geolocation.watchPosition(successNavigator, errorNavigator, options);
			locationSensor.start(CONTEXT_TYPE, succcessTizen, errorTizen, optionGPS);
		}
		function errorTizen(err) {
			errorMsg = err.message;
			console.error('Location error :'+err.message);
//			event.fire('error', err.message);
			//doFallback();
			//event.fire('change', getDataLastGood());
		}

		

		function errorNavigator(err) {
			switch (err.code) {
			case err.TIMEOUT:
				event.fire('error', err.message);
				// Quick fallback when no suitable cached position exists.
				
				//console.error(err.message);
				break;
			default:
				event.fire('error', err.message);
				console.error(err.message);
			}
			doFallback();

			// event.fire('change', getDataLastGood());

		}

		/**
		 * Starts the sensor and registers a change listener.
		 * 
		 * @memberof models/location
		 * @public
		 */

		function start() {
			//resetData();
			//console.log( 'start location sensor');

			if (!running) {
				//tizenSensor = true;
				//locationSensor.start(CONTEXT_TYPE, succcessTizen, errorTizen, optionGPS);
				locationWatcher = navigator.geolocation.watchPosition(successNavigator, errorNavigator, options);
			}
				
			running = true;

		}

		/**
		 * Stops the sensor and unregisters a previously registered listener.
		 * 
		 * @memberof models/location
		 * @public
		 */
		function stop() {
			
			
			//console.log( 'stop location sensor');
			if (locationWatcher !== null) {
				navigator.geolocation.clearWatch(locationWatcher);
				locationWatcher = null;
			}
			if (tizenSensor){
				locationSensor.stop(CONTEXT_TYPE);
				tizenSensor =false;
			}
			running = false;
		}
		function triggerLocationUpdate(ev) {
			console.log('triggerLocationUpdate');
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
				'views.radial.update' : triggerLocationUpdate
			});
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
		/**
		 * Initializes the module.
		 * 
		 * @memberof models/location
		 * @public
		 */
		function init() {
			bindEvents(); 
			resetData(); 
			/*if (tizen.preference.exists('location.position')) {
        		
        		loadSettings();
        		console.log(getData());
        		positionAquiered = true;
    			event.fire('found', positionAquiered);
    			//event.fire('change', getData());
			}
			*/
			locationSensor = tizen.humanactivitymonitor;
			
		}

		return {
			init : init,
			start : start,
			stop : stop,
			getPositionAquiered : getPositionAquiered,
			getData : getData,
			setOptions : setOptions,
			setIntervalUpdate:setIntervalUpdate,
			handleUpdate:handleUpdate
		};
	}
});
