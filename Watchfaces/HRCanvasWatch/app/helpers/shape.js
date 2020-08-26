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
 * @namespace helpers/shape
 * @memberof helpers
 */

define({
	name : 'helpers/shape',
	def : function helpersShape() {
		'use strict';
		var shapeObj;
		var position = {x:null,y:null};
		var size = {width: null, y:null};
		
		
		function getPosition(){
			return position;
		}
		function setPosition(x,y){
			position.x = x;
			position.y = y;
		}
		function setSize(width,height){
			size.width = width;
			size.height = height;
		}
		function getSize(){
			return size;
		}
		return {
			getPosition : getPosition,
			truncateBis : truncateBis,
			getRandomInt : getRandomInt
		};
	}
});