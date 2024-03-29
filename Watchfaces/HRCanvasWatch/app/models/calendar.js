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
 * @module models/calendar
 * @requires {@link core/event}
 * @namespace models/calendar
 * @memberof models/calendar
 */

define({
	name : 'models/calendar',
	requires : [ 'core/event' ],
	def : function modelsCalendar(e) {
		'use strict';

		/**
		 * Core event module object.
		 * 
		 * @memberof models/calendar
		 * @private
		 * @type {Module}
		 */
		var event = e;


		var started = false;
		var found = false;
		var calendar = null;
		var xmlHttps = [], xmlHttp2 = null;
		var json = null;
		var i,y,z;
		var start, now, end,month,day,year,nowDate;
		var vEvents =[];
		var hasEvents = false;
		var lengthDaily = 0;
		var calendarNames = [];
		var totalCall;
		var e, dup;
		var BreakException = {};
		var myEvents = [];
		var template = {'day':null,'events':null};
		var old_timestampF = null, old_timestampU = null, intervalF, intervalU, navStart = performance.timing.navigationStart;
		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/calendar
		 * @private
		 * @returns {object}
		 */
		function isDay(el,date) {
			  return el.day === date;
			}
		function formatDate(date) {
		        month = '' + (date.getMonth() + 1);
		        day = '' + date.getDate();
		        year = date.getFullYear();

		    if (month.length < 2) 
		        month = '0' + month;
		    if (day.length < 2) 
		        day = '0' + day;

		    return [year, month, day].join('-');
		}
		function buildDaysEvents(){
			myEvents = [];
			vEvents.forEach(function(ev){
				if (myEvents.map(function(o) { return o.date; }).indexOf(formatDate(ev.startDate)) == -1){
					myEvents.push(new DayEvents(formatDate(ev.startDate),[]));
					
				}
				
				for (z= 0 ; z< myEvents.length; z++){
					if (myEvents[z].date == formatDate(ev.startDate) ){
						myEvents[z].events.push(ev);
					}
				}
			});
		}
		function getCalendarHtml(){
			//document.getElementById('overflower').innerHTML = '';
			
			
			let calendar = document.createElement('div');
			let overflower = document.createElement('div');
			overflower.setAttribute ('id','overflower');
			overflower.className='overflower';
			
			
			calendar.setAttribute ('id','calendar');
			calendar.className = 'off';
			calendar.setAttribute('augmented-ui', 'tl-clip tr-clip bl-clip br-clip b-clip-x t-clip-x l-clip-y r-clip-y exe');
			
			myEvents.forEach(function(ev){
				overflower.appendChild( ev.processHtml());
			});
			
			calendar.appendChild(overflower);
			
			return calendar;
		}

		
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/calendar
		 * @private
		 */
		function bindEvents() {
			event.on({
				'views.radial.update' : accessCalendars,
					
				'views.canvas.updateEvents' : accessCalendars,
				'views.canvas.filterEvents' : handleFilterForFinishedEvents
			});
		}

		/**
		 * Initializes the module.
		 * 
		 * @memberof models/calendar
		 * @public
		 */
		function getVEvents(){
			return vEvents;
		}
		
		function accessCalendars(){
			
			nowDate = new Date();
			//console.log('Fetch calendars');
			//event.fire('log','Fetch calendars');

			doFetch().then((res)=> {
					handleFilterForFinishedEvents();	
			}).catch(e => {
				console.log('Error fetching gmail '+e.message);
			});
		}
		function isDuplicate (vEvent, vEvents){
			dup = false;
			try {
				vEvents.forEach(function(el){
					if (el.title == vEvent.title && el.startDate.toString() == vEvent.startDate.toString() && el.endDate.toString() == vEvent.endDate.toString()) {
						throw BreakException;
					}
				});
			}
			catch (e) {
				  dup= true;
				}
			return dup;
		}
		function hasVEvents(){
			return (lengthDaily> 0)?true:false;
		}
		function getNbEvents(){
			return lengthDaily;
		}
		/* Defines the event success callback. */
		
		function init() {
			bindEvents();
			
			
		}
		

		
		
		function doFetch(){
			if (navigator.onLine){
				let fetch = fetchCalendar('alten').then((json) => {
					
					handleJson(json);
					return   fetchCalendar('gmail');
				}).then((json) => {
					
					handleJson(json);
					
				});
				return fetch;
			}
		}
		
		function doFetchWithWorker(){ 
			if (navigator.onLine){
				
				let worker = new Worker('lib/workers/calendarWk.js');
				worker.onmessage = function(e) {
					if (e.data.output){
						let json = e.data.output;
						weatherFound = true;
						event.fire('found', weatherInform); 
						updateForecastWithWorker();
						worker.terminate();
					}
				}
				worker.onerror = function (err){
					console.error(err);
				};
				worker.postMessage({
		            'url': url
		        });
			}
		}
		
		
		
		
		async function fetchCalendar(name) {
			let response = await fetch(url);
			
			
			  if (!response.ok) {
			    throw new Error('HTTP error! status: '+response.status);
			  } else {
				  return await response.json();
			   
			  }
		}
		
		function handleJson(json){
			calendar = json[2];
			for (i=0;i<calendar.length;i++){
				e = new vEvent(calendar[i]);
				if (!isDuplicate(e,vEvents)) vEvents.push (e);
				vEvents.sort(function (a,b){return a.startDate - b.startDate});
			}
			
		}
		
		

		function handleFilterForFinishedEvents(){
			if (vEvents.length > 0){
				//console.log('Filter events');
				//event.fire('log','Filter events');
				vEvents = vEvents.filter (filterFinishedVEvents);
				buildDaysEvents();
			}
			lengthDaily = vEvents.length;
			if (lengthDaily > 0 ) {
				event.fire('hasEvent',true);
			}
			else event.fire('hasEvent',false);
			//fillCalendar();
			
		}
		function setIntervalUpdate(i){
			intervalU = i;
		}
		function setIntervalFilter(i){
			intervalF = i; 
		}
		function handleUpdate(ts){
			if (old_timestampU == null){
				old_timestampU = ts;
			}
			
			if (ts-old_timestampU >=  intervalU ){
				
				old_timestampU = ts;
				
				let curDate = new Date();
				if (curDate.getHours() >= 7 && curDate.getHours() <= 22) 	accessCalendars();
			}
			
			
		}
		function handleFilter(ts){
			if (old_timestampF == null){
				old_timestampF = ts;
			}
			
			if (ts-old_timestampF >=  intervalF ){
				old_timestampF = ts;
				
				handleFilterForFinishedEvents();
			}
			
		}
		function filterFinishedVEvents(event){ 
			return   (nowDate <= event.endDate);
		}
		function someCallback(e){
			console.log(e);
		}
		return {
			init : init,
			getVEvents : getVEvents,
			accessCalendars : accessCalendars,
			hasVEvents : hasVEvents,
			getNbEvents : getNbEvents,
			formatDate : formatDate,
			getCalendarHtml:getCalendarHtml,
			setIntervalUpdate:setIntervalUpdate,
			setIntervalFilter:setIntervalFilter,
			handleUpdate:handleUpdate,
			handleFilter:handleFilter
			
		};
	}
});
