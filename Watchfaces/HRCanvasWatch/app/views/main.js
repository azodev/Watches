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

/* global define, document, window*/

/**
 * Main view module.
 * 
 * @module views/main
 * @requires {@link core/event}
 * @requires {@link views/canvas}
 * @namespace views/main
 * @memberof views
 */

define({
	name : 'views/main',
	requires : [ 'core/event', 'views/canvas'  ],
	def : function viewsPageMain(req) {
		'use strict';

		/**
		 * Core event module object.
		 * 
		 * @memberof views/main
		 * @private
		 * @type {Module}
		 */
		var event = req.core.event,
		/**
		 * Reference to the 'alert' popup.
		 * 
		 * @private
		 * @type {HTMLElement}
		 */
		alertElement = null,

		/**
		 * Reference to the alert message element.
		 * 
		 * @private
		 * @type {HTMLElement}
		 */
		alertMessage = null,

		/**
		 * Reference to the 'ok' button on the alert popup.
		 * 
		 * @private
		 * @type {HTMLElement}
		 */
		alertOk = null;
		/**
		 * Registers event listeners.
		 * 
		 * @memberof views/main
		 * @private
		 */

		var newDir, newFile;

		var notification, notificationDict;
		function bindEvents() {
			/*window.addEventListener('mousedown', function(e) {
		        e.preventDefault();            
		    })*/
			event.on({
				//'models.location.distanceChange' : postNotification,
				'models.location.error' : postNotification,
				'models.location.log' : postNotification,
				'models.motion.error' : postNotification,
				'models.pedometer.error' : postNotification,
				//'views.canvas.log' : postNotification,
				//'models.weather.log' : postNotification,
				'models.weather.error' : postNotification,
				//'models.calendar.log' : postNotification,
				'models.calendar.error' : postNotification

			});
			document.body.addEventListener('touchmove',function(e)
					{
						 
							e = e || window.event;
						    var target = e.target || e.srcElement;
						    //in case $altNav is a class:
						    if (!target.className.match(/\baltNav\b/))
						    {
						        e.returnValue = false;
						        e.cancelBubble = true;
						        try{
							        if (e.preventDefault)
							        {
							            e.preventDefault();
							            e.stopPropagation();
							        }
						        }
								catch (e) {
									e.stopPropagation();
									
								}
						        return false;//or return e, doesn't matter
						    }
						
					    
					    //target is a reference to an $altNav element here, e is the event object, go mad
					},false);
		}

		/**
		 * Handles popupHide event on popup element.
		 * 
		 * @private
		 */
		function postNotification(message) {

			try {
				if (message && message.detail && message.detail !== 1) {
					// Sets notification dictionary.
					let date = new Date();
					
					
					notificationDict = {
						content : message.detail+"\n"+date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
					};
					// Creates notification object.
					notification = new tizen.UserNotification("SIMPLE", "Particles", notificationDict);

					// Posts notification.
					tizen.notification.post(notification);
				}

			} catch (err) {
				//console.log(err.name + ": " + err.message);
			}
		}
		/**
		 * Initializes module.
		 * 
		 * @memberof views/main
		 * @public
		 */
		function init() {
			bindEvents();
		}
		return {
			init : init
		};
	}

});
