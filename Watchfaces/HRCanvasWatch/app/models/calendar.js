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
		var calendarNames = [];
		var totalCall;
		var e, dup;
		var BreakException = {};
		var credentials= window.btoa('anthony:DoubleSMB01.');
		var myEvents = [];
		var template = {'day':null,'events':null};
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
		function fillCalendar(){
			document.getElementById('overflower').innerHTML = '';
			myEvents.forEach(function(ev){
				ev.processHtml();
			});
		}

		
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/calendar
		 * @private
		 */
		function bindEvents() {
			event.on({
				'views.radial.update' : function() {
					accessCalendars();
				},
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
			
			doPromise('alten').then( function (){
				doPromise('gmail').then(function(){
					handleFilterForFinishedEvents();
					
				});
			}
					
			);
			
			
			
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
			return (vEvents.length> 0)?true:false;
		}
		/* Defines the event success callback. */
		
		function init() {
			bindEvents();
			
			
		}
		/*function fetchNextCloudCalendar(){
			now = Date.now()/1000 ;
			start = Math.round((now-3600)+y); //Math.round((now - 86400));
			//console.log(start);
			end = Math.round((now + 86400)+y);

			let uri = 'https://cloud.anthony-zorzetto.fr/remote.php/dav/calendars/anthony/gmail?export&accept=jcal&expand=1&start='+start+'&end='+end+'&rand='+Math.random();
            
            let h = new Headers();
            h.append('Accept', 'application/json');
            let encoded = window.btoa('anthony:DoubleSMB01.');
            let auth = 'Basic ' + encoded;
            h.append('Authorization', auth );
            console.log( auth );
            
            let req = new Request(uri, {
                method: 'GET',
                headers: h,
                credentials: 'include'
            });
            //credentials: 'same-origin'
            
            fetch(req)
            .then( (response)=>{
                if(response.ok){
                    return response.json();
                }else{
                	console.log(response);
                    throw new Error('BAD HTTP stuff');
                }
            })
            .then( (jsonData) =>{
                console.log(jsonData);
               
            })
            .catch( (err) =>{
                console.log('ERROR:', err.message);
            });
			
			
		}
		*/
		function wasRequestSuccessful(status) {
			return status >= 200 && status < 300;
		}
		function doPromise(name){
			let p1 = new Promise((resolve, reject) => {
				
				now = Date.now()/1000 ;
				start = Math.round((now-3600)); //Math.round((now - 86400));
				//console.log(start);
				end = Math.round((now + 86400)); 
				const  xhr = new XMLHttpRequest();
				xhr.open("GET", 'https://cloud.anthony-zorzetto.fr/clrs/'+name+'.json',true);



				
				xhr.onreadystatechange = () => {
					if (xhr.readyState !== 4) {
						return;
					}
					

					if (!wasRequestSuccessful(xhr.status)) {
						if (xhr.status >= 400 && xhr.status < 500) {
							reject(null);
							return;
						}
						if (xhr.status >= 500 && xhr.status < 600) {
							reject(null);
							return;
						}

						reject(null);
						return;
					}

					
					resolve(xhr.responseText);
				};

				xhr.onerror = () => reject('error');

				xhr.onabort = () => reject('aborted');
				xhr.send();
			});
			p1.then(handleResponse)
			
			.catch(
					// Promesse rejetée
					
						function(message) {
							console.log(message);
						});
			return p1;
		}
		
		function handleResponse(responseText){
			console.log('calendar');
			json = JSON.parse(responseText);
			calendar = json[2];
			for (i=0;i<calendar.length;i++){
				e = new vEvent(calendar[i]);
				if (!isDuplicate(e,vEvents)) vEvents.push (e);
				vEvents.sort(function (a,b){return a.startDate - b.startDate});
			}
			
		}
		function handleFilterForFinishedEvents(){
			vEvents = vEvents.filter (filterFinishedVEvents);
			buildDaysEvents();
			fillCalendar();
			document.querySelectorAll("#calendar .event").forEach(function (element){
				console.log('event onclick creation');
				element.addEventListener('click', function(e) {
					console.log('click event');
					setClassAndWaitForTransition(element,'event click','color').then(function () {
						console.log('transition event');
						element.setAttribute('class', 'event');
					});
						
				});
			});
		}
 
		function filterFinishedVEvents(event){ 
			return   (nowDate <= event.endDate);
		}
		function createHtml(){
			
		}
		function someCallback(e){
			console.log(e);
		}
		return {
			init : init,
			getVEvents : getVEvents,
			accessCalendars : accessCalendars,
			hasVEvents : hasVEvents,
			formatDate : formatDate
			
		};
	}
});
