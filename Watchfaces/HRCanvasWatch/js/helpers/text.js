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

/* global define */

/**
 * text helper module.
 * 
 * @namespace helpers/text
 * @memberof helpers
 */

define({
	name : 'helpers/text',
	def : function helpersText() {
		'use strict';
		var textObj;
		/**
		 * Returns parent node with class name given as second parameter of the
		 * child given as first parameter.
		 * 
		 * @memberof helpers/date
		 * @public
		 * @param {Date}
		 *            date
		 * @returns {Date}
		 */
		function truncate(text, limit, after) {

			// Make sure an element and number of items to truncate is provided
			if (!text || !limit) {
				return text;
			}

			// Get the inner content of the element
			text = text.trim();

			// Convert the content into an array of words
			// Remove any words above the limit
			text = text.split(' ').slice(0, limit);

			// Convert the array of words back into a string
			// If there's content to add after it, add it
			text = text.join(' ') + (after ? after : '');
			textObj = text;
			return textObj;

		}
		function truncateBis(text, limit, after) {
			textObj = text.substring(0, Math.min(limit, text.length));
			if (text.length > textObj.length + 3) {
				textObj = textObj + (after ? after : '');
			}

			return textObj;

		}
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min;
		}

		return {
			truncate : truncate,
			truncateBis : truncateBis,
			getRandomInt : getRandomInt
		};
	}
});