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
 * Date helper module.
 *
 * @namespace helpers/date
 * @memberof helpers
 */

define({
    name: 'helpers/date',
    def: function helpersDate() {
        'use strict';
        var dateObj;
        /**
         * Returns parent node with class name given as second parameter
         * of the child given as first parameter.
         *
         * @memberof helpers/date
         * @public
         * @param {Date} date
         * @returns {Date}
         */
        function getDate() {

			try {
				dateObj = tizen.time.getCurrentDateTime();
			} catch (err) {
				dateObj = new Date();
			}

			return dateObj;
		}
        function fancyTimeFormat(time)
        {   
        	var ret= '';
        	var array = {
        			hours: ~~(time / 3600),
        			minutes: ~~((time % 3600) / 60)
        			
        			};
        	
            // Hours, minutes and seconds
            var hrs = ~~(time / 3600);
            var mins = ~~((time % 3600) / 60);

            // Output like "1:01" or "4:03:59" or "123:03:59"
            

            if (hrs > 0) {
                ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            }
            if (mins > 0)  {
            	ret += "" + mins;
            }
            return ret;
        }
        function roundMinutes(date) {

            date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
            date.setMinutes(0);

            return date;
        }
        
        
        return {
        	getDate: getDate,
        	fancyTimeFormat : fancyTimeFormat,
        	roundMinutes:roundMinutes
        };
    }
});
