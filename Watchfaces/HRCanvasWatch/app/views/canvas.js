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
 * @requires {@link models/calendar}
 * @namespace views/canvas
 * @memberof views
 */

define({
	name : 'views/canvas',
	requires : [ 'core/event',
	             'core/systeminfo', 
	             'views/radial', 
	             'helpers/date', 
	             'helpers/text',  
	             'models/motion',
	             'models/settings', 
	             'models/canvasDrawer', 
	             'models/heartRate', 
	             'models/location', 
	             'models/pressure', 
	             'models/weather', 
	             'models/pedometer',
	             'models/calendar' ],
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
		var pedometerSensor = req.models.pedometer;
		var locationModel = req.models.location;
		var weatherModel = req.models.weather;
		var calendarModel = req.models.calendar;
		var radialmenu = req.views.radial;
		var gravSensor  = null;

		var canvasDrawer = req.models.canvasDrawer;
		var sysInfo = req.core.systeminfo;
		var canvasBackground, canvasParticles, canvasContent, canvasFinal,  center, watchRadius, forecastIndexX, forecastHour;
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
		var locationInterval = null, pedometerInterval = null, hrInterval = null, weatherInterval = null, hrIntervalStop = null, pressureInterval = null;
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
			location : 600000,
			heartRate : 10000,
			weather : 3600000,
			pressure : 60000
		};
		var grd,grdAmbiant, i, j, startTime, now, then, elapsed, sinceStart, frame = 0, currentFps, isAmbientMode, rotate = false;
		var motion = null;
		var motionFromGyro = {accelerationIncludingGravity : {x:null,y:null}}; 
		
		var max_particles = 600;
		var particles = [];
		var flames = [];
		var frequency = 3;
		var init_num = max_particles;
		var max_time = frequency * max_particles;
		var time_to_recreate = false;
		var gravCenter = {x:180, y:180};
		var clickPos = null;
		var radialButton = null;
		var drawTicks = false;
		var particleColors = ["#694FB9","#6094ee","#3CFBFF"];
		var deg = {x:0,y:0}; 
		var elem;
		const CLICK_INTERVAL = 300;
		var lastClickTimeStamp = null, currentClickTimeStamp = null;
		
		var forecastDisplayed = false; 
		var forecastMode = false; 
		var wShape , aShape1, aShape2, aShape3, aShape4,appDrawerShape, calendarShape, hrShape; 
		var secondsPassed = 0;
		var oldTimeStamp = 0;
		var miniCalendarDisplayed = true, miniWeatherDisplayed= true;
		var widgetFullScreenDiplayed = false, backendLoaded = false; 
		var baroDisplayed = true;
		var timeDisplayed = true;
		var heartRateDisplayed=true;
		var holder = document.querySelector("#widget_holder");
		var calendar = document.querySelector("#calendar");
		
		var up = document.getElementById ('up');
		var down = document.getElementById ('down');
		var calendarY = 0;
		
		var wCoords=null;
		var theme = 'ice';
		var effect = 'attraction';
		
		
		function handleClick(canvas,ev) {
			navigator.vibrate(0);
			currentClickTimeStamp = Date.now();
			/*if (lastClickTimeStamp !== null && currentClickTimeStamp - lastClickTimeStamp <= CLICK_INTERVAL) {
				handleDoubleClick(canvas,ev);
			} else {
				
			}*/
			lastClickTimeStamp = currentClickTimeStamp;
			handleSingleClick(canvas,ev);
		}

		/*function handleDoubleClick(canvas,ev) {
			
			console.log('handleDoubleClick');
			
		}*/
		function changeRootColors(theme){
			console.log(theme);
			let sheet  = document.styleSheets[1];
			
			switch (theme) {
			case 'fire':
				//sheet.deleteRule(1);
				//sheet.insertRule(":root{--color1:rgb(255,150,53);--color2:rgb(249,234,194);}",1);
				document.querySelector(":root").style.setProperty('--color1', 'rgb(255,150,53)');
				document.querySelector(":root").style.setProperty('--color2', 'rgb(249,234,194)');
				break;
			case 'hisakura':
				//sheet.deleteRule(1);
				//sheet.insertRule(":root{--color1:rgb(229,72,72);--color2:rgb(251,232,232);}",1);
				document.querySelector(":root").style.setProperty('--color1', 'rgb(229,72,72)');
				document.querySelector(":root").style.setProperty('--color2', 'rgb(251,232,232)');
				break;		
			case 'ice':
				//sheet.deleteRule(1);
				//sheet.insertRule(":root{--color1:blue;--color2:cyan;}",1); 
				document.querySelector(":root").style.setProperty('--color1', 'rgb(38,55,180)');
				document.querySelector(":root").style.setProperty('--color2', 'rgb(192,221,243)');
				break;
			default:
				//sheet.deleteRule(1);
				//sheet.insertRule(":root{--color1:blue;--color2:cyan;}",1); 
				document.querySelector(":root").style.setProperty('--color1', 'rgb(149,149,149)');
				document.querySelector(":root").style.setProperty('--color2', 'rgb(244,244,244)');
				break;
			}
		}
		function handleSingleClick(canvas,ev) {
			console.log('handleSingleClick');
			clickPos = getMousePosition(canvas,ev);
			
			console.log(clickPos);
			if (appDrawerShape.isInSurface(clickPos,10)){
				canvasDrawer.startFade();
				openRadialMenu(ev);
				
				radialmenu.setOpen();
			}
			else if (wShape.isInSurface(clickPos,0) && !radialmenu.getOpen()  ){
				
				if (forecastMode){
					forecastDisplayed = false;
				}
				else {
					miniCalendarDisplayed= false;
				}
				animateWeatherSection();
			}
			else if (calendarShape.isInSurface(clickPos,0) && !forecastDisplayed && !radialmenu.getOpen() ){
				console.log('Click fade');
				canvasDrawer.startFade();
				
				setClassAndWaitForTransition(holder,'on','opacity').then(function () {
					console.log('transition holder');
					holder.setAttribute('class', 'on');
					
					changeRootColors(theme);
					setClassAndWaitForTransition(calendar,'on','opacity').then(function () {
						console.log('transition calendar');
						
						calendar.setAttribute('class', 'on');
						holder.setAttribute('class', 'on');  
						widgetFullScreenDiplayed = true;
					});
		            
		            
		        });
				
			  	
			}
			else if (hrShape.isInSurface(clickPos,5) && !radialmenu.getOpen()  ){
				
				tizen.application.launch("com.samsung.shealth", null,null);
			}
			
		}
		function triggerShowWatch(){
			
			canvasDrawer.startShow();
		}
		function animateWeatherSection(){
			//weatherSectionAnimating = true;
			wShape.animate();
		}
		function handleWatchFadingAnimation(){
			if (canvasDrawer.isFading()){
				canvasDrawer.fade(secondsPassed,0.5);
			}
			
		}
		function handleWatchShowingAnimation(){
			if (canvasDrawer.isShowing()){
				canvasDrawer.show(secondsPassed,0.5);
				if (!canvasDrawer.isShowing()){
					//backendLoaded = true;
				}
			}
			
		}
		function handleWeatherSectionAnimation(){
			if (wShape.isAnimating()){
				if (!forecastMode){
					wShape.growRight(secondsPassed,100,250,0.2);
					if (!wShape.isAnimating()){
						toogleForecastMode();
						forecastDisplayed = true;
					}
				}
				else {
					wShape.shrinkRight(secondsPassed,250,100,0.2);
					
					if (!wShape.isAnimating()){
						miniCalendarDisplayed = true;
						toogleForecastMode();
					}
				}
			}
			
			
		}
		function toogleForecastMode(){
			if  (!forecastMode){
				forecastMode = true;
			}
			else {
				forecastMode = false;
			}
		}
		function openRadialMenu(ev) {
			
			radialmenu.getMenu().open();
			event.fire('openRadialMenu', ev);
		}
		function getMousePosition(canvas, event) { 
            let rect = canvas.getBoundingClientRect(); 
            let x = event.clientX - rect.left; 
            let y = event.clientY - rect.top; 
            return {x:x,y:y} ;
        } 
		/**
		 * Draws the basic layout of the watch
		 * 
		 * @private
		 */
		function drawWatchLayout() {
			console.log('DrawLayout');
			// Clear canvas
			/**@todo */
			canvasBackground.context.clearRect(0, 0, canvasBackground.canvas.width, canvasBackground.canvas.height);
			//
			canvasDrawer.renderText(canvasBackground.context, "AZO WATCH v.1", center.x, center.y - (watchRadius * 0.7), 13, "#c9c9c9", {
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
				// * 100) / 100 + " secs @ " + currentFps + " fps.");  currentFps
				canvasDrawer.renderText(canvasContent.context, particles.length, center.x, center.y - (watchRadius * 0.45), 15, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center'
				});
			}
		}
		function getDate() {
			datetime = new Date();
			
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
		function drawWatchContent(timeStamp) {
			isAmbientMode = false;
			getDate();
			now = Date.now();
			
			secondsPassed = (timeStamp - oldTimeStamp) / 1000;
		    oldTimeStamp = timeStamp;
		    
		    handleWeatherSectionAnimation();
		    handleWatchFadingAnimation();
		    handleWatchShowingAnimation();

			date = datetime.getDate();
			if (motion !== null) 		{
				canvasDrawer.processMotion(motionFromGyro,canvasContent.context);
			}
			gravCenter = canvasDrawer.getRadialGradientCoords();
			
			if (radialmenu.getOpen()){ 
				deg.x = (gravCenter.y - 190)*1.2;
				deg.y = (gravCenter.x - 180)*1.2;
				if (deg.x <= -15 ) deg.x = -15;
				if (deg.x >= 15 ) deg.x = 15;
				if (deg.y <= -15 ) deg.y = -15;
				if (deg.y >= 15 ) deg.y = 15;
				
				elem = document.querySelector("div.menuHolder"); 
				elem.style.transform =
				    "perspective(700px) rotateX(" + -deg.x + "deg) " + 
				    " rotateY(" + deg.y + "deg)";
				
				  
			}
			if (widgetFullScreenDiplayed ===true){
				deg.x = (gravCenter.y - 190)*1;
				deg.y = (gravCenter.x - 180)*1;
				if (deg.x <= -20 ) deg.x = -20;
				if (deg.x >= 20 ) deg.x = 20;
				if (deg.y <= -20 ) deg.y = -20; 
				if (deg.y >= 20 ) deg.y = 20; 
				//document.querySelector("#calendar.on").style.opacity=1;
				let calendarOn = document.querySelector("div#calendar");
				//if (calendarOn.style.opacity < 1) calendarOn.style.opacity = 1;
				
				calendarOn.style.transform =    
					"perspective(700px) rotateX(" + -deg.x + "deg) " +    
					" rotateY(" + deg.y + "deg)";
					
				
			}
			if (!isAmbientMode){
				particles = particles.filter(function (p) {
					
					p.setPoA(gravCenter); 
					return p.move();
				});
				if (time_to_recreate) {
				    if (particles.length < init_num) {popolate((init_num-particles.length)/2,effect);}
				  }
				  
			}
			clear();
			
			  // Recreate particles
			  
			  //console.log(particles.length );
//			  flames = flames.filter(function(p) {
//				    return p.move();
//				  });
			  
			
			
			 
			
			
			
			
			canvasDrawer.renderBackground(canvasContent.context,canvasContent.canvas.width, canvasContent.canvas.height, "black",{gradient:true,motion:motion});
			
			canvasDrawer.renderCircle(canvasContent.context,  new Circle(center.x,center.y,watchRadius -2) ,null,null,true,2,true);
			
			  

			
			
			
			if (backendLoaded){
				canvasDrawer.renderCircleShadows(canvasContent.context, appDrawerShape, {r:15,g:15,b:15,a:0.7},5);
				canvasDrawer.renderCircle(canvasContent.context, appDrawerShape, "#000000","rgba(10, 10, 10,0.7)",false,2,false);
				canvasDrawer.roundRect(canvasContent.context, aShape1, 3, false, true, null, "rgba(0, 0, 0,0.8)");
				canvasDrawer.roundRect(canvasContent.context, aShape2, 3, false, true, null, "rgba(0, 0, 0,0.8)");
				canvasDrawer.roundRect(canvasContent.context, aShape3, 3, false, true, null, "rgba(0, 0, 0,0.8)");
				canvasDrawer.roundRect(canvasContent.context, aShape4, 3, false, true, null, "rgba(0, 0, 0,0.8)");
				if (baroDisplayed){
					
					canvasDrawer.roundRect(canvasContent.context, new Shape(center.x - 112, center.y - 63, 85, 58) ,10, true, false, null, "rgba(5, 5, 5,0.7)"); // 232
					
					canvasDrawer.renderTextGradient(canvasContent.context, 'Altitude', center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.30), 16, "#c9c9c9", {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion
					});
					canvasDrawer.renderText(canvasContent.context, altitude, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.23), 16, "#c9c9c9", {
						font : 'FutureNow',
						align : 'right'
					});
					canvasDrawer.renderTextGradient(canvasContent.context, 'Pressure', center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.16), 16, "#c9c9c9", {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion 
					});

					canvasDrawer.renderText(canvasContent.context, pressure, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.09), 16, "#c9c9c9", {
						font : 'FutureNow',
						align : 'right'
					});
				}
				
				
				if (timeDisplayed){
					// Battery
					canvasDrawer.renderText(canvasContent.context, Math.round(batteryLevel) + '%', center.x+94, center.y - (watchRadius * 0.4), 17, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
					});
					canvasDrawer.renderText(canvasContent.context,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x + 108, center.y - 50, 25, "#c9c9c9", {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion
						
					});
					//canvasDrawer.renderTimeBisShadows (canvasContent.context, dateArray, center.x + 33, center.y - 23, 53, {r:40,g:40,b:40,a:0.9},5);
					canvasDrawer.renderTimeBis(canvasContent.context, dateArray, center.x + 33, center.y - 23, 53, "#c9c9c9", {
						gradient : true,
						motion: motion,
						stroke:false
						
					});
					canvasDrawer.renderText(canvasContent.context, dateArray.second, center.x + 138, center.y - 16, 25, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
						
					});
				}
				
				
				
				if (miniWeatherDisplayed){
					
					canvasDrawer.roundRectShadows(canvasContent.context, wShape,10, {r:10,g:10,b:10,a:0.7},5);
					canvasDrawer.roundRect(canvasContent.context, wShape,10, true, false, null, "rgba(5, 5, 5,0.7)");
					drawWeather(forecastDisplayed);
				}
				
				
				if (miniCalendarDisplayed) {
					canvasDrawer.roundRectShadows(canvasContent.context, calendarShape,10, {r:10,g:10,b:10,a:0.7},5);
					canvasDrawer.roundRect(canvasContent.context, calendarShape,10, true, false, null, "rgba(5, 5, 5,0.7)");
					canvasDrawer.renderText(canvasContent.context, 'Events', calendarShape.getCoords().x+50, calendarShape.getCoords().y+20, 25, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
							gradient : true, 
							motion: motion
					});
					canvasDrawer.renderText(canvasContent.context, calendarModel.getVEvents().length , calendarShape.getCoords().x+50, calendarShape.getCoords().y+50, 30, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center'
					});
					
				}
				canvasDrawer.renderCircleShadows(canvasContent.context, hrShape, {r:15,g:15,b:15,a:0.7},5);
				canvasDrawer.renderCircle(canvasContent.context, hrShape, "#000000","rgba(10, 10, 10,0.7)",false,1.5,false);
				if (heartRateDisplayed &&  heartRateFound && heartRate.getData().rate !== null) {
					
					
					canvasDrawer.renderText(canvasContent.context, heartRate.getData().rate, center.x , center.y + (watchRadius * 0.67), 25, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});

				}
				else {
					canvasDrawer.renderText(canvasContent.context, '-', center.x , center.y + (watchRadius * 0.67), 25, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});
				}
				
				if (pedometerSensor.getActive() === true){
					canvasDrawer.renderText(canvasContent.context, pedometerSensor.getData().accumulativeTotalStepCount, center.x - (watchRadius * 0.3), center.y + (watchRadius * 0.6), 22, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});
				}
			}
			
			
			

			
			
			

			//displayFps();
			
			//canvasDrawer.maskCanvas(canvasContent,canvasParticles,canvasFinal);
			
			//setTimeout(function (){
				animRequest = requestAnimationFrame(drawWatchContent);
			//},25);
			
	

		}
		
		
		
		
		function drawWeather() {
			if (forecastMode){
				wCoords = { text1 : {x:center.x - (watchRadius * 0.38),y:center.y + (watchRadius * 0.15),size: 15},
						   temp : {x:center.x - (watchRadius * 0.38),y:center.y + (watchRadius * 0.24),size: 16},
						   city : {x:center.x - (watchRadius * 0.65),y:center.y + (watchRadius * 0.33),size: 12},
						   text2: {x:center.x - (watchRadius * 0.67),y:center.y + (watchRadius * 0.40),size: 13},
						   icon : {x:center.x - (watchRadius * 0.58),y:center.y + (watchRadius * 0.14),size: 52}
				};
			}
			else {
				wCoords = { text1 : {x:center.x - (watchRadius * 0.31),y:center.y + (watchRadius * 0.16),size: 21},
						   temp : {x:center.x - (watchRadius * 0.30),y:center.y + (watchRadius * 0.28),size: 22},
						   city : {x:center.x - (watchRadius * 0.65),y:center.y + (watchRadius * 0.33),size: 12},
						   text2: {x:center.x - (watchRadius * 0.67),y:center.y + (watchRadius * 0.39),size: 18},
						   icon : {x:center.x - (watchRadius * 0.56),y:center.y + (watchRadius * 0.14),size: 62}
				};
			}
			if (weatherModel.isWeatherFound()) {

				weatherIcon = weatherModel.getMapping(weatherValue.weather[0].id, weatherValue.day);
				
				canvasDrawer.renderText(canvasContent.context, 'Temp', wCoords.text1.x, wCoords.text1.y, wCoords.text1.size, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center',
						gradient : true,
						motion: motion
				});
				canvasDrawer.renderText(canvasContent.context, roundCoord(weatherValue.main.temp, 1) + "°", wCoords.temp.x, wCoords.temp.y, wCoords.temp.size, "#c9c9c9", {
					font : 'FutureNow',
					align : 'center'
				});
				if (forecastMode){
					//city weatherValue.name
					canvasDrawer.renderTextGradient(canvasContent.context, textHelper.truncateBis(weatherValue.name, 12, '...'), wCoords.city.x, wCoords.city.y, wCoords.city.size, "#c9c9c9", {
						font : 'FutureNow',
						align : 'left',
						gradient : true
					});
					/*
					  canvasDrawer.renderText(canvasContent.context,
					  dateHelper.fancyTimeFormat((now/1000)-weatherValue.lastWeatherCallDate),
					  center.x + (watchRadius * 0.45), center.y + (watchRadius *  0.30), 14, "#c9c9c9", { font : 'FutureNow', align : 'center'  });*/
					 
					//weather text
				}
				
				canvasDrawer.renderText(canvasContent.context, textHelper.truncateBis(weatherValue.weather[0].main, (!forecastMode)?8:12,'...'), wCoords.text2.x, wCoords.text2.y, wCoords.text2.size, "#c9c9c9", {
					font : 'FutureNow',
					align : 'left',
					gradient : true,
					motion: motion
				});

			} else {
				weatherIcon = weatherModel.getMapping();
			}

			canvasDrawer.renderText(canvasContent.context, weatherIcon, wCoords.icon.x,wCoords.icon.y, wCoords.icon.size, "#c9c9c9", {
				font : 'artill_clean_icons',
				align : 'center',
					gradient : true,
					motion: motion
			});

			if (weatherModel.isForecastFound() && forecastDisplayed) {
				forecastValue = weatherModel.getForecast();
				forecastIndexX = center.x-18;
				for (var i = 0; i < 5; i++) {
					forecastHour = new Date(forecastValue.list[i].dt * 1000).getHours();
					canvasDrawer.renderText(canvasContent.context, forecastHour + "h", forecastIndexX, center.y + (watchRadius * 0.15), 15, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center'
					});
					canvasDrawer.renderText(canvasContent.context, weatherModel.getMapping(forecastValue.list[i].weather[0].id, forecastValue.list[i].day), forecastIndexX, center.y + (watchRadius * 0.22), 31,
							"#c9c9c9", {
								font : 'artill_clean_icons',
								align : 'center',gradient : true,
								motion: motion
							});
					canvasDrawer.renderText(canvasContent.context, ~~(forecastValue.list[i].main.temp) + "°", forecastIndexX + 3, center.y + (watchRadius * 0.37), 15, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center'
					});
					forecastIndexX = forecastIndexX + 30;
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
			//canvasParticles = canvasDrawer.createCanvas({id:'canvas-particles',width:360,height:360});
			canvasContent = canvasDrawer.createCanvas({id:'canvas-content',width:360,height:360});
			//canvasFinal = canvasDrawer.createCanvas({id:'canvas-final',width:360,height:360});
			
			//canvasContent.context = canvasContent.getContext("2d");

			// Set the canvases square
			//canvasContent.width = document.body.clientWidth;
			//canvasContent.height = canvasContent.width;
			
			center = {
				x : document.body.clientWidth / 2,
				y : document.body.clientHeight / 2
			};

			watchRadius = canvasContent.canvas.width / 2;
			canvasDrawer.center = center;
			canvasDrawer.watchRadius = watchRadius;
			grdAmbiant = canvasDrawer.getAmbiantGradient(canvasContent.context);
			//grdAmbiant = canvasContent.context.createLinearGradient(0, 0, watchRadius * 2, 0);
			
			isAmbientMode = false;
			//grdAmbiant.addColorStop(0, "#69d7db");
			//grdAmbiant.addColorStop(1, "#203fc9");
			if (forecastDisplayed){
				wShape= new Shape(center.x - 126, center.y + (watchRadius * 0.06), 250, 70);
			}
			else {
				wShape= new Shape(center.x - 126, center.y + (watchRadius * 0.06), 100, 70);
			}
			calendarShape = new Shape(center.x + 26, center.y + (watchRadius * 0.06), 100, 70);
			
			aShape1= new Shape(center.x - 16, center.y - 116 , 13, 13);
			aShape2= new Shape(center.x + 3, center.y - 116, 13, 13);
			aShape3= new Shape(center.x - 16, center.y - 134, 13, 13);
			aShape4= new Shape(center.x + 3, center.y - 134, 13, 13); 
			//drawWatchLayout();

			appDrawerShape = new Circle(center.x,center.y-119,28);
			hrShape = new Circle(center.x,center.y + (watchRadius * 0.67),28);
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
			event.fire ('log','onPedometerDataChange');
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
			altitude = parseFloat(value).toFixed(1);
		}

		function drawAmbientWatch(e) {
			// Import the current time
			getDate();
			console.log('ambient');
			canvasDrawer.setOpacity(1);
			//canvasBackground.context.clearRect(0, 0, canvasBackground.canvas.width, canvasBackground.canvas.height);
			/**@todo */
			//clear();
			canvasContent.context.clearRect(0, 0, canvasContent.canvas.width, canvasContent.canvas.height);
			canvasDrawer.renderTimeBis(canvasContent.context, dateArray, center.x - 20 +textHelper.getRandomInt(-10,10), center.y+ textHelper.getRandomInt(-10,10), 100, grdAmbiant,{
				align : 'center'
			});
			canvasDrawer.renderText(canvasContent.context,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x +10 + textHelper.getRandomInt(-10,10), center.y - 80+ textHelper.getRandomInt(-10,20), 25, "#c9c9c9", {
				font : 'FutureNow',
				align : 'center',
				gradient : true
			});
			if (heartRateFound && heartRate.getData().rate !== null) {
				
				canvasDrawer.renderCircle(canvasContent.context, new Circle(center.x,center.y + (watchRadius * 0.60),45), grdAmbiant,false,true,2,false);

				
				canvasDrawer.renderText(canvasContent.context, heartRate.getData().rate, center.x, center.y + (watchRadius * 0.60), 30, grdAmbiant, {
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
			if (!isAmbientMode) 			{
				motion = event;
				
			}
		}
		function onMotionError(event){
			console.error(event.detail.type);
		}
		function onMotionChange(SensorAccelerationData){
			//console.log(SensorAccelerationData.detail);
			//motionFromGyro.accelerationIncludingGravity = getSensorValueAvg();
			motionFromGyro.accelerationIncludingGravity = SensorAccelerationData.detail.accelerationIncludingGravity;
			motion = motionFromGyro;
		}
		function onMotionChangeNew(){
			
			motionFromGyro.accelerationIncludingGravity = motionSensor.getSensorValueAvg().accelerationIncludingGravity;
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
				console.log('activateMode ambiant');
				stopSensors();
				isAmbientMode = true;
				drawAmbientWatch(null);
				
				break;
			case "Normal":
				// Ambient -> Normal
				then = Date.now();
				startTime = then;
				frame = 0;
				startSensors();
				isAmbientMode = false;
				
				console.log('activateMode normal');
				
				
				
				//drawWatchLayout();
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
		
		function startSensors(){
			
			if (motionSensor.isAvailable() && !motionSensor.isStarted()) {
				motionSensor.start();
			}
			/*
				if (pressureSensor.isAvailable() && !pressureSensor.isStarted()) {
					pressureSensor.start();
					pressureInterval = window.setInterval(function(e) {
						pressureSensor.start();
					},intervals.pressure
					);
				}
			*/
			
		}
		function stopSensors(){
			if (motionSensor.isAvailable() && motionSensor.isStarted()) {
				motionSensor.stop();
			}
			/*
			if (pressureSensor.isAvailable() && pressureSensor.isStarted()) {
				pressureSensor.stop();
				window.clearInterval(pressureInterval);
			}
			*/
		}
		function closeCalendarMenu(){
			widgetFullScreenDiplayed = false;
			calendar = document.querySelector("#calendar");
			holder = document.querySelector("#widget_holder");
			
			/*setClassAndWaitForTransition(calendar,'off','visibility').then(function () {
				console.log('transition calendar off');
				//calendarOn.style.opacity = 0;
				*/
			document.querySelector("#calendar").style.transform =    
				"perspective(700px) rotateY(0deg) translateY(50px) translateX(50px)  scale(0.35)";
			if (document.querySelector("#calendar.on") != null)	document.querySelector("#calendar.on").style.transform =    
				"perspective(700px) rotateY(0deg) translateY(50px) translateX(50px)  scale(0.35)";
				setClassAndWaitForTransition(calendar,'','opacity').then(function () {
					console.log('transition calendar');
					setClassAndWaitForTransition(holder,'','opacity').then(function () {
						
						console.log('transition holder');
					});
				});
				
				//calendar.style.transform =    "perspective(700px) rotateX(0deg) rotateY(90deg) rotateZ(90deg)"; 
				
	      // });
		}
		function bindEvents() {
			document.getElementById('canvas-final').addEventListener('click', function(e) {
				handleClick(this,e);
			});
			
			up = document.getElementById ('up');
			down = document.getElementById ('down');
			calendar.addEventListener('click', function(e) {
				 if (e.target !== this && e.target != document.querySelector("#overflower"))
					    return;
				canvasDrawer.startShow();
				closeCalendarMenu();
			}); 
			
			up.addEventListener('click', function(e) {
				console.log('up'); 
				calendarY = document.getElementById ('overflower').scrollTop-80;
				console.log(document.getElementById ('overflower').scrollTop);
				//document.getElementById ('overflower').scrollTop = calendarY;
				canvasDrawer.scrollTop(document.getElementById ('overflower'),-100,500); 
			});
			down.addEventListener('click', function(e) {
				console.log('down');
				calendarY = document.getElementById ('overflower').scrollTop+80;
				//document.getElementById ('overflower').scrollTop = calendarY+80;
				canvasDrawer.scrollTop(document.getElementById ('overflower'),100,500); 
			});
			
			window.addEventListener("timetick", function (){
				console.log('timetick');
				if (isAmbientMode) {
					drawAmbientWatch();
				}
			});

			window.addEventListener("ambientmodechanged", function(e) {
				console.log('ambientmodechanged event');
				if (e.detail.ambientMode === true) {
					// Rendering ambient mode case
					if (radialmenu.getOpen()){
						radialmenu.closeMenu();
					}
					closeCalendarMenu();
					activateMode("Ambient");
				} else {
					// Rendering normal case
					
					activateMode("Normal");
					canvasDrawer.startShow(); 

				}
			});
			
			event.on("visibilitychange", function(e) {
				console.log('visibilitychange event');
				if (!document.hidden) {
					if (isAmbientMode === true) {
						// Rendering ambient mode case
						
						if (radialmenu.getOpen()){
							radialmenu.closeMenu();
						}
						closeCalendarMenu();
						activateMode("Ambient");
						
					} else {
						// Rendering normal case
						canvasDrawer.startShow(); 
						activateMode("Normal"); 
					}
				}
				else {
					if (radialmenu.getOpen()){
						radialmenu.closeMenu();
					}
					closeCalendarMenu();
					if (isAmbientMode !== true) {
						//event.fire ('hidden','clearScreen');
						//canvasBackground.context.clearRect(0, 0, canvasBackground.context.canvas.width, canvasBackground.context.canvas.height);
						/**@todo */
						//clear();
						canvasContent.context.clearRect(0, 0, canvasContent.canvas.width, canvasContent.canvas.height);
						canvasDrawer.setOpacity(0);
						stopSensors();
					}
					else {
						canvasDrawer.setOpacity(1);
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
				'views.radial.changeTheme' : changeTheme,
				'views.radial.changeEffect' : changeEffect,
				'views.radial.close' : triggerShowWatch,
				'RadialMenu.closing' : triggerShowWatch,
				//'models.pedometer.change' : onPedometerDataChange,
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

		function mkHR() {
			hrInterval = window.setInterval(function() {
				heartRate.start();

			}, intervals.heartRate);
		}
		function mkLocation() {
			locationModel.start();
			loopLocation();
			
		}
		function loopLocation(){
			locationInterval = window.setInterval(function() {
				locationModel.start();
				
			}, intervals.location // check every 10 min
			);
		}
		
		
		
		function clear(){
			
			  
			  canvasContent.context.globalAlpha=0.05;
			  
			  canvasContent.context.fillStyle='#000000'; 
			  canvasContent.context.fillRect(0, 0, canvasContent.canvas.width, canvasContent.canvas.height);
			  canvasContent.context.globalAlpha=1;
			  
			
			}
		function popolate(num,effect) {
			  for (var i = 0; i < num; i++) {
			    setTimeout(
			    function (x) {
			      return function () {
			        // Add particle
			    	if (effect == 'attraction'){
			    		particles.push(new Particle(canvasContent.context,particleColors));
			    	}  
			    	else if (effect == 'flower'){
			    		particles.push(new Flower(canvasContent.context,particleColors));
			    	}
			    	else if (effect == 'lightspeed'){
			    		particles.push(new LightSpeed(canvasContent.context,particleColors));
			    	}
			    	else {
			    		particles.push(new ParticleAlien(canvasContent.context,particleColors));
			    	}
			        
			      };
			    }(i),
			    frequency * i);
			  }
			  return particles.length;
			}
		function doFlame() {
			  flames.push(  
					  new Flame(canvasParticles.context, 
					  { 
						  x: 360 / 2,
						  y: 360 / 2 
					  }
			  ));


			  return flames.length;
			}
		function changeParticlesColor(theme){
			switch ( theme){
				case 'fire':
					particleColors = ["#ff5a02","#f8b500","#f9eac2"];
				    break;
				case 'hisakura':
					particleColors = ["#ff5151","#fc7b7b","#f9d9d9"];
				    break;
				case 'ice':
					particleColors = ["#694FB9","#6094ee","#3CFBFF"];
				  	break;
				  default:
						particleColors = ["rgb(149,149,149)","rgb(190,190,190)","rgb(244,244,244)"];
					  	break;
				}
			
		}
		function changeTheme(ev){
			changeParticlesColor(ev.detail);
			
			//time_to_recreate = true;
			theme = ev.detail;
			grdAmbiant = canvasDrawer.getAmbiantGradient(canvasContent.context);
			changeRootColors(ev.detail);
			particles = [];
			time_to_recreate = false;
			popolate(max_particles,effect);
			
			setTimeout(function () {
				  time_to_recreate = true;
				}, max_time);
			
		}
		function changeEffect(ev){
			effect = ev.detail;
			time_to_recreate = false;
			
			particles = [];
			popolate(max_particles,effect);
			setTimeout(function () {
				  time_to_recreate = true;
				}, max_time);
			
			
		}
		function init() {
			nextMove = 1000 / fps;
			then = Date.now();
			startTime = then;
			bindEvents();
			
			if (tizen.preference.exists('theme')) {
				theme = tizen.preference.getValue('theme');
			}
			else {
				tizen.preference.setValue('theme',theme);
			}
			if (tizen.preference.exists('effect')) {
				effect = tizen.preference.getValue('effect');
			}
			else{
				tizen.preference.setValue('effect',effect);
			}
			setDefaultVariables();
			changeParticlesColor(theme);
			
			const loader = new Promise((resolve, reject)=> {
			
			//pedometerSensor.start();
				mkHR();
				mkLocation();
				
				if (motionSensor.isAvailable()) {
					motionSensor.setOptions({
						sampleInterval : 10,
						maxBatchCount : 1000
					});
					motionSensor.setChangeListener();
					motionSensor.start();
				}
				if (pressureSensor.isAvailable()) {
					/*pressureSensor.setOptions({
						sampleInterval : 1000,
						maxBatchCount : intervals.pressure
					});
					pressureSensor.setChangeListener();*/
					pressureSensor.start();
				}
				sysInfo.checkBattery();
				calendarModel.accessCalendars();
				
				
				
				resolve('loaded');
				  
			});
			loader.then (function (resolve){
				backendLoaded = true;
				
				canvasDrawer.startShow(); 
			});
			
			
			pressureInterval = window.setInterval(function(e) {
				pressureSensor.start();
			},intervals.pressure
			);
			
			weatherInterval = window.setInterval(function(e) {
				event.fire('updateWeather',e);
			},intervals.weather
			);	
			
			window.setInterval(function(e) {
				event.fire('filterEvents',e);
			},300000
			);	
			
			
			popolate(max_particles,effect);
			
			setTimeout(function () {
				  time_to_recreate = true;
				}, max_time);
			
			animRequest = window.requestAnimationFrame(drawWatchContent);

		}
		
		return {
			init : init
		};
	}

});