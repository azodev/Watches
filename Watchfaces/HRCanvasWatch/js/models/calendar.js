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
		var start, now, end,month,day,year;
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
		function processDaysEvents(){
			myEvents = [];
			vEvents.forEach(function(ev){
				//if (typeof myEvents[formatDate(ev.startDate)] !== 'undefined') {
				/*if (myEvents.length == 0){
					myEvents.push({'day':formatDate(ev.startDate),'events':[]});
				}*/
				if (myEvents.map(function(o) { return o.day; }).indexOf(formatDate(ev.startDate)) == -1){
					myEvents.push({'day':formatDate(ev.startDate),'events':[]});
				}
				
				for (z= 0 ; z< myEvents.length; z++){
					if (myEvents[z].day == formatDate(ev.startDate)){
						myEvents[z].events.push(ev);
					}
				}
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
					accessCalendars(['gmail']);
				}
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
		function createAjaxes(){
			xmlHttps.push(new XMLHttpRequest() );
		}
		function accessCalendars(names){
			y=0;
			calendarNames = names;
			xmlHttps = [];
			calendarNames.forEach(createAjaxes ) 
			totalCall = calendarNames.length - 1;
			getNexcloudCalendar();  
			getNexcloudCalendar2("alten");
			
			
			
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
		function getNexcloudCalendar(){
			
			
			now = Date.now()/1000 ;
			start = Math.round((now-3600)+y); //Math.round((now - 86400));
			//console.log(start);
			end = Math.round((now + 86400)+y);
			//xmlHttp = new XMLHttpRequest();
			xmlHttps[y].open("GET", 'https://cloud.anthony-zorzetto.fr/remote.php/dav/calendars/anthony/'+calendarNames[y]+'?export&accept=jcal&expand=1&start='+start+'&end='+end, true);
			xmlHttps[y].withCredentials = true;
			xmlHttps[y].setRequestHeader("Authorization","Basic "+credentials);
			
			xmlHttps[y].send();
			
			//xmlHttp.overrideMimeType("application/json");
			xmlHttps[y].onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (this.status === 0 || this.status === 200) {
						if (xmlHttps[y].responseText) {
							// Parses responseText to JSON
							json = JSON.parse(this.responseText);
							calendar = json[2];
							for (i=0;i<calendar.length;i++){
								e = new vEvent(calendar[i]);
								if (!isDuplicate(e,vEvents)) vEvents.push (e);
								vEvents.sort(function (a,b){return a.startDate - b.startDate});
								processDaysEvents();
							}
							console.log('cal success');
							if( y < totalCall ){
				                y++;
				                getNexcloudCalendar();
				            }
							else return;
							
						} else {
							console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
							event.fire('error','Cal: '+calendar[i]+" "+this.status);
							if( y < totalCall ){
				                y++;
				                getNexcloudCalendar();
				            }
							else return;
						}
					}
					else {
						console.error('Update calendar: error');
						event.fire('error','Cal: '+calendar[i]+" "+this.status);
						console.error(this.status+" "+this.statusText);
						if( y < totalCall ){
			                y++;
			                getNexcloudCalendar();
			              }
						else return;
					}
				}
			};
		} 
		
		function getNexcloudCalendar2(name){
			
			
			now = Date.now()/1000 ;
			start = Math.round((now-3600)); //Math.round((now - 86400));
			//console.log(start);
			end = Math.round((now + 886400));
			xmlHttp2 = new XMLHttpRequest();
			xmlHttp2.open("GET", 'https://cloud.anthony-zorzetto.fr/remote.php/dav/calendars/anthony/'+name+'?export&accept=jcal&expand=1&start='+start+'&end='+end, true);
			xmlHttp2.withCredentials = true;
			xmlHttp2.setRequestHeader("Authorization","Basic "+credentials);
			
			xmlHttp2.send(null);
			
			//xmlHttp.overrideMimeType("application/json");
			xmlHttp2.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (this.status === 0 || this.status === 200) {
						if (xmlHttp2.responseText) {
							// Parses responseText to JSON
							json = JSON.parse(this.responseText);
							calendar = json[2];
							for (i=0;i<calendar.length;i++){
								e = new vEvent(calendar[i]);
								if (!isDuplicate(e,vEvents)) vEvents.push (e);
								vEvents.sort(function (a,b){return a.startDate - b.startDate});
								processDaysEvents();
								
							}
							console.log(vEvents);
						} else {
							console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
						}
					}
					else {
						console.error('Update calendar: error');
						console.error(this.status+" "+this.statusText);
					}
				}
			};
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
