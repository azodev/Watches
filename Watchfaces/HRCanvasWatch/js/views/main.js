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
 * Main view module.
 * 
 * @module views/main
 * @requires {@link core/event}
 * @requires {@link views/canvas}
 * @namespace views/main
 * @memberof views/main
 */

define({
	name : 'views/main',
	requires : [ 'core/event', 'views/canvas' ],
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
		var lastClickTimeStamp = null, currentClickTimeStamp = null;
		var newDir, newFile;
		const CLICK_INTERVAL = 500;

		function handleClick(ev) {
			currentClickTimeStamp = Date.now();
			if (lastClickTimeStamp !== null && currentClickTimeStamp - lastClickTimeStamp <= CLICK_INTERVAL) {
				handleDoubleClick(ev);
			} else {
				handleSingleClick(ev);
			}
			lastClickTimeStamp = currentClickTimeStamp;
		}

		function handleDoubleClick(ev) {

			triggerCanvasClick(ev);
		}
		function handleSingleClick(ev) {
			console.log('handleSingleClick');
		}

		

		function bindEvents() {
			alertElement.addEventListener('popuphide', onPopupHide);
			alertOk.addEventListener('click', onOkClick);
			document.getElementById('canvas-layout').addEventListener('click', function() {
				handleClick(this);
			});
			event.on({
			// 'models.location.error': openAlert
			// 'models.weather.error' : openAlert

			});

		}
		function triggerCanvasClick(ev) {
			event.fire('triggerLocationUpdate', true);
			// //event.fire('canvasClick', true);
		}
		/**
		 * Handles popupHide event on popup element.
		 * 
		 * @private
		 */
		function onPopupHide(ev) {
			// app.exit();
		}
		/**
		 * Shows alert popup.
		 * 
		 * @private
		 * @param {string}
		 *            message Message.
		 */
		function openAlert(message) {

			if (message && message.detail && message.detail !== 1) {
				write('\n' + message.detail);
				// alertMessage.innerHTML = 'Alerte';
			} else {
				//alertMessage.innerHTML = '';
			}
			// tau.openPopup(alertElement);
		}
		/**
		 * Handles click event on OK button.
		 * 
		 * @private
		 */
		function onOkClick(ev) {
			// tau.closePopup();
		}
		/**
		 * Initializes module.
		 * 
		 * @memberof views/main
		 * @public
		 */
		function init() {
			alertElement = document.getElementById('alert');
			alertMessage = document.getElementById('alert-message');
			alertOk = document.getElementById('alert-ok');
			bindEvents();
			// console.error(tizen.systeminfo.getCapabilities() );
		}

		return {
			init : init
		};
	}

});
