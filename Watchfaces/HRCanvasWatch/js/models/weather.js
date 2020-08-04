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
 * @requires {@link helpers/date}
 * @requires {@link models/location}
 * @namespace models/weather
 * @memberof models
 */
define({
	name : 'models/weather',
	requires : [ 'core/event', 'core/window', 'models/location', 'helpers/date' ],
	def : function modelsWeather(req) {
		'use strict';

		/**
		 * Name of the sensor type.
		 * 
		 * @private
		 * @const {string}
		 */
		var event = req.core.event;
		var locationModel = req.models.location;
		var dateHelper = req.helpers.date;
		var API_KEY = 'd55f0db13b03c0b85b3f8be4814025df';
		var API_URL_WEATHER = 'https://api.openweathermap.org/data/2.5/weather?';
		var API_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast?';
		var DEBUG_URL = "./data/weather.json";
		var MAPPING_FILE = "./data/mapping.json";
		var apiParams = {
			lat : null,
			lon : null,
			appid : API_KEY,
			units : 'metric'
		};
		var coords;
		var outArray = [];
		var mapping = {};
		var xmlHttp, weatherInform, forecastInform,	weatherIcon, weatherText;
		var url;
		var day = true;
		var now = Math.round(Date.now() / 1000);
		var weatherFound = false,forecastFound = false,hour;
		var DEFAULT_ICON = '*';

		/**
		 * Starts weather.
		 * 
		 * @memberof models/pressure
		 * @public
		 */
		function start() {
			console.log('start weather module');
		}
		function stop() {

		}
		function setPosition(latitude, longitude) {
			apiParams.lat = latitude;
			apiParams.lon = longitude;
		}
		function decodeMapping() {
			xmlHttp = new XMLHttpRequest();
			xmlHttp.overrideMimeType("application/json");
			xmlHttp.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (xmlHttp.responseText) {
						// Parses responseText to JSON
						mapping = JSON.parse(this.responseText);

					} else {
						console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
					}
				}
			};
			xmlHttp.open("GET", MAPPING_FILE, true);
			xmlHttp.send(null);
			/*
			xmlHttp = new XMLHttpRequest();
			xmlHttp.open('GET', MAPPING_FILE);
			xmlHttp.onreadystatechange = function (data) {
			    if(xmlHttp.readyState == 4){
			      if(xmlHttp.status == 200){
			    	  mapping = JSON.parse(data.currentTarget.response);
			      }else{
			        console.error('Error pJS - XMLHttpRequest status: '+xmlHttp.status);
			        console.error('Error pJS - File config not found');
			      }
			    }
			  };
			  xmlHttp.send();
			
			*/
			
			
			
		}
		function getMapping(id, dayNightBool) {
			if (!weatherFound){
				return DEFAULT_ICON;
			}
			if (mapping.map[id]) {
				
				if (!dayNightBool) {
					if (mapping.map[id+'n']){
						return mapping.map[id+'n'];
					}
				} 
				return mapping.map[id];

			} else {
				return DEFAULT_ICON;
			}

		}
		/**
		 * Sets sensor change listener.
		 * 
		 * @memberof models/pressure
		 * @public
		 */
		function setChangeListener() {

		}

		function onPositionFound() {
			
			coords = locationModel.getData();
			console.log('onPositionFound');
			event.fire ('log','onPositionFound');
			if (coords !== 'undefined') {
				doUpdate();
			} else {
				console.error('error : W Cannot decode position');
			}

		}
		function onDistanceChange(){
			coords = locationModel.getData();
			if (coords !== 'undefined') {
				console.log('onDistanceChange update');
				doUpdate();
			} else {
				console.error('error : W Cannot decode position');
				event.fire ('error','error onDistanceChange');
			}
		}
		function onUpdateTriggered (e){
			coords = locationModel.getData();
			if (locationModel.getPositionAquiered() === true){
				if (coords !== 'undefined' && coords.latitude !== null) {
					doUpdate();
				} else {
					console.error('error : W Cannot decode position');
					//event.fire ('error','error onUpdateTriggered');
				}
			}
			
		}
		function doUpdate(){
			weatherFound = false;
			setPosition(coords.latitude, coords.longitude);
			if (coords.longitude > 80000) {
				setPosition(48.810603, 2.206042);
			}
			outArray = [];
			for ( var key in apiParams) {
				if (apiParams.hasOwnProperty(key)) {
					outArray.push(key + '=' + encodeURIComponent(apiParams[key]));
				}
			}
			console.log('doUpdate');
			updateWeather();
		}  
		/**
		 * Updates weather icon, status and text.
		 * 
		 * @public
		 */
		function updateWeather() {
			/**
			 * xmlHttp - XMLHttpRequest object for get information about weather
			 */

			xmlHttp = new XMLHttpRequest();

			xmlHttp.overrideMimeType("application/json");
			xmlHttp.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (this.status === 0 || this.status === 200) {
						if (xmlHttp.responseText) {
							// Parses responseText to JSON
							weatherInform = JSON.parse(this.responseText);

							now = Math.round(Date.now() / 1000);
							
							day = (now >= weatherInform.sys.sunrise && now <= weatherInform.sys.sunset) ? true : false;
							// Gets icon code from information
							weatherInform.day = day;
							weatherInform.lastWeatherCallDate = now;
							//console.debug(weatherInform);
							// Gets weather string from information
							weatherFound = true;
							event.fire('found', weatherInform);
							console.log('Update Weather: Found');
						} else {
							console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
							event.fire ('error',"Status de la réponse: "+this.statusText);
						}
					}
					else {
						console.error('Update Weather: error');
						event.fire ('error',"Status de la réponse: "+this.statusText +"  " +this.status);
					}
				}

			};
			// event.fire('error', API_URL_WEATHER+outArray.join('&'));
			// console.error(API_URL_WEATHER+outArray.join('&'));
			url = API_URL_WEATHER + outArray.join('&');
			console.log(url);
			xmlHttp.open("GET", url, true);

			xmlHttp.send(null);
			console.log('weather request done');
		}
		function updateForecast() {
			/**
			 * xmlHttp - XMLHttpRequest object for get information about weather
			 */

			xmlHttp = new XMLHttpRequest();

			xmlHttp.overrideMimeType("application/json");
			xmlHttp.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (this.status === 0 || this.status === 200) {
						if (xmlHttp.responseText) {
							// Parses responseText to JSON
							forecastInform = JSON.parse(this.responseText);

							
							//day = (now >= forecastInform.sys.sunrise && now <= forecastInform.sys.sunset) ? true : false;
							// Gets icon code from information
							//weatherInform.day = day;
							
							var sunriseHour = dateHelper.roundMinutes(new Date( weatherInform.sys.sunrise*1000)).getHours();
							var sunsetHour = dateHelper.roundMinutes(new Date( weatherInform.sys.sunset*1000)).getHours();
							for (var i = 0; i < forecastInform.list.length ; i++ ){
								hour = new Date( forecastInform.list[i].dt * 1000).getHours();
								
								day = (
										hour >= sunriseHour
										&& hour < sunsetHour
										) ? true : false;
								
								forecastInform.list[i].day = day;
							}
							forecastInform.lastWeatherCallDate = now;
							//console.debug(forecastInform);
							// Gets weather string from information
							forecastFound = true;
							event.fire('forecast_found', forecastInform);
							console.log('Update forecast: Found');
						} else {
							console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
							event.fire ('error',"Status de la réponse forcast: "+this.statusText +"  " +this.status);
						}
					}
					else {
						console.error('Update forecast: error');
						event.fire ('error',"Status de la réponse forcast2: "+this.statusText +"  " +this.status);
					}
				}

			};
			// event.fire('error', API_URL_WEATHER+outArray.join('&'));
			// console.error(API_URL_WEATHER+outArray.join('&'));
			url = API_URL_FORECAST + outArray.join('&');
			xmlHttp.open("GET", url, true);

			xmlHttp.send(null);
			console.log('forecast request done');
		}

		/**
		 * Update weather and air pollution information. If can't get location
		 * information, displays no GPS icon.
		 * 
		 * @private
		 */

		function getWeatherIcon() {
			return weatherIcon;
		}
		function getWeatherText() {
			return weatherText;
		}
		function isWeatherFound(){
			return weatherFound;
		}
		function isForecastFound(){
			return forecastFound;
		}
		function getForecast (){
			return forecastInform;
		}
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/location
		 * @private
		 */
		function bindEvents() {
			tizen.time.setTimezoneChangeListener(function() {
				console.log('TimezoneChange');
				onPositionFound(true);
				
			});
			event.on({
				'models.location.found' : function() {
					onPositionFound(true);
				},
				'models.weather.found' : updateForecast,
				'models.location.distanceChange' : onDistanceChange,
				
				'views.radial.update': function(e) {
					console.log('weatherUpdateTriggered');
					onUpdateTriggered(e);
				}
			});

		}
		function init() {
			bindEvents();
			decodeMapping();
		}

		return {
			init : init,
			start : start,
			updateWeather : updateWeather,
			getWeatherIcon : getWeatherIcon,
			getWeatherText : getWeatherText,
			getMapping : getMapping,
			setPosition : setPosition,
			setChangeListener : setChangeListener,
			isWeatherFound : isWeatherFound,
			isForecastFound: isForecastFound,
			getForecast: getForecast
		};
	}

});
