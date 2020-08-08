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
		var xmlHttp = null;
		var json = null;
		var start, now, end;
		/**
		 * Returns last received motion data.
		 * 
		 * @memberof models/calendar
		 * @private
		 * @returns {object}
		 */
		function getData() {
			return calendarData;
		}


		
		/**
		 * Registers event listeners.
		 * 
		 * @memberof models/calendar
		 * @private
		 */
		function bindEvents() {

		}

		/**
		 * Initializes the module.
		 * 
		 * @memberof models/calendar
		 * @public
		 */
	
		function errorCallback(response)
		{
		  console.log("The following error occurred: " + response.name);
		}

		/* Defines the success callback. */
		function updateEventsSuccess()
		{
		  console.log("Successfully updated !");
		}

		/* Defines the event success callback. */
		function eventSearchSuccessCallback(events)
		{
			console.log(events);

		  /* Updates the first two existing events. */
			//calendar.updateBatch(events.slice(0, 2), updateEventsSuccess, errorCallback);
		}

		/* Gets a list of available calendars. */
		function getAccountsSuccess(acc){
			console.log(acc);
		}
		function error(e){
			
		}
		function init() {
			bindEvents();
            /*calendar = tizen.calendar.getDefaultCalendar('EVENT');
            calendar.find(eventSearchSuccessCallback, errorCallback);
            console.log(calendar);*/
			//tizen.account.getAccounts(getAccountsSuccess, error);
			/*calendar = tizen.calendar.getDefaultCalendar("EVENT");
			calendar.find(eventSearchSuccessCallback, errorCallback);*/
			/*
			$.ajax({
	            type: 'post',
	            url: 'https://cloud.anthony-zorzetto.fr/remote.php/dav/calendars/anthony/gmail?export&accept=jcal',
	            crossDomain: true,
	            
	            dataType: 'json',
	            xhrFields: {
	                withCredentials: true
	            },
	            data: {
	                username : 'anthony',
	                password : 'DoubleSMB01.',
	            },
	            success: someCallback
	        });*/
			
		}
		function getNexcloudCalendar(){
			xmlHttp = new XMLHttpRequest();
			var credentials= window.btoa('anthony:DoubleSMB01.');
			//xmlHttp.overrideMimeType("application/json");
			xmlHttp.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					if (this.status === 0 || this.status === 200) {
						if (xmlHttp.responseText) {
							// Parses responseText to JSON
							json = JSON.parse(this.responseText);
							console.log(json);
							
							
						} else {
							console.error("Status de la réponse: %d (%s)", this.status, this.statusText);
							console.log(xmlHttp);
						}
					}
					else {
						console.error('Update Weather: error');
						console.error(this.status+" "+this.statusText);
						
					}
				}

			};
			now = Date.now()/1000 ;
			
			
			start = Math.round((now - 86400));
			console.log(start);
			end = Math.round((now + 259200));
			xmlHttp.open("GET", 'https://cloud.anthony-zorzetto.fr/remote.php/dav/calendars/anthony/gmail?export&accept=jcal&expand=1&start='+start+'&end='+end, true);
			xmlHttp.withCredentials = true;
			xmlHttp.setRequestHeader("Authorization","Basic "+credentials);


			xmlHttp.send(null);
		} 
		function someCallback(e){
			console.log(e);
		}
		return {
			init : init,
			getData : getData
		};
	}
});
