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

/*global define, document, window*/

/**
 * Canvas view module.
 * 
 * @module views/canvas
 * @requires {@link core/event}
 * @requires {@link helpers/date}
 * @requires {@link helpers/text}
 * @requires {@link models/settings}
 * @requires {@link models/canvasDrawer}
 * @requires {@link models/heartRate}
 * @requires {@link models/pressure}
 * @requires {@link models/motion}
 * @requires {@link models/location}
 * @requires {@link models/weather}
 * @requires {@link core/systeminfo}
 * @namespace views/canvas
 * @memberof views/canvas
 */

define({
	name : 'views/canvas',
	requires : [ 'helpers/date', 'helpers/text', 'core/event', 'models/settings', 'models/canvasDrawer', 'models/heartRate', 'models/location', 'models/pressure', 'models/weather', 'core/systeminfo', 'models/motion' ],
	def : function viewsPageCanvas(req) {
		'use strict';

		/**
		 * Settings module.
		 * 
		 * @private
		 * @type {Module}
		 */
		var settings = req.models.settings;
		/**
		 * Core event module object.
		 * 
		 * @memberof views/canvas
		 * @private
		 * @type {Module}
		 */
		var dateHelper = req.helpers.date;
		var textHelper = req.helpers.text;
		var event = req.core.event;
		var heartRate = req.models.heartRate;
		var pressureSensor = req.models.pressure;
		var motionSensor = req.models.motion;
		var pedometer = req.models.pedometer;
		var locationModel = req.models.location;
		var weatherModel = req.models.weather;
		var gravSensor  = null;

		var canvasDrawer = req.models.canvasDrawer;
		var sysInfo = req.core.systeminfo;
		var canvasLayout, ctxLayout, canvasContent, ctxContent, center, watchRadius, forecastIndexX, forecastHour;
		var hearRateValue = 0;
		var locationValue = {
			latitude : 'Loading',
			longitude : '',
			timestamp : '',
			date : ''
		};
		var pedometerValue = {
			stepStatus : null,
			speed : null,
			walkingFrequency : null,
			accumulativeTotalStepCount : 0,
			cumulativeCalorie : null,
			cumulativeTotalStepCount : null
		};
		var locationPositionAquiered = false, doNotMkHR = false;
		var heartRateFound = false;
		var batteryLevel = 0;
		var reference;
		var text;

		var pressure = 0;
		var altitude = 0;
		var locationInterval = null, pedometerInterval = null, hrInterval = null, weatherInterval = null, hrIntervalStop = null;
		var errorMsg = '';
		var animTimeout, animRequest;
		
		var nextMove, datetime, hour, minute, second, date;
		var weatherValue, forecastValue;
		var weatherFound = false;
		var weatherIcon;
		// var weatherImg = new Image();
		var fps = 25;
		var dateArray = {
			hour : null,
			minute : null,
			second : null,
			date : null
		};
		var intervals = {
			location : 120000,
			heartRate : 10000,
			weather : 3600000,
			pressure : 11000
		};
		var grd,grdAmbiant, angle, i, j, startTime, now, then, elapsed, sinceStart, frame = 0, currentFps, isAmbientMode, rotate = false;
		var motion = null;
		var motionFromGyro = {accelerationIncludingGravity : {x:null,y:null}}; 
		
		/**
		 * Draws the basic layout of the watch
		 * 
		 * @private
		 */
		function drawWatchLayout() {
			console.error('DrawLayout');
			// Clear canvas
			ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);
			//
			canvasDrawer.renderText(ctxLayout, "AZO WATCH v.1", center.x, center.y - (watchRadius * 0.7), 13, "#c9c9c9", {
				font : 'FutureNow',
				align : 'center'
			});
		}
		function displayFps() {
			elapsed = now - then;
			if (elapsed > nextMove) {

				// Get ready for next frame by setting then=now, but...
				// Also, adjust for fpsInterval not being multiple of 16.67
				then = now - (elapsed % nextMove);

				// draw stuff here

				// TESTING...Report #seconds since start and achieved fps.
				sinceStart = now - startTime;
				currentFps = Math.round(1000 / (sinceStart / ++frame) * 100) / 100;

				// $results.text("Elapsed time= " + Math.round(sinceStart / 1000
				// * 100) / 100 + " secs @ " + currentFps + " fps.");
				canvasDrawer.renderText(ctxContent, currentFps, center.x, center.y - (watchRadius * 0.45), 15, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center'
				});
			}
		}
		function getDate() {
			datetime = tizen.time.getCurrentDateTime();
			hour = datetime.getHours();
			minute = datetime.getMinutes();
			second = datetime.getSeconds();
			dateArray.hour = hour;
			dateArray.minute = minute;
			dateArray.second = second;
			dateArray.date = date;
		}
		/**
		 * Draws the content of the watch
		 * 
		 * @private
		 */
		function drawWatchContent() {
			isAmbientMode = false;
			getDate();
			now = Date.now();

			// if enough time has elapsed, draw the next frame

			date = datetime.getDate();

			// nextMove = 1000 - dateHelper.getDate().getMilliseconds();
			if (motion !== null) 		{
				canvasDrawer.processMotion(motionFromGyro,ctxContent);
			}
			// Clear canvas
			ctxContent.clearRect(0, 0, ctxContent.canvas.width, ctxContent.canvas.height);
			canvasDrawer.renderBackground(ctxContent,ctxContent.canvas.width, ctxContent.canvas.height, "black",{gradient:true,motion:motion});
			canvasDrawer.renderGrid (ctxContent,  "#000000",2,{motion:motion});
			
			canvasDrawer.roundRect(ctxContent, center.x - (watchRadius * 0.70), center.y + (watchRadius * 0.06), 250, 70, 10, false, true, "#000000", "#000000");

			canvasDrawer.renderCircle(ctxContent, center, watchRadius * 1, "#000000",4);
			canvasDrawer.renderCircle(ctxContent, center, watchRadius * 0.90, "#000000",3);

			// Draw the dividers
			// 60 unit divider
			for (i = 1; i <= 60; i++) {
				angle = (i - 15) * (Math.PI * 2) / 60;
				 canvasDrawer.renderNeedle(ctxContent, angle, 0.96, 1.0, 1, "#c4c4c4");
			}

			// 12 unit divider
			for (j = 1; j <= 12; j++) {
				angle = (j - 3) * (Math.PI * 2) / 12;
				canvasDrawer.renderNeedle(ctxContent, angle,  0.90, 1, 5, "#c4c4c4");
			}
			


			canvasDrawer.renderText(ctxContent,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x + 108, center.y - 50, 25, "#c9c9c9", {
				font : 'FutureNow',
				align : 'right',
				gradient : true,
				motion: motion
				
			});
			canvasDrawer.renderTimeBis(ctxContent, dateArray, center.x + 33, center.y - 23, 53, "#c9c9c9", {
				gradient : true,
				motion: motion
				
			});
			canvasDrawer.renderText(ctxContent, dateArray.second, center.x + 135, center.y - 16, 25, "#c9c9c9", {
				font : 'FutureNow',
				align : 'center',
				gradient : true,
				motion: motion
				
			});
			if (heartRateFound && heartRate.getData().rate !== null) {
				canvasDrawer.renderText(ctxContent, heartRate.getData().rate, center.x, center.y + (watchRadius * 0.7), 25, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center',
					gradient : true,
					motion: motion
						
				});
				canvasDrawer.renderCircle(ctxContent, {
					x : center.x,
					y : center.y + (watchRadius * 0.7)
				}, 30, "#000000",2);

			}
			// Draw the text for date
			canvasDrawer.renderText(ctxContent, Math.round(batteryLevel) + '%', center.x, center.y - (watchRadius * 0.55), 15, "#c9c9c9", {
				font : 'FutureNow',
				align : 'center',
				gradient : true,
				motion: motion
			});

			//displayFps();
			drawWeather();
			canvasDrawer.renderTextGradient(ctxContent, 'Altitude :', center.x - (watchRadius * 0.71), center.y - (watchRadius * 0.17), 13, "#c9c9c9", {
				font : 'FutureNow',
				align : 'left',
				gradient : true,
				motion: motion
			});
			canvasDrawer.renderText(ctxContent, altitude, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.17), 13, "#c9c9c9", {
				font : 'FutureNow',
				align : 'right'
			});
			canvasDrawer.renderTextGradient(ctxContent, 'Pressure :', center.x - (watchRadius * 0.71), center.y - (watchRadius * 0.07), 13, "#c9c9c9", {
				font : 'FutureNow',
				align : 'left',
				gradient : true,
				motion: motion
			});

			canvasDrawer.renderText(ctxContent, pressure, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.07), 13, "#c9c9c9", {
				font : 'FutureNow',
				align : 'right'
			});
			/*animTimeout = setTimeout(function() {
				animRequest = window.requestAnimationFrame(drawWatchContent);
			}, nextMove);*/

			animRequest = requestAnimationFrame(drawWatchContent);
			// }, nextMove);
			// canvasDrawer.loop(ctxContent,ctxContent.canvas.width,
			// ctxContent.canvas.height);

		}
		function drawTimeContent(){
			
			
			
			
			animRequest = requestAnimationFrame(drawTimeContent);
		}
		
		function drawWeather() {
			if (weatherModel.isWeatherFound()) {

				weatherIcon = weatherModel.getMapping(weatherValue.weather[0].id, weatherValue.day);

				canvasDrawer.renderText(ctxContent, 'Temp', center.x - (watchRadius * 0.38), center.y + (watchRadius * 0.15), 14, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center',
						gradient : true,
						motion: motion
				});
				canvasDrawer.renderText(ctxContent, roundCoord(weatherValue.main.temp, 1) + "°", center.x - (watchRadius * 0.38), center.y + (watchRadius * 0.25), 15, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center'
				});
				canvasDrawer.renderTextGradient(ctxContent, textHelper.truncateBis(weatherValue.name, 26, '...'), center.x - (watchRadius * 0.48), center.y + (watchRadius * 0.33), 12, "#c9c9c9", {
					font : 'FutureNow',
					align : 'left',
					gradient : true
				});
				/*
				 * canvasDrawer.renderText(ctxContent,
				 * dateHelper.fancyTimeFormat((now/1000)-weatherValue.lastWeatherCallDate),
				 * center.x + (watchRadius * 0.45), center.y + (watchRadius *
				 * 0.30), 14, "#c9c9c9", { font : 'FutureNow', align : 'center'
				 * });
				 */
				canvasDrawer.renderText(ctxContent, textHelper.truncate(weatherValue.weather[0].main, 2), center.x - (watchRadius * 0.55), center.y + (watchRadius * 0.40), 14, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center',
					gradient : true,
					motion: motion
				});

			} else {
				weatherIcon = weatherModel.getMapping();
			}

			canvasDrawer.renderText(ctxContent, weatherIcon, center.x - (watchRadius * 0.58), center.y + (watchRadius * 0.12), 48, "#c9c9c9", {
				font : 'artill_clean_icons',
				align : 'center',
					gradient : true,
					motion: motion
			});

			if (weatherModel.isForecastFound()) {
				forecastValue = weatherModel.getForecast();
				forecastIndexX = center.x;
				for (var i = 0; i < 5; i++) {
					forecastHour = new Date(forecastValue.list[i].dt * 1000).getHours();
					canvasDrawer.renderText(ctxContent, forecastHour + "h", forecastIndexX, center.y + (watchRadius * 0.12), 13, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center'
					});
					canvasDrawer.renderText(ctxContent, weatherModel.getMapping(forecastValue.list[i].weather[0].id, forecastValue.list[i].day), forecastIndexX, center.y + (watchRadius * 0.16), 25,
							"#c9c9c9", {
								font : 'artill_clean_icons',
								align : 'center',gradient : true,
								motion: motion
							});
					canvasDrawer.renderText(ctxContent, ~~(forecastValue.list[i].main.temp) + "°", forecastIndexX + 3, center.y + (watchRadius * 0.28), 13, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center'
					});
					forecastIndexX = forecastIndexX + 25;
				}
			}

		}

		function roundCoord(coord, digit) {
			return parseFloat(coord).toFixed(digit);
		}
		/**
		 * Set default variables
		 * 
		 * @private
		 */
		function setDefaultVariables() {
			canvasLayout = document.querySelector("#canvas-layout");
			ctxLayout = canvasLayout.getContext("2d");
			canvasContent = document.querySelector("#canvas-content");
			ctxContent = canvasContent.getContext("2d");

			// Set the canvases square
			canvasLayout.width = document.body.clientWidth;
			canvasLayout.height = canvasLayout.width;
			canvasContent.width = document.body.clientWidth;
			canvasContent.height = canvasContent.width;

			center = {
				x : document.body.clientWidth / 2,
				y : document.body.clientHeight / 2
			};

			watchRadius = canvasLayout.width / 2;
			canvasDrawer.center = center;
			canvasDrawer.watchRadius = watchRadius;
			grdAmbiant = ctxContent.createLinearGradient(0, 0, watchRadius * 2, 0);
			grdAmbiant.addColorStop(0, "rgb(30,87,153)");
			grdAmbiant.addColorStop(0.3, "rgb(41,137,216)");
			grdAmbiant.addColorStop(0.6, "rgb(32,124,202)");
			grdAmbiant.addColorStop(1, "rgb(125,185,232)");
			isAmbientMode = false;
			//grdAmbiant.addColorStop(0, "#69d7db");
			//grdAmbiant.addColorStop(1, "#203fc9");
		}

		/**
		 * Handles 'models.heartRate.change' event.
		 * 
		 * @memberof views/main
		 * @private
		 * @param {object}
		 *            heartRateInfo
		 */
		function onHeartRateDataChange(heartRateInfo) {

			hearRateValue = heartRateInfo.detail.rate;

		}
		function onPedometerDataChange(pedometerInfo) {

			pedometerValue = {
				stepStatus : pedometerInfo.detail.stepStatus,
				speed : pedometerInfo.detail.speed,
				walkingFrequency : pedometerInfo.detail.walkingFrequency,
				accumulativeTotalStepCount : pedometerInfo.detail.accumulativeTotalStepCount,
				cumulativeCalorie : pedometerInfo.detail.cumulativeCalorie,
				cumulativeTotalStepCount : pedometerInfo.detail.cumulativeTotalStepCount
			};
		}
		/**
		 * Handles 'models.heartRate.change' event.
		 * 
		 * @memberof views/main
		 * @private
		 * @param {object}
		 *            heartRateInfo
		 */
		function onLocationDataChange(locationInfo) {
			if (typeof (locationInfo.detail.latitude) !== 'undefined') {
				locationValue = locationModel.getData();
			}
			// errorMsg = location.detail.errorMsg;

		}
		function onLocationPositionAquiered(data) {
			if (typeof (data.detail) !== 'undefined') {
				locationPositionAquiered = true;
			}
		}
		function onLowBattery() {
			// do something if battery < 4%
			// exit();
		}
		function onBatteryIsCharging() {
			// do something when battery is Charging
		}
		function onBatteryNotCharging() {
			// do something when battery is not Charging
		}
		function onBatteryChange(batteryInfo) {
			// do something if battery value change
			batteryLevel = batteryInfo.detail * 100;
		}
		function onHeartRateFound(bool) {
			heartRateFound = bool.detail;
		}

		/**
		 * Handles models.pressure.start event.
		 * 
		 * @private
		 */
		function onSensorStart() {
			// showCalibrationMonit();
		}

		/**
		 * Handles models.pressure.error event.
		 * 
		 * @private
		 * @param {object}
		 *            data
		 */
		function onSensorError(data) {
			var type = data.detail.type;
			/*
			 * if (type === 'notavailable') {
			 * openAlert(SENSOR_NOT_AVAILABLE_MSG); } else if (type ===
			 * 'notsupported') { openAlert(SENSOR_NOT_SUPPORTED_MSG); } else {
			 * openAlert(SENSOR_UNKNOWN_ERROR_MSG); }
			 */
		}

		/**
		 * Handles models.pressure.change event.
		 * 
		 * @private
		 * @param {Event}
		 *            ev
		 */
		function onPressureChange(ev) {
			updatePressureValue(ev.detail.average);

			updateAltitudeValue(ev.detail.altitude);
		}

		function onWeatherFound(event) {
			if (typeof (event.detail.weather) !== 'undefined') {
				weatherValue = event.detail;
				weatherFound = true;
			}
		}
		/**
		 * Updates current pressure value.
		 * 
		 * @private
		 * @param {number}
		 *            value
		 */
		function updatePressureValue(value) {
			pressure = parseFloat(value).toFixed(0);
		}

		/**
		 * Updates altitude value.
		 * 
		 * @private
		 * @param {number}
		 *            value
		 */
		function updateAltitudeValue(value) {
			// reference = settings.get('pressure');
			altitude = parseFloat(value).toFixed(0);
		}

		function drawAmbientWatch(e) {
			// Import the current time
			getDate();
			console.error('ambient');
			
			ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);
			ctxContent.clearRect(0, 0, ctxContent.canvas.width, ctxContent.canvas.height);
			canvasDrawer.renderTimeBis(ctxContent, dateArray, center.x - 20 +textHelper.getRandomInt(-10,10), center.y+ textHelper.getRandomInt(-10,10), 100, grdAmbiant,{
				align : 'center'
			});
			canvasDrawer.renderText(ctxContent,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x +10 + textHelper.getRandomInt(-10,10), center.y - 80+ textHelper.getRandomInt(-10,20), 25, "#c9c9c9", {
				font : 'FutureNow',
				align : 'center',
				gradient : true
			});
			if (heartRateFound && heartRate.getData().rate !== null) {
				canvasDrawer.renderCircle(ctxContent, {
					x : center.x,
					y : center.y + (watchRadius * 0.60)
				}, 45, grdAmbiant,2);

				
				canvasDrawer.renderText(ctxContent, heartRate.getData().rate, center.x, center.y + (watchRadius * 0.60), 30, grdAmbiant, {
					font : 'FutureNow',
					align : 'center'
				});
			}
			/*animRequest = window.requestAnimationFrame(function() {
				drawAmbientWatch(null);
			});*/

		}


		/**
		 * Registers event listeners.
		 * 
		 * @memberof views/canvas
		 * @private
		 */
		function onDeviceMotion(event) {
			if (!isAmbientMode) 			motion = event;
		}
		function onMotionError(event){
			console.error(event.detail.type);
		}
		function onMotionChange(SensorAccelerationData){
			console.log(SensorAccelerationData.detail);
			motionFromGyro.accelerationIncludingGravity = SensorAccelerationData.detail.accelerationIncludingGravity;
			motion = motionFromGyro;
		}
		
		function activateMode(type) {
			// Stop the animation before mode changing
			if (animTimeout) {
				window.clearTimeout(animTimeout);
			}
			if (animRequest) {
				window.cancelAnimationFrame(animRequest);
			}

			switch (type) {
			case "Ambient":
				// Normal -> Ambient
				console.error('activateMode ambiant');
				if (motionSensor.isAvailable() && motionSensor.isStarted()) {
					motionSensor.stop();
				}
				if (pressureSensor.isAvailable() && pressureSensor.isStarted()) {
					pressureSensor.stop();
				}
				isAmbientMode = true;
				drawAmbientWatch(null);
				
				break;
			case "Normal":
				// Ambient -> Normal
				then = Date.now();
				startTime = then;
				frame = 0;
				if (motionSensor.isAvailable() && !motionSensor.isStarted()) {
					motionSensor.start();
				}
				if (pressureSensor.isAvailable() && !pressureSensor.isStarted()) {
					pressureSensor.start();
				}
				isAmbientMode = false;
				console.error('activateMode normal');
				
				
				
				drawWatchLayout();
				/*animRequest = window.requestAnimationFrame(function() {
					drawWatchContent();
				});
*/				
				animRequest = requestAnimationFrame(drawWatchContent);
				break;
			default:
				break;
			}
		}
		
		
		function bindEvents() {

			window.addEventListener("timetick", function (){
				console.error('timetick');
				if (isAmbientMode) {
					drawAmbientWatch();
				}
			});

			window.addEventListener("ambientmodechanged", function(e) {
				console.error('ambientmodechanged');
				if (e.detail.ambientMode === true) {
					// Rendering ambient mode case
					activateMode("Ambient");
				} else {
					// Rendering normal case
					activateMode("Normal");

				}
			});
			
			event.on("visibilitychange", function(e) {
				console.error('visibilitychange');
				if (!document.hidden) {
					if (isAmbientMode === true) {
						// Rendering ambient mode case
						activateMode("Ambient");
					} else {
						// Rendering normal case
						activateMode("Normal");
					}
				}
			});
			event.on({
				'core.systeminfo.battery.low' : onLowBattery,
				'core.systeminfo.battery.isCharging' : onBatteryIsCharging,
				'core.systeminfo.battery.notCharging' : onBatteryNotCharging,
				'core.systeminfo.battery.change' : onBatteryChange,
				'models.heartRate.change' : onHeartRateDataChange,
				'models.heartRate.HRFound' : onHeartRateFound,
				'models.location.change' : onLocationDataChange,
				'models.location.found' : onLocationPositionAquiered,
				'models.pressure.start' : onSensorStart,
				'models.pressure.error' : onSensorError,
				'models.pressure.change' : onPressureChange,
				'models.motion.change' : onMotionChange,
				'models.motion.error' : onMotionError,
				'models.pedometer.change' : onPedometerDataChange,
				'models.weather.found' : onWeatherFound
			});
			sysInfo.listenBatteryLowState();
			sysInfo.listenBatteryChange();
		}

		/**
		 * Initializes module.
		 * 
		 * @memberof views/canvas
		 * @public
		 */
		function checkHR() {
//			console.error('checkHR');
			hrIntervalStop = window.setInterval(function() {
				//console.error('hrIntervalStop loop');
//				console.error(heartRate.getData().rate);
				if (heartRate.getData().rate !== null) {
					window.clearInterval(hrInterval);
					window.clearInterval(hrIntervalStop);
					heartRate.stop();
					doNotMkHR = false;
					mkHR();

				} else {
					doNotMkHR = true;
				}
			}, 5000);
		}
		function mkHR() {
			window.clearInterval(hrIntervalStop);
//			console.error('mkHR');
			hrInterval = window.setInterval(function() {
//				console.error('hrInterval loop');
				if (!doNotMkHR) {
					heartRate.start();
					checkHR();
				}

			}, intervals.heartRate);
		}
		function mkLocation() {
			locationModel.start();

			window.setTimeout(function() {
				locationModel.stop();
			}, 20000 // stop checking after 15 seconds
			);

			locationInterval = window.setInterval(function() {
				locationModel.start();
				window.setTimeout(function() {
					locationModel.stop();
				}, 20000 // stop checking after 10 seconds
				);
			}, intervals.location // check every 2 min
			);
		}
		function init() {
			nextMove = 1000 / fps;
			then = Date.now();
			startTime = then;
			bindEvents();
			setDefaultVariables();
	
			
			//motionSensor.init();
			
			
			
			
			mkHR();
			mkLocation();
			
			if (motionSensor.isAvailable()) {
				motionSensor.setOptions({
					sampleInterval : 50,
					maxBatchCount : 1000
				});
				motionSensor.setChangeListener();
				motionSensor.start();
			}
			
			
			if (pressureSensor.isAvailable()) {
				pressureSensor.setOptions({
					sampleInterval : 1000,
					maxBatchCount : intervals.pressure
				});
				pressureSensor.setChangeListener();
				pressureSensor.start();
			}
			sysInfo.checkBattery();
			
			
			drawWatchLayout();
			animRequest = window.requestAnimationFrame(drawWatchContent);
			/*animTimeout = setTimeout(function() {
				animRequest = window.requestAnimationFrame(drawTimeContent);
			}, 1000);*/
			
		}

		return {
			init : init
		};
	}

});
