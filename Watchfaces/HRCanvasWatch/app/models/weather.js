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
		var forecasts = [], vForecasts = [];
		var old_timestamp= null, interval, navStart = performance.timing.navigationStart;

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
			//event.fire ('log','onPositionFound');
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
		function onUpdateTriggered (message){
			coords = locationModel.getData();
			
			if (locationModel.getPositionAquiered() === true){
				if (coords !== 'undefined' && coords.latitude !== null) {
					doUpdate();
					event.fire('log', message);
				} else {
					console.error('error : W Cannot decode position');
					//event.fire ('error','error onUpdateTriggered');
					event.fire('log', 'error : W Cannot decode position');
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
			updateWeatherP();
		}  
		
		async function fetchWeather() {
			url = API_URL_WEATHER + outArray.join('&');
			let response = await fetch(url);
			
			  if (!response.ok) {
			    throw new Error('HTTP error! status: '+response.status);
			  } else {
				  return await response.json();
			  }
		}
		function updateWeatherP(){
			fetchWeather().then((json) => {
				
				weatherInform = json;

				now = Math.round(Date.now() / 1000);
				
				day = (now >= weatherInform.sys.sunrise && now <= weatherInform.sys.sunset) ? true : false;
				// Gets icon code from information
				weatherInform.day = day;
				weatherInform.lastWeatherCallDate = now;
				//console.debug(weatherInform);
				// Gets weather string from information
				weatherFound = true;
				event.fire('found', weatherInform);
				updateForecastP();
				console.log('Update Weather: Found');
				  
				}).catch(e => {
					console.log('There has been a problem with your fetch operation: ' + e.message);
					event.fire('log', 'There has been a problem with your fetch w operation: ' + e.message);
			});
		}
		async function fetchForecast() {
			url = API_URL_FORECAST + outArray.join('&');
			let response = await fetch(url);
			
			  if (!response.ok) {
			    throw new Error('HTTP error! status: '+response.status);
			  } else {
				  return await response.json();
			   
			  }
		}
		function updateForecastP(){
			fetchForecast().then( function (json) {
				forecastInform = json;
				vForecasts= [];
				//day = (now >= forecastInform.sys.sunrise && now <= forecastInform.sys.sunset) ? true : false;
				// Gets icon code from information
				//weatherInform.day = day;
				
				let sunriseHour = dateHelper.roundMinutes(new Date( weatherInform.sys.sunrise*1000)).getHours();
				let sunsetHour = dateHelper.roundMinutes(new Date( weatherInform.sys.sunset*1000)).getHours();
				for (let i = 0; i < forecastInform.list.length ; i++ ){
					hour = new Date( forecastInform.list[i].dt * 1000).getHours();
					
					day = (
							hour >= sunriseHour
							&& hour < sunsetHour
							) ? true : false;
					forecastInform.list[i].city = weatherInform.name;
					forecastInform.list[i].day = day;
					vForecasts.push(new vForecast(forecastInform.list[i],mapping));
					if (i==0){
						event.fire('triggerPressureSea',forecastInform.list[i]);
					}
					
				}
				forecastInform.lastWeatherCallDate = new Date();
				buildDaysForecasts();
				//console.debug(forecastInform);
				// Gets weather string from information
				forecastFound = true;
				event.fire('forecast_found', forecastInform);
				console.log('Update forecast: Found');
				  
				}).catch(function (e)  {
					console.log('There has been a problem with your fetch operation: ' + e.message);
					event.fire('log', 'There has been a problem with your fetch f operation: ' + e.message);
					
			});
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
		
		function buildDaysForecasts(){
			forecasts = [];
			let z = 0;
			let date = new Date();
			vForecasts.forEach(function(fo){
				if (forecasts.map(function(o) { return o.date; }).indexOf(formatDate(fo.date)) == -1){
					forecasts.push(new ForecastDay(formatDate(fo.date),[]));
					
				}
				
				for ( z= 0 ; z< forecasts.length; z++){
					if (forecasts[z].date == formatDate(fo.date) ){
						
						if (formatDate(fo.date) == formatDate(date) ){ 
							//if (fo.date.getHours() >= Math.max(date.getHours(),8) && fo.date.getHours()<= 23){
								forecasts[z].forecasts.push(fo);
							//}
						}
						else 
						if (fo.date.getHours() >= 8 && fo.date.getHours()<= 22){
							forecasts[z].forecasts.push(fo);
						}
						
					}
					
				}
			});
			if(forecasts[0].forecasts.length>= 5){
				forecasts[0].forecasts = forecasts[0].forecasts.slice(0,5);
			}
			
			
		}
		function formatDate(date) {
	        let month = '' + (date.getMonth() + 1);
	        let day = '' + date.getDate();
	        let year = date.getFullYear();

		    if (month.length < 2) 
		        month = '0' + month;
		    if (day.length < 2) 
		        day = '0' + day;
	
		    return [year, month, day].join('-');
		}
		function getWeatherHtml(){
			//document.getElementById('overflower').innerHTML = '';
			
			
			let weather = document.createElement('div');
			let overflower = document.createElement('div');
			let overflowerBack = document.createElement('div');
			overflowerBack.setAttribute ('id','overflower-back');
			overflowerBack.className = 'overflower-back';
			//overflowerBack.innerHTML = 'Lorem lipsum';
			/*
			let overflower_content = document.createElement('div');
			overflower_content.setAttribute ('id','overflower_content'); 
			overflower.appendChild(overflower_content);
			*/
			weather.setAttribute ('id','weather'); 
			weather.className = 'off';
			weather.setAttribute('augmented-ui', 'tl-clip tr-clip bl-clip br-clip b-clip-x t-clip-x l-clip-y r-clip-y exe');
			overflower.setAttribute ('id','overflower');   
			overflower.className='overflower';
			//overflower.setAttribute('augmented-ui-reset','');
			
			let lastcall = document.createElement('div');
			lastcall.className = 'lastcall';
			lastcall.innerHTML = forecastInform.lastWeatherCallDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
			
			overflower.appendChild(lastcall);
			forecasts.forEach(function(ev){
				overflower.appendChild( ev.processHtml());
			});
			
			weather.appendChild(overflower);
			weather.appendChild(overflowerBack);
			return weather;
		}
		function getElementDetails(id){
			let block = null;
			vForecasts.forEach(function(fo){
				
				if (fo.id == id) {
					console.log(fo.id);
					block=  fo.processHtmlDetails();
				}
			});
			return block;
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
				//'models.weather.found' : updateForecastP,
				//'models.location.distanceChange' : onDistanceChange,
				'views.canvas.updateWeather': function(e) {
					console.log('auto weatherUpdateTriggered');
					
					onUpdateTriggered('auto weatherUpdateTriggered');
				},
				'views.radial.update': function(e) {
					console.log('weatherUpdateTriggered');
					onUpdateTriggered('radial weatherUpdateTriggered');
				}
			});

		}
		function init() {
			bindEvents();
			decodeMapping();
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
				onUpdateTriggered('auto weatherUpdateTriggered');
			}
			
		}

		return {
			init : init,
			start : start,
			getWeatherIcon : getWeatherIcon,
			getWeatherText : getWeatherText,
			getMapping : getMapping,
			setPosition : setPosition,
			setChangeListener : setChangeListener,
			isWeatherFound : isWeatherFound,
			isForecastFound: isForecastFound,
			getForecast: getForecast,
			getWeatherHtml:getWeatherHtml,
			onUpdateTriggered:onUpdateTriggered,
			setIntervalUpdate:setIntervalUpdate,
			handleUpdate:handleUpdate,
			getElementDetails:getElementDetails
		};
	}

});
