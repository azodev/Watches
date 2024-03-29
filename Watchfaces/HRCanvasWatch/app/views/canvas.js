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
	             'views/settings', 
	             'helpers/date', 
	             'helpers/text',  
	             'models/motion',
	             //'models/settings', 
	             'models/canvasDrawer', 
	             'models/heartRate', 
	             'models/location', 
	             'models/pressure', 
	             'models/weather'] ,
	             /*'models/pedometer',
	             'models/calendar' ],*/
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
		//var calendarModel = req.models.calendar;
		var radialmenu = req.views.radial;
		var settingsPage = req.views.settings;
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
		var locationInterval = null, pedometerInterval = null, hrInterval = null, weatherInterval = null, hrIntervalStop = null, pressureInterval = null, updateEvents =null, filterEvents = null;
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
			weather : 3600000,//3600000,
			pressure : 600000,
			updateEvents: 600000,
			filterEvents: 300000//300000
		};
		var grd,grdAmbiant, i, j, startTime, now, then, elapsed, sinceStart, frame = 0, currentFps, isAmbientMode, rotate = false;
		var motion = null;
		var motionFound = false;
		var motionFromGyro = {accelerationIncludingGravity : {x:null,y:null}}; 
		
		var max_particles = 400;
		var particles = [];
		var frequency = 5;
		var init_num = max_particles;
		var max_time = frequency * max_particles;
		var time_to_recreate = false;
		var gravCenter = {x:180, y:180};
		var gravCenterDiff = {x:0, y:0};
		var clickPos = null;
		var radialButton = null;
		var drawTicks = false;
		var particleColors = ["#694FB9","#6094ee","#3CFBFF"];
		var deg = {x:0,y:0}; 
		var elem;
		const CLICK_INTERVAL = 300;
		var lastClickTimeStamp = null, currentClickTimeStamp = null;
		
		var forecastDisplayed = true; 
		var forecastMode = true; 
		var wShape , aShape1, aShape2, aShape3, aShape4,appDrawerShape, calendarShape, hrShape; 
		var secondsPassed = 0;
		var oldTimeStamp = 0;
		var miniCalendarDisplayed = false, miniWeatherDisplayed= true;
		var widgetFullScreenDiplayed = false; 
		var baroDisplayed = true;
		var timeDisplayed = true;
		var heartRateDisplayed=true;
		var holder = document.querySelector("#widget_holder");
		var calendar = document.querySelector("#calendar");
		var widgetOn = null;
		var widgetOpened = false;
		var widgetId = '';
		var up = document.getElementById ('up');
		var down = document.getElementById ('down');
		var calendarY = 0;
		var flipping = false;
		var flipped = false;
		var widgetFlipped = null;
		var wCoords=null;
		var theme = 'fire';
		var effect = 'attraction';
		var noEvents = false;
		var themeData = {};
		var themeLoaderWk = null;
		var map = new Map([['lightspeed', LightSpeed],['attraction', Particle],['flower', Flower],['repulsion', ParticleAlien]]);
		var startY = 0;
		
		
		
		
		
		function handleClick(canvas,ev) {
			navigator.vibrate(0);
			currentClickTimeStamp = Date.now();
			if (!isAmbientMode){
				if (canvas.getAttribute("data-dblclick") == null) {
					canvas.setAttribute("data-dblclick", 1);
	                setTimeout(function () {
	                    if (canvas.getAttribute("data-dblclick") == 1) {
	                        //console.log('-----------> single <-----------');
	                        handleSingleClick(canvas,ev);
	                    }
	                    canvas.removeAttribute("data-dblclick");
	                }, 300);
	            } else {
	            	canvas.removeAttribute("data-dblclick");
	            	//console.log('-----------> double <-----------');
	            	handleDoubleClick(canvas,ev);
	            }
				lastClickTimeStamp = currentClickTimeStamp;
			}
			
			
		}

		function handleDoubleClick(canvas,ev) {
			clickPos = getMousePosition(canvas,ev);
			//console.log('handleDoubleClick');
			if (wShape.isInSurface(clickPos,0) && !radialmenu.getOpen()  && weatherModel.isForecastFound()){
				 
				handleWeatherClick();
			}
			
		}
		function handleWeatherClick(){
			if (forecastMode){
				forecastDisplayed = false;
			}
			else {
				miniCalendarDisplayed= false;
			}
			animateWeatherSection();
		}
		function animateWeatherSection(){
			//weatherSectionAnimating = true;
			wShape.animate();
		}
		function handleWeatherSectionAnimation(){
			if (wShape.isAnimating()){
				if (!forecastMode){
					wShape.growRight(secondsPassed,100,250,0.3);
					if (!wShape.isAnimating()){
						toogleForecastMode();
						forecastDisplayed = true;
					}
				}
				else {
					wShape.shrinkRight(secondsPassed,250,100,0.3);
					
					if (!wShape.isAnimating()){
						//miniCalendarDisplayed = true;
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
		function changeRootColors(themeData){
			    let widgetStyle = document.querySelector(widgetId).style;
			    widgetStyle.setProperty('--color1', themeData.root_colors[0]);
			    widgetStyle.setProperty('--color2', themeData.root_colors[1]);
		}
		function handleSingleClick(canvas,ev) {
			//console.log('handleSingleClick');
			clickPos = getMousePosition(canvas,ev);
			
			//console.log(clickPos);
			if (appDrawerShape.isInSurface(clickPos,10)){
				resetGravCenter (10);
				canvasDrawer.startFade();
				openRadialMenu(ev);
				radialmenu.setOpen();
			}
			/*
			else if (calendarShape.isInSurface(clickPos,0) && !forecastDisplayed && !radialmenu.getOpen() && !widgetFullScreenDiplayed && calendarModel.hasVEvents()){
				//console.log('Click fade');
				resetGravCenter (10);
				canvasDrawer.startFade();
				calendar = calendarModel.getCalendarHtml();
				holder = canvasDrawer.processWidgetHtml(calendar);
				
				
				
				setClassAndWaitForTransition(holder,'on','opacity').then(function () {
					//console.log('transition holder');
					//holder.setAttribute('class', 'on');
					widgetId = "#calendar";
					changeRootColors(themeData);
					
					setClassAndWaitForTransition(calendar,'on','opacity').then(function () {
						//console.log('transition calendar');
						
						//calendar.setAttribute('class', 'on');
						//holder.setAttribute('class', 'on');
						
						setTimeout(function(){
							widgetFullScreenDiplayed = true;
						},100);
						
						setCloseWidgetAction(calendar,closeWidget,'#calendar');
					});
		            
		            
		        });
				document.querySelectorAll("#calendar .event").forEach(function (element){
					element.addEventListener('click', function(e) {
						//console.log('click event');
						setClassAndWaitForTransition(element,'event click','color').then(function () {
							//console.log('transition event');
							element.setAttribute('class', 'event');
							canvasDrawer.startShow();
							widgetId = null;
							closeWidget('#calendar');
						});
							
					});
				});
			}*/
			else if (hrShape.isInSurface(clickPos,5) && !radialmenu.getOpen()  ){
				tizen.application.launch("com.samsung.shealth", null,null);
			}
			else if (wShape.isInSurface(clickPos,0) && !radialmenu.getOpen()  && weatherModel.isForecastFound() && !widgetFullScreenDiplayed){
				resetGravCenter (10);
				canvasDrawer.startFade();
				let weather = weatherModel.getWeatherHtml();
				holder = canvasDrawer.processWidgetHtml(weather);
				
				//console.log('weather opening');
				
				
				setClassAndWaitForTransition(holder,'on','opacity').then(function () {
					//console.log('transition holder');
					//holder.setAttribute('class', 'on');
					widgetId = "#weather";
					changeRootColors(themeData);
					
					setClassAndWaitForTransition(weather,'on','opacity').then(function () {
						//console.log('transition weather');
						
						//calendar.setAttribute('class', 'on');
						//holder.setAttribute('class', 'on');  
						document.querySelector(widgetId).setAttribute('class', 'active');  
						widgetOpened = true;
						widgetOn = document.querySelector(widgetId+".active");
						
						setTimeout(function(){
							widgetFullScreenDiplayed = true;
						},50);

						setCloseWidgetAction(document.querySelector('.lastcall'),closeWidget,'#weather');  
						setCloseWidgetAction(document.querySelector('.overflower'),closeWidget,'#weather'); 
						  
					});
		            
		            
		        });
				document.querySelectorAll("#weather div.block").forEach(function (element){
					element.addEventListener('click', function(e) {
						
						//console.log('click weather');
						setClassAndWaitForTransition(element,'block click','color').then(function () {
							//console.log('transition weather');
							let ov = document.querySelector("#overflower-back");
							ov.innerHTML = '';
							let block = weatherModel.getElementDetails(element.getAttribute('block-id'));
							ov.appendChild(block);
							setClassAndWaitForTransition(element,'block','color').then(function () {

								
								//console.log('flip');
								flipping = true; 

								setClassAndWaitForTransition(document.getElementById('weather'),'flip','transform').then(function () {
									//console.log('flipped');
									setTimeout(function (){
										document.getElementById('weather').setAttribute('class', 'flipped'); 
										flipping=false;
										flipped = true; 
										setFlipBackWidgetAction(document.querySelector('#overflower-back'),'.overflower-back'); 
									}, 50)
									
								});
								
							});
						});
							
					});
				});
			}
			
		}
		function setFlipBackWidgetAction(node,className){
			node.addEventListener('click', function(e) {
				let ovb = document.querySelector("#overflower-back");
				if (	   e.target == ovb
						|| hasSomeParentTheClass(e.target, 'overflower-back')
				 ){
					 flipping=true;
					 //console.log('flipper');
					 setTimeout(function (){
						 let weather = document.getElementById('weather');
						 setClassAndWaitForTransition(weather,'on','transform').then(function () {
								//console.log('flipped');
							 	weather.setAttribute('class', 'active');
								flipping=false;
								flipped = false; 
								while (ovb.firstChild) {
									ovb.removeChild(ovb.lastChild);
								  }
								//node.innerHTML = '';
							});
						 return;
					 },50);
				 }
			});
		}
		function setCloseWidgetAction (node,closeF,itemId){
			node.addEventListener('click', function(e) {
					if (		e.target !== this 
						 && e.target != document.querySelector("#overflower") 
						 )
					    return;
				 
				 
				canvasDrawer.startShow();
				widgetId = null;
				closeF(itemId);
			}); 
			
		}
		function closeWidget(itemId){
			if (widgetFullScreenDiplayed){
					
				
				widgetFullScreenDiplayed = false;
				holder = document.querySelector("#widget_holder");
				let item = document.querySelector(itemId);
				

				
					setClassAndWaitForTransition(item,'off','opacity').then(function () {
						//console.log('transition widget');
						
						widgetOn = null;
						widgetOpened = false;
						calendarY = 0;
						startY = 0;
						flipped = false;
						setClassAndWaitForTransition(holder,'','opacity').then(function () {
							//calendar.setAttribute('class', 'off');
							//console.log('transition holder');
							
							
							canvasDrawer.clearWidgetHtml(holder,item);
							
						});
					});
			}
		}
		function triggerShowWatch(){
			
			canvasDrawer.startShow();
		}
		
		function handleWatchFadingAnimation(){
			if (canvasDrawer.isFading()){
				canvasDrawer.fade(secondsPassed,0.5);
			}
			
		}
		function handleWatchShowingAnimation(){
			if (canvasDrawer.isShowing()){
				canvasDrawer.show(secondsPassed,0.5);
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
			//console.log('DrawLayout');
			// Clear canvas
			/**@todo */
			canvasBackground.context.clearRect(0, 0, canvasBackground.canvas.width, canvasBackground.canvas.height);
			//
			canvasDrawer.renderText(canvasBackground.context, "AZO WATCH v.1", center.x, center.y - (watchRadius * 0.7), 13, themeData.fontcolor, {
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
				currentFps = Math.round((1000 / (sinceStart / ++frame) * 100) / 100);

				// $results.text("Elapsed time= " + Math.round(sinceStart / 1000
				// * 100) / 100 + " secs @ " + currentFps + " fps.");  currentFps 
				canvasDrawer.renderText(canvasContent.context, particles.length+" - "+currentFps+" fps", center.x, center.y - (watchRadius * 0.45), 15, themeData.fontcolor, {
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
			handleIntervalsUpdate(now);
			
			secondsPassed = (timeStamp - oldTimeStamp) /1000 ;/// 1000;
		    oldTimeStamp = timeStamp;
		   
		    handleWeatherSectionAnimation(); 
		    handleWatchFadingAnimation();
		    handleWatchShowingAnimation();

			date = datetime.getDate();
			//onMotionChangeNew();
			
				
				
					
					
				
			
			if (!isAmbientMode){
				let pl = particles.length;
				let to_add = textHelper.getRandomInt(10,100);
				particles = particles.filter(function (p) {
					p.setPoA(gravCenter);   
					return p.move();
				}); 
				if (time_to_recreate) {
				    if (pl < max_particles) {
				    	if (max_particles-pl < to_add){
				    		to_add = max_particles-pl;
				    	}
				    	popolate(to_add,effect); 
				    }
				}
				  
			}
			clear();
			
			
			
			canvasDrawer.renderBackground(canvasContent.context,canvasContent.canvas.width, canvasContent.canvas.height, "black",{gradient:true,motion:motion});
			
			canvasDrawer.renderCircle(canvasContent.context,  new Circle(center.x,center.y,watchRadius -2) ,null,null,true,2,true);
			
				
			
				//canvasDrawer.renderCircleShadows(canvasContent.context, appDrawerShape, {r:100,g:100,b:100,a:0.08},5);
				canvasDrawer.renderCircle(canvasContent.context, appDrawerShape,  "#000000",themeData.complication_bg,false,2,false);
				canvasDrawer.roundRect(canvasContent.context, aShape1, 3, false, true, null, "rgba(0, 0, 0,0.08)");
				canvasDrawer.roundRect(canvasContent.context, aShape2, 3, false, true, null, "rgba(0, 0, 0,0.08)");
				canvasDrawer.roundRect(canvasContent.context, aShape3, 3, false, true, null, "rgba(0, 0, 0,0.08)");
				canvasDrawer.roundRect(canvasContent.context, aShape4, 3, false, true, null, "rgba(0, 0, 0,0.08)");
				
				if (baroDisplayed){
					
					canvasDrawer.roundRect(canvasContent.context, new Shape(center.x - 112, center.y - 63, 85, 58) ,10, true, false, null, themeData.complication_bg); // 232
					
					canvasDrawer.renderTextGradient(canvasContent.context, 'Altitude', center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.30), 16, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion
					});
					canvasDrawer.renderText(canvasContent.context, altitude, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.23), 16, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'right'
					});
					canvasDrawer.renderTextGradient(canvasContent.context, 'Pressure', center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.16), 16, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion 
					});

					canvasDrawer.renderText(canvasContent.context, pressure, center.x - (watchRadius * 0.19), center.y - (watchRadius * 0.09), 16, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'right'
					});
				}
				
				
				if (timeDisplayed){
					// Battery
					canvasDrawer.renderText(canvasContent.context, Math.round(batteryLevel) + '%', center.x+94, center.y - (watchRadius * 0.4), 17, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
					});
					canvasDrawer.renderText(canvasContent.context,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x + 108, center.y - 50, 25, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'right',
						gradient : true,
						motion: motion
						
					});
					//canvasDrawer.renderTimeBisShadows (canvasContent.context, dateArray, center.x + 33, center.y - 23, 53, {r:40,g:40,b:40,a:0.9},5);
					canvasDrawer.renderTimeBis(canvasContent.context, dateArray, center.x + 33, center.y - 23, 53, themeData.fontcolor, {
						gradient : true,
						motion: motion,
						stroke:false
						
					});
					canvasDrawer.renderText(canvasContent.context, dateArray.second, center.x + 138, center.y - 16, 25, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
						
					});
				}
				
				
				
				if (miniWeatherDisplayed){
					
					//canvasDrawer.roundRectShadows(canvasContent.context, wShape,10, {r:100,g:100,b:100,a:0.1},5);
					canvasDrawer.roundRect(canvasContent.context, wShape,10, true, false, null, themeData.complication_bg);
					drawWeather(forecastDisplayed);
				}
				
				
				if (miniCalendarDisplayed) {
					//canvasDrawer.roundRectShadows(canvasContent.context, calendarShape,10, {r:100,g:100,b:100,a:0.1},5);
					canvasDrawer.roundRect(canvasContent.context, calendarShape,10, true, false, null, themeData.complication_bg);
					canvasDrawer.renderText(canvasContent.context, 'Events', calendarShape.getCoords().x+50, calendarShape.getCoords().y+20, 25, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center',
							gradient : true, 
							motion: motion
					});
					canvasDrawer.renderText(canvasContent.context, calendarModel.getNbEvents() , calendarShape.getCoords().x+50, calendarShape.getCoords().y+50, 30, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center'
					});
					
				}
				//canvasDrawer.renderCircleShadows(canvasContent.context, hrShape, {r:100,g:100,b:100,a:0.1},5);
				canvasDrawer.renderCircle(canvasContent.context, hrShape, "#000000",themeData.complication_bg,false,1.5,false);
				if (heartRateDisplayed &&  heartRateFound && heartRate.getData().rate !== null) {
					
					
					canvasDrawer.renderText(canvasContent.context, heartRate.getData().rate, center.x , center.y + (watchRadius * 0.67), 25, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});

				}
				else {
					canvasDrawer.renderText(canvasContent.context, '-', center.x , center.y + (watchRadius * 0.67), 25, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});
				}
				
				/*if (pedometerSensor.getActive() === true){
					canvasDrawer.renderText(canvasContent.context, pedometerSensor.getData().accumulativeTotalStepCount, center.x - (watchRadius * 0.3), center.y + (watchRadius * 0.6), 22, "#c9c9c9", {
						font : 'FutureNow',
						align : 'center',
						gradient : true,
						motion: motion
							
					});
				}*/
			

			//displayFps();
			
			animRequest = requestAnimationFrame(drawWatchContent);
			
	

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
				
				canvasDrawer.renderText(canvasContent.context, 'Temp', wCoords.text1.x, wCoords.text1.y, wCoords.text1.size, themeData.fontcolor, {
					font : 'FutureNow',
					align : 'center',
						gradient : true,
						motion: motion
				});
				canvasDrawer.renderText(canvasContent.context, roundCoord(weatherValue.main.temp, 1) + "°", wCoords.temp.x, wCoords.temp.y, wCoords.temp.size, themeData.fontcolor, {
					font : 'FutureNow',
					align : 'center'
				});
				if (forecastMode){
					//city weatherValue.name
					canvasDrawer.renderTextGradient(canvasContent.context, textHelper.truncateBis(weatherValue.name, 12, '...'), wCoords.city.x, wCoords.city.y, wCoords.city.size, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'left',
						gradient : true
					});
				}
				
				canvasDrawer.renderText(canvasContent.context, textHelper.truncateBis(weatherValue.weather[0].main, (!forecastMode)?8:12,'...'), wCoords.text2.x, wCoords.text2.y, wCoords.text2.size, themeData.fontcolor, {
					font : 'FutureNow',
					align : 'left',
					gradient : true,
					motion: motion
				});

			} else {
				weatherIcon = weatherModel.getMapping();
			}

			canvasDrawer.renderText(canvasContent.context, weatherIcon, wCoords.icon.x,wCoords.icon.y, wCoords.icon.size, themeData.fontcolor, {
				font : 'artill_clean_icons',
				align : 'center',
					gradient : true,
					motion: motion
			});

			if (weatherModel.isWeatherFound() && weatherModel.isForecastFound() && forecastDisplayed) {
				forecastValue = weatherModel.getForecast();
				forecastIndexX = center.x-18;
				for (var i = 0; i < 5; i++) {
					forecastHour = new Date(forecastValue.list[i].dt * 1000).getHours();
					canvasDrawer.renderText(canvasContent.context, forecastHour + "h", forecastIndexX, center.y + (watchRadius * 0.15), 15, themeData.fontcolor, {
						font : 'FutureNow',
						align : 'center'
					});
					canvasDrawer.renderText(canvasContent.context, weatherModel.getMapping(forecastValue.list[i].weather[0].id, forecastValue.list[i].day), forecastIndexX, center.y + (watchRadius * 0.22), 31,
							themeData.fontcolor, {
								font : 'artill_clean_icons',
								align : 'center',gradient : true,
								motion: motion
							});
					canvasDrawer.renderText(canvasContent.context, ~~(forecastValue.list[i].main.temp) + "°", forecastIndexX + 3, center.y + (watchRadius * 0.37), 15, themeData.fontcolor, {
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
			//event.fire ('log','onPedometerDataChange');
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
			//console.log('ambient');
			canvasDrawer.setOpacity(1);
			//canvasBackground.context.clearRect(0, 0, canvasBackground.canvas.width, canvasBackground.canvas.height);
			/**@todo */
			//clear();
			canvasContent.context.clearRect(0, 0, canvasContent.canvas.width, canvasContent.canvas.height);
			canvasDrawer.renderTimeBis(canvasContent.context, dateArray, center.x - 20 +textHelper.getRandomInt(-10,10), center.y+ textHelper.getRandomInt(-10,10), 100, grdAmbiant,{
				align : 'center'
			});
			canvasDrawer.renderText(canvasContent.context,datetime.getDate()+"/"+(datetime.getMonth()+1)+"/"+datetime.getFullYear(), center.x +10 + textHelper.getRandomInt(-10,10), center.y - 80+ textHelper.getRandomInt(-10,20), 25, themeData.fontcolor, {
				font : 'FutureNow',
				align : 'center',
				gradient : true
			});
			if (heartRateFound && heartRate.getData().rate !== null) {
				
				canvasDrawer.renderCircle(canvasContent.context, new Circle(center.x,center.y + (watchRadius * 0.60),45), "#000000","rgba(30, 30, 30,0.7)",false,1.5,false);
	
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
			
			if (motion !== null) 		{
				canvasDrawer.processMotion(motionFromGyro,canvasContent.context);
			}
			gravCenter = canvasDrawer.getGravityCenter(motionFromGyro);
			
			gravCenter.x = gravCenter.x-gravCenterDiff.x;
			gravCenter.y = gravCenter.y-gravCenterDiff.y;
			if (!isAmbientMode){
				if (radialmenu.getOpen()){ 
					deg.x = (gravCenter.y - 180)*2;
					deg.y = (gravCenter.x - 180)*2;
					if (deg.x <= -40 ) deg.x = -30;
					if (deg.x >= 40 ) deg.x = 30;
					if (deg.y <= -40 ) deg.y = -30;
					if (deg.y >= 40 ) deg.y = 30;
					let menuHolderStyle = document.querySelector("div.menuHolder").style;
					menuHolderStyle.setProperty('--degx',  -deg.x + "deg");
					menuHolderStyle.setProperty('--degy',   deg.y + "deg");
					  
				}
				if (widgetFullScreenDiplayed ==true){
					deg.x = (gravCenter.y - 180)*2;
					deg.y = (gravCenter.x - 180)*2;
					if (deg.x <= -40 ) deg.x = -30;
					if (deg.x >= 40 ) deg.x = 30;
					if (deg.y <= -40 ) deg.y = -30; 
					if (deg.y >= 40 ) deg.y = 30; 
					//document.querySelector("#calendar.on").style.opacity=1;
					//calendar = document.querySelector("#calendar.on");
					//if (calendarOn.style.opacity < 1) calendarOn.style.opacity = 1;
					if (widgetId !=null   ) {
						let widget = document.querySelector(widgetId);
						widgetOn = document.querySelector(widgetId+".active");
						if (!flipping && flipped == false){
							widget.style.setProperty('--degx',  -deg.x + "deg");
							widget.style.setProperty('--degy',   deg.y + "deg");
							widget.style.setProperty('--degxFlipped',    deg.x + "deg");
							widget.style.setProperty('--degyFlipped',   (deg.y+180) + "deg");
						}
						else {
							if ( flipped){
									widget.style.setProperty('--degx',  -deg.x + "deg");
									widget.style.setProperty('--degy',   deg.y + "deg");
									widget.style.setProperty('--degxFlipped',    deg.x + "deg");
									widget.style.setProperty('--degyFlipped',   (deg.y+180) + "deg");
							}
						}
					}
				}
			}
		}
		function onMotionChangeNew(){
			if (motionSensor.isMotionFound()){
				motionFromGyro.accelerationIncludingGravity = motionSensor.getSensorValueAvg().accelerationIncludingGravity;
				motion = motionFromGyro;
				if (!motionFound){
					motionFound = true;
					gravCenter = canvasDrawer.getGravityCenter(motionFromGyro);
					gravCenterDiff = {x:gravCenter.x -180, y: gravCenter.y-180};
				}
			}
			
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
				//console.log('activateMode ambiant');
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
				
				//console.log('activateMode normal');
				
				
				
				//drawWatchLayout();
				/*animRequest = window.requestAnimationFrame(function() {
					drawWatchContent();
				});
				
*/				
				//gravCenter = {x:180,y:180};
				resetGravCenter (500);
				
				animRequest = requestAnimationFrame(drawWatchContent);
				break;
			default:
				break;
			}
		}
		function resetGravCenter (timer){
			
			setTimeout(function (e){
				gravCenter = canvasDrawer.getGravityCenter(motionFromGyro);
				gravCenterDiff = {x:gravCenter.x -180, y: gravCenter.y-180};
			}, timer);
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
		function bindClickNTouch(){
			document.getElementById('canvas-content').addEventListener('click', function(e) {
				handleClick(this,e);
				return false;
			});
			
			up = document.getElementById ('up');
			down = document.getElementById ('down');
			
			
			up.addEventListener('click', function(e) {
				//console.log('up'); 
				calendarY = document.getElementById ('overflower').scrollTop-220;
				//console.log(document.getElementById ('overflower').scrollTop);
				canvasDrawer.scrollTop(document.getElementById ('overflower'),-220,500); 
				return false;
			});
			down.addEventListener('click', function(e) {
				//console.log('down');
				calendarY = document.getElementById ('overflower').scrollTop+220;
				canvasDrawer.scrollTop(document.getElementById ('overflower'),220,500); 
				return false;
			});
			
			
			document.addEventListener('touchmove', function(e) {
				
				//
				if (widgetOpened  && !flipped){
					//calendarY = 0;
					console.log('move');
					//document.getElementById ('overflower').scrollTop = 0;
					let overflower = document.getElementById ('overflower');
					/*console.log('scroltop: '+overflower.scrollTop);
					console.log('calendarY: '+calendarY);
					console.log('startY: '+startY);
					console.log('screenY: '+e.touches[0].screenY);
					console.log('offsetY: '+(e.touches[0].screenY-startY));

					console.log(e);
					*/
					calendarY =  (startY - e.touches[0].screenY < 0)? 0 : startY - e.touches[0].screenY;
					calendarY = (calendarY > overflower.scrollHeight)?overflower.scrollHeight : calendarY;
					overflower.scrollTop =calendarY ;
				}
				 
				//e.preventDefault();
				}, true);
			document.addEventListener('touchstart', function(e) {
				if (widgetOpened  && !flipped){
					//console.log('--------start');
					//let overflower = document.getElementById ('overflower');
					//console.log('scroltop: '+overflower.scrollTop);
					//console.log('calendarY: '+calendarY);
					//console.log(e);
					startY = e.touches[0].screenY+calendarY;
					//console.log('startY: '+startY);
					//e.preventDefault();
					}
				}, true);
		}
		
		function bindEvents() {
			
			bindClickNTouch();
			window.addEventListener("timetick", function (){
				//console.log('timetick');
				if (isAmbientMode) {
					drawAmbientWatch();
				}
				else{
					
				}
			});
			
				
			/*document.addEventListener('touchend', function(e) {
				if (widgetOpened  && !flipped){
					//console.log('end--------------');
					//let overflower = document.getElementById ('overflower');

					//console.log(e);
					//e.preventDefault();
				}
				}, true);
			*/
			
			
			window.addEventListener("ambientmodechanged", function(e) {
				//console.log('ambientmodechanged event');
				if (e.detail.ambientMode === true) {
					// Rendering ambient mode case
					if (radialmenu.getOpen()){
						radialmenu.closeMenu();
					}
					//closeWidget(widgetId);
					
					activateMode("Ambient");
				} else {
					// Rendering normal case
					//closeSettings();
					activateMode("Normal");
					canvasDrawer.startShow(); 

				}
			});
			
			event.on("visibilitychange", function(e) {
				//console.log('visibilitychange event');
				if (!document.hidden) {
					if (isAmbientMode === true) {
						// Rendering ambient mode case
						
						if (radialmenu.getOpen()){
							radialmenu.closeMenu();
						}
						closeWidget(widgetId);
						
						activateMode("Ambient"); 
						
					} else {
						// Rendering normal case
						//closeSettings();
						canvasDrawer.startShow(); 
						activateMode("Normal"); 
					}
				}
				else {
					//console.log('hide');
					if (radialmenu.getOpen()){
						radialmenu.closeMenu();
					}
					closeWidget(widgetId);
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
						//closeSettings();
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
				'models.pressure.change' : onPressureChange,
				'models.motion.change' : onMotionChange,
				'models.motion.error' : onMotionError,
				'views.radial.changeTheme' : changeTheme,
				'views.radial.changeEffect' : changeEffect,
				'views.radial.close' : triggerShowWatch,
				'RadialMenu.closing' : triggerShowWatch,
				//'models.pedometer.change' : onPedometerDataChange,
				'models.weather.found' : onWeatherFound, 
				'models.weather.forecast_found' : onForecastFound, 
				'models.calendar.hasEvent' : onCalendarChange 
			});
			sysInfo.listenBatteryLowState();
			sysInfo.listenBatteryChange();
		}
		function onCalendarChange(ev){
			if (ev.detail  && forecastMode){
				handleWeatherClick();
			}
			else {
				
			}
			
		}
		
		function onForecastFound(){
			//if (!calendarModel.hasVEvents()) handleWeatherClick();
			//handleWeatherClick();
		}

		/**
		 * Initializes module.
		 * 
		 * @memberof views/canvas
		 * @public
		 */
		
		function mkHR() {
			heartRate.start();
			hrInterval = setInterval(function() {
				heartRate.start();

			}, intervals.heartRate);
		}
		function mkLocation() {
			locationModel.start();
			loopLocation();
			
		}
		function loopLocation(){
			locationInterval = setInterval(function() {
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
		function popolate(num,eff) {
			  for (var i = 0; i < num; i++) {
			    	 if (!isAmbientMode){
			    		 particles.push(new (map.get(eff))(canvasContent.context,themeData.particle_colors));
			    	 }
			  }
			  return particles.length;
			}
		
		function changeParticlesColor(themeData){
			particleColors = themeData.particle_colors;

			
		}
		function changeTheme(ev){
			
			let loader = loadTheme(ev.detail).then((themeData) => {
				theme = ev.detail;
				changeParticlesColor(themeData);
				canvasDrawer.setThemeData(themeData);
				grdAmbiant = canvasDrawer.getAmbiantGradient(canvasContent.context);
				themeLoaderWk.terminate();
				effect = themeData.effect;
				particles = [];
				time_to_recreate = false;
				popolate(textHelper.getRandomInt(50,100),effect);
				 
				setTimeout(function () {
					  time_to_recreate = true;
					}, max_time);
			});
			
			
		} 
		function changeEffect(ev){
			effect = ev.detail;
			time_to_recreate = false;
			
			particles = [];
			popolate(100,effect);
			setTimeout(function () {
				  time_to_recreate = true;
				}, max_time);
			
			
		}
		function handleIntervalsUpdate(timeStamp){
			weatherModel.handleUpdate(timeStamp);
			heartRate.handleUpdate(timeStamp);
			locationModel.handleUpdate(timeStamp);
			pressureSensor.handleUpdate(timeStamp);
			//calendarModel.handleUpdate(timeStamp);
			//calendarModel.handleFilter(timeStamp);
			
		}
		function setIntervalOnModels(){
			weatherModel.setIntervalUpdate(intervals.weather); //
			heartRate.setIntervalUpdate(intervals.heartRate);
			locationModel.setIntervalUpdate(intervals.location);
			pressureSensor.setIntervalUpdate(intervals.pressure);
			//calendarModel.setIntervalUpdate(intervals.updateEvents);
			//calendarModel.setIntervalFilter(intervals.filterEvents);
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
			
			heartRate.start();//mkHR();
			locationModel.start();
			setIntervalOnModels();
			if (motionSensor.isAvailable()) {
				motionSensor.setOptions({
					sampleInterval : 100,
					maxBatchCount : 1000
				});
				motionSensor.setChangeListener();
				motionSensor.start();
			}

			pressureSensor.start();
			sysInfo.checkBattery();
			
			
			let loader = loadTheme(theme).then((themeData) => {
				changeParticlesColor(themeData);
				canvasDrawer.setThemeData(themeData);
				grdAmbiant = canvasDrawer.getAmbiantGradient(canvasContent.context);
				popolate(100,themeData.effect);
				setTimeout(function () {
					  time_to_recreate = true;
					}, max_time);
				themeLoaderWk.terminate();
				
				
				
				setTimeout(function (){
					//document.querySelector('#splash-page').setAttribute('class', 'hide');
					let splash = document.querySelector('#splash-page');
					setClassAndWaitForTransition(splash,'off','opacity').then(function () {
						splash.setAttribute('class', 'hide');
						//document.querySelector('#container').setAttribute('class', 'on');
						//canvasDrawer.startShow(); 
						animRequest = window.requestAnimationFrame(drawWatchContent);
						
						
						
						setClassAndWaitForTransition(document.querySelector('#container'),'on','opacity').then(function () {
							canvasDrawer.startShow(); 
							
						});
					});
					
					
					
					
				},500);
				//document.querySelector('#splash-page').style.setProperty('display','none');
			});
			

		}
		async function loadTheme(theme){
			return new Promise(function(resolve, reject) {
				themeLoaderWk = new Worker('lib/workers/jSonReaderWK.js');
				themeLoaderWk.onmessage = function(e) {
					if (e){
						themeData  = e.data.json;
						tizen.preference.setValue('theme',themeData.name);
						document.body.style.setProperty('--bg', themeData.background); 
						document.querySelector('#container').style.setProperty('--bg', themeData.background);
						document.querySelector('#splash-page').style.setProperty('--bg', themeData.background);
						document.querySelector('#splash-page').style.setProperty('--fontcolor', themeData.fontcolor);  
						document.querySelector('#splash-page .loader span').style.setProperty('--bg', 'linear-gradient('+themeData.gradient.join(', ')+')' ); 
						//map = new Map([[themeData.effectClass, themeData.effectClass]]);
						resolve(themeData);
					}
				}
				themeLoaderWk.onerror = function (err){
					 reject(new TypeError('Theme loading failed'));
				};
				let uri = "../../data/themes/"+theme+".json";
				themeLoaderWk.postMessage({
		            'url': uri
		        });
			  });
		}
		
		return {
			init : init
		};
	}

});