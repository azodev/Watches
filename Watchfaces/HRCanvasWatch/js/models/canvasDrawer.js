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
 * @module models/canvasDrawer
 * @requires {@link core/event}
 * @requires {@link core/storage/idb}
 * @namespace models/canvasDrawer
 * @memberof models/canvasDrawer
 */

define({
	name : 'models/canvasDrawer',
	requires : [ 'core/event', 'core/storage/idb' ],
	def : function modelsCanvasDrawer(req) {
		'use strict';

		var center, event = req.core.event;
		var radius, centerX, centerY, dxi, dyi, dxf, dyf, textdate, font, align, angle = 0, radiusArc, 
		indexX = 0, rotate = false, gradient = null, gradientLinear = null, doGradient = false, gridGradient = null , watchOpacity = 1, animating = false, fading = false,showing = false;
		var radialGradient = null;
		var coords = {
			x : 0,
			y : 0
		};
		var gradientCoordsD = {
			x1 : 360,
			y1 : 360,
			x2 : 0,
			y2 : 0
		};
		var gradientCoords = {
			x1 : 360,
			y1 : 360,
			x2 : 0,
			y2 : 0
		};
		var linearGoldenGrd = null;
		var radialGradient = null;

		var radialGradientCoordsD = {
			x : 180,
			y : 180
		};
		var radialGradientCoords = {
			x : 180,
			y : 180
		};
		var dx, dy, x, y, i;
		var center1 = {
			x : 0,
			y : 0
		};
		var center2 = {
			x : 0,
			y : 0
		};
		var gx, gy, cx, cy ;
		var gradientAngle = 0;
		const
		maxLength = Math.sqrt(360 * 360 + 360 * 360);
		var opacity = false;
		var theme= 'ice';
		var grdAmbiant = null;
		var timePassed = 0;

		/**
		 * Renders a circle with specific center, radius, and color
		 * 
		 * @public
		 * @param {object}
		 *            context - the context for the circle to be placed in
		 * @param {number}
		 *            radius - the radius of the circle
		 * @param {string}
		 *            color - the color of the circle
		 */
		function setOpacity(opacity){
			watchOpacity = opacity;
		}
		function startFade(){
			fading = true;
			timePassed = 0;
			watchOpacity = 1;
			console.log('Start fade');
			
		} 
		function isFading(){
			return fading;
		}
		function fade(secondsPassed, duration ){
			if (fading === true){
				secondsPassed = Math.min(secondsPassed, 0.05);
				timePassed += secondsPassed;
				setOpacity(1- ( timePassed/duration));
				if (watchOpacity <= 0) {
					fading = false;
					watchOpacity = 0;
					timePassed = 0;
				}
			}
		}
		function startShow(){
			showing = true;
			timePassed = 0;
			watchOpacity = 0;
			console.log('Start show');
			
		} 
		function isShowing(){
			return showing;
		}
		function show(secondsPassed, duration ){
			if (showing === true){
				console.log(watchOpacity);
				secondsPassed = Math.min(secondsPassed, 0.05);
				timePassed += secondsPassed;
				setOpacity( ( timePassed/duration));
				console.log(watchOpacity);
				if (watchOpacity >= 1) {
					showing = false;
					watchOpacity = 1;
					timePassed = 0;
				}
			}
		}
		
		function renderGrid(context, color, width, options) {
			context.save();

			x = 0;
			y = 0;
			context.lineWidth = width;
			
			context.strokeStyle = "rgba(70, 70, 70,0.2)";

			for (i = 30; i < 360; i = i + 30) {
				x = i;

				if (options.motion !== null) {
					center1.x = -options.motion.accelerationIncludingGravity.x * 6;
					center1.y = 180 - (options.motion.accelerationIncludingGravity.y) * 6;
				}
				if (i < 180) {
					center1.x = center1.x * (i / 100)   ; //+( i*5/180);
					// center1.y = center1.y * (i/100);
				} else {
					center1.x = center1.x * ((360 - i) / 100);
					// center1.y = center1.y * ((360- i)/100) ;
				}
				// a = curve verticale a = curve /2 ; b = position du centre
				// courbe ; c et d x et y du endpoint
				context.translate(x, y);
				context.beginPath();
				context.moveTo(-3, 0);
				context.quadraticCurveTo(~~center1.x + 3, ~~center1.y, -3, 360);
				context.stroke();
				/*context.beginPath();
				context.moveTo(-1, 0);
				context.quadraticCurveTo(~~center1.x + 1, ~~center1.y, -1, 360);
				context.stroke();*/
				context.beginPath();
				context.moveTo(0, 0);
				context.quadraticCurveTo(~~center1.x, ~~center1.y, 0, 360);
				context.stroke();
				/*context.beginPath();
				context.moveTo(1, 0);
				context.quadraticCurveTo(~~center1.x - 1, ~~center1.y, 1, 360);
				context.stroke();*/
				context.beginPath();
				context.moveTo(3, 0);
				context.quadraticCurveTo(~~center1.x - 3, ~~center1.y, 3, 360);
				context.stroke();
				context.translate(-x, -y);
			}
			x = 0;
			y = 0;
			for (i = 30; i < 360; i = i + 30) {
				y = i;

				// a = position du centre courbe ; b = curve horizontale b =
				// curve /2; c et d x et y du endpoint
				if (options.motion !== null) {
					center2.x = 180 - (options.motion.accelerationIncludingGravity.x) * 6;
					center2.y = -options.motion.accelerationIncludingGravity.y * 6 ;
				}

				if (i <= 180) {
					// center2.x = center2.x * (i/100) ;
					center2.y = center2.y * ((i) / 100);
				} else {
					// center2.x = center2.x * ((360- i)/100) ;
					center2.y = center2.y * ((360 - (i)) / 100);
				}
				context.translate(x, y);
				context.beginPath();
				context.moveTo(0, -3);
				context.quadraticCurveTo(~~center2.x, ~~center2.y + 3, 360, -3);
				context.stroke();
				/*context.beginPath();
				context.moveTo(0, -1);
				context.quadraticCurveTo(~~center2.x, ~~center2.y + 1, 360, -1);
				context.stroke();*/
				context.beginPath();
				context.moveTo(0, 0);
				context.quadraticCurveTo(~~center2.x, ~~center2.y, 360, 0);
				context.stroke();
				/*context.beginPath();
				context.moveTo(0, -1);
				context.quadraticCurveTo(~~center2.x, ~~center2.y - 1, 360, 1);
				context.stroke();*/
				context.beginPath();
				context.moveTo(0, -3);
				context.quadraticCurveTo(~~center2.x, ~~center2.y - 3, 360, 3);
				context.stroke();
				context.translate(-x, -y);
			}
			// context.closePath();
			context.restore();

		}
		function renderCircle(context, CircleShape, color, width,exclude) {
			context.save();
			context.beginPath();
			context.lineWidth = width;
			if (gradientLinear !== null) {
				color = gradientLinear;
			}
			if (typeof exclude === 'undefined') {
				let exclude = false;
			}
			/*
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowColor = "rgb(150, 150, 150)";

			context.shadowBlur = 5;
			*/
			context.strokeStyle = color;
			context.arc(CircleShape.getCenter().x, CircleShape.getCenter().y, CircleShape.getRadius(), 0, 2 * Math.PI);
			/*if (opacity == true){
				context.fillStyle = '#000000';
				context.globalAlpha = 0.5;
			    context.fill();
			    context.globalAlpha = 1;
			}*/
			if (!exclude){
				context.globalAlpha = watchOpacity;
			}
			
			context.stroke();
			context.closePath();
			
			context.restore();
		}
		function renderBackground(context, width, height, color, options) {
			context.save();
			context.beginPath();
			doRadialGradientOrColor(context, color, options);
			context.closePath();
			context.fillRect(0, 0, width, height);
			context.restore();

		}
		function drawPulse(context, center, radius, color, hr) {

			// color in the background
			if (hr === null) {
				hr = 100;
			}
			// draw the circle
			context.save();
			context.beginPath();
			// radiusArc = radius * Math.abs(Math.cos(angle));
			radiusArc = radius - 15 * Math.abs(Math.cos(angle * 2) * Math.sin(angle * 4));
			context.arc(center.x, center.y, radiusArc, 0, Math.PI * 2, false);
			context.closePath();

			// color in the circle
			context.fillStyle = "#006699";
			context.fill();
			context.restore();
			angle += Math.PI / 180;
		}

		/**
		 * Draws a rounded rectangle using the current state of the canvas. If
		 * you omit the last three params, it will draw a rectangle outline with
		 * a 5 pixel border radius
		 * 
		 * @param {CanvasRenderingContext2D}
		 *            ctx
		 * @param {Number}
		 *            x The top left x coordinate
		 * @param {Number}
		 *            y The top left y coordinate
		 * @param {Number}
		 *            width The width of the rectangle
		 * @param {Number}
		 *            height The height of the rectangle
		 * @param {Number}
		 *            [radius = 5] The corner radius; It can also be an object
		 *            to specify different radii for corners
		 * @param {Number}
		 *            [radius.tl = 0] Top left
		 * @param {Number}
		 *            [radius.tr = 0] Top right
		 * @param {Number}
		 *            [radius.br = 0] Bottom right
		 * @param {Number}
		 *            [radius.bl = 0] Bottom left
		 * @param {Boolean}
		 *            [fill = false] Whether to fill the rectangle.
		 * @param {Boolean}
		 *            [stroke = true] Whether to stroke the rectangle.
		 */
		function roundRect(context, shape, radius, fill, stroke, strokeColor, fillColor,alpha) {
			context.save();
			if (typeof stroke === 'undefined') {
				stroke = true;
			}
			if (typeof alpha === 'undefined') {
				alpha = 1;
			}
			if (typeof radius === 'undefined') {
				radius = 5;
			}
			if (typeof radius === 'number') {
				radius = {
					tl : radius,
					tr : radius,
					br : radius,
					bl : radius
				};
			} else {
				var defaultRadius = {
					tl : 0,
					tr : 0,
					br : 0,
					bl : 0
				};
				for ( var side in defaultRadius) {
					radius[side] = radius[side] || defaultRadius[side];
				}
			}
			context.beginPath();
			/*
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowColor = "rgb(150, 150, 150)";
			context.shadowBlur = 5;
			*/
			context.moveTo(shape.getX() + radius.tl, shape.getY());
			context.lineTo(shape.getX() +  shape.getWidth() - radius.tr, shape.getY());
			context.quadraticCurveTo(shape.getX() + shape.getWidth(), shape.getY(), shape.getX() + shape.getWidth(), shape.getY() + radius.tr);
			context.lineTo(shape.getX() + shape.getWidth(), shape.getY() + shape.getHeight() - radius.br);
			context.quadraticCurveTo(shape.getX() + shape.getWidth(), shape.getY() + shape.getHeight(), shape.getX() + shape.getWidth() - radius.br, shape.getY() + shape.getHeight());
			context.lineTo(shape.getX() + radius.bl, shape.getY() + shape.getHeight());
			context.quadraticCurveTo(shape.getX(), shape.getY() + shape.getHeight(), shape.getX(), shape.getY() + shape.getHeight() - radius.bl);
			context.lineTo(shape.getX(), shape.getY() + radius.tl);
			context.quadraticCurveTo(shape.getX(), shape.getY(), shape.getX() + radius.tl, shape.getY());
			context.closePath();
			if (fill) {
				context.fillStyle = fillColor;
				context.fill();
			}
			if (gradientLinear !== null) {
				strokeColor = gradientLinear;
				//context.globalAlpha = alpha;
			}
			context.globalAlpha = watchOpacity;
			if (stroke) {
				context.strokeStyle = strokeColor;
				context.stroke();
			}
			
			context.restore();
		}

		/**
		 * Renders a needle with specific center, angle, start point, end point,
		 * width and color
		 * 
		 * @public
		 * @param {object}
		 *            context - the context for the needle to be placed in
		 * @param {number}
		 *            angle - the angle of the needle (0 ~ 360)
		 * @param {number}
		 *            startPoint - the start point of the needle (-1.0 ~ 1.0)
		 * @param {number}
		 *            startPoint - the end point of the needle (-1.0 ~ 1.0)
		 * @param {number}
		 *            width - the width of the needle
		 * @param {string}
		 *            color - the color of the needle
		 */
		function renderNeedle(context, angle, startPoint, endPoint, width, color) {
			radius = context.canvas.width / 2;
			centerX = context.canvas.width / 2;
			centerY = context.canvas.height / 2;
			dxi = radius * Math.cos(angle) * startPoint;
			dyi = radius * Math.sin(angle) * startPoint;
			dxf = radius * Math.cos(angle) * endPoint;
			dyf = radius * Math.sin(angle) * endPoint;

			context.save();
			context.beginPath();
			context.lineWidth = width;
			if (gradientLinear === null) {
				gradientLinear = context.createLinearGradient(0, 0, 360, 360);
				//gradientLinear.addColorStop(0, "rgb(255, 210, 49)");
				//gradientLinear.addColorStop(1, "rgb(255, 153, 51)");
				
				gradientLinear.addColorStop(0, "rgb(30,87,153)");
				gradientLinear.addColorStop(0.3, "rgb(41,137,216)");
				gradientLinear.addColorStop(0.6, "rgb(32,124,202)");
				gradientLinear.addColorStop(1, "rgb(125,185,232)");
			}

			context.strokeStyle = gradientLinear;
			context.moveTo(centerX + dxi, centerY + dyi);
			context.lineTo(centerX + dxf, centerY + dyf);
			context.stroke();
			context.closePath();
			context.restore();
		}

		/**
		 * Renders text at a specific center, radius, and color
		 * 
		 * @public
		 * @param {object}
		 *            context - the context for the text to be placed in
		 * @param {string}
		 *            text - the text to be placed
		 * @param {number}
		 *            x - the x-coordinate of the text
		 * @param {number}
		 *            y - the y-coordinate of the text
		 * @param {number}
		 *            textSize - the size of the text in pixel
		 * @param {string}
		 *            color - the color of the text
		 */
		function renderText(context, text, x, y, textSize, color, options) {
			if (typeof options !== 'undefined') {
				if (typeof options.font !== 'undefined') {
					font = options.font;
				}
				if (typeof options.align !== 'undefined') {
					align = options.align;
				}
				if (typeof options.rotate !== 'undefined') {
					rotate = true;
					angle++;
				}

			} else {
				font = 'Courier';
				align = "center";
				options = {};
			}
			context.save();
			// context.beginPath();
			context.font = textSize + 'px "' + font + '"';
			// context.font = textSize + 'px "Cybrpnuk2"';

			context.textAlign = align;
			context.textBaseline = "middle";
			doGradientOrColor(context, color, options);
			context.globalAlpha = watchOpacity;
			context.fillText(text, x, y);
			// context.closePath();
			context.restore();
		}
		function renderTextGradient(context, text, x, y, textSize, color, options) {
			if (typeof options !== 'undefined') {
				if (typeof options.font !== 'undefined') {
					font = options.font;
				}
				if (typeof options.align !== 'undefined') {
					align = options.align;
				}

				if (typeof options.rotate !== 'undefined') {
					rotate = true;
					angle++;
				}

			} else {
				font = 'Courier';
				align = "center";
				options = {};
			}
			context.save();

			context.font = textSize + 'px "' + font + '"';
			doGradientOrColor(context, color, options);
			context.globalAlpha = watchOpacity;
			context.textAlign = align;
			context.textBaseline = "middle";
			context.fillText(text, x, y);
			context.restore();
		}
		function renderTime(context, date, x, y, textSize, color, options) {
			indexX = 0;
			context.save();
			context.beginPath();
			context.font = textSize + 'px "FutureNow"';
			context.textAlign = "right";
			context.textBaseline = "middle";
			context.fillStyle = color;

			indexX += x;
			textdate = date.hour;
			context.fillText(textdate, indexX, y);

			context.closePath();
			context.beginPath();
			context.textAlign = "center";

			textdate = ':';
			indexX += textSize / 2;
			context.fillText(textdate, indexX, y);

			context.closePath();
			context.beginPath();
			context.textAlign = "center";
			textdate = (date.minute < 10) ? '0' + date.minute : date.minute;
			indexX += textSize;
			context.fillText(textdate, indexX, y);
			context.closePath();
			context.beginPath();
			context.textAlign = "center";
			textdate = ':';
			indexX += textSize;
			context.fillText(textdate, indexX, y); // -(textSize/12)
			context.beginPath();
			context.textAlign = "center";
			textdate = (date.second < 10) ? '0' + date.second : date.second;
			indexX += textSize;
			context.fillText(textdate, indexX, y);
			context.closePath();
			context.restore();
		}
		function renderTimeBis(context, date, x, y, textSize, color, options) {
			if (typeof options !== 'undefined') {
				if (typeof options.font !== 'undefined') {
					font = options.font;
				}
				if (typeof options.align !== 'undefined') {
					align = options.align;
				}
			} else {
				font = 'FutureNow';
				options = {};
			}
			indexX = 0;
			context.save();
			context.beginPath();
			context.font = textSize + 'px "' + font + '"';
			context.textAlign = "right";
			context.textBaseline = "middle";
			doGradientOrColor(context, color, options);
			context.globalAlpha = watchOpacity;
			indexX += x;
			textdate = date.hour;
			context.fillText(textdate, indexX, y);

			// context.closePath();
			// context.beginPath();
			context.textAlign = "center";
			// doGradientOrColor(context, color, options);
			textdate = ':';
			indexX += (textSize * 0.25);
			context.fillText(textdate, indexX, y);

			// context.closePath();
			// context.beginPath();
			// doGradientOrColor(context, color, options);
			context.textAlign = "center";
			textdate = (date.minute < 10) ? '0' + date.minute : date.minute;
			indexX += textSize * 0.8;
			context.fillText(textdate, indexX, y);
			
			context.closePath();
			
			context.restore();
		}
		function renderWeather(context, text, x, y, textSize, color) {
			context.save();
			context.beginPath();
			context.font = textSize + "px artill_clean_icons";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = color;
			context.fillText(text, x, y);
			context.globalAlpha = watchOpacity;
			context.closePath();
			context.restore();
		}
		function calculateShadowOffset(motionAcceleration) {
			coords.x = motionAcceleration.x;
			coords.y = motionAcceleration.y;
			// console.log(Math.cos(motionAcceleration.x/motionAcceleration.y));
			return coords;

		}
		function getCoordsForDiagonalGradient(width, height) {
			var alfa = Math.atan(height / width);
			var x = Math.sqrt(width * width + height * height) / 2 / (Math.cos(alfa));
			var z = ((width - x) * Math.cos(alfa)) * Math.sin(Math.PI / 2 - alfa);
			var w = ((width - x) * Math.cos(alfa)) * Math.cos(Math.PI / 2 - alfa);
			return {
				x1 : z,
				y1 : -w,
				x2 : width - z,
				y2 : w + height
			};
		}
		function calculateGradientPosition(motionAcceleration) {
			dx = -motionAcceleration.x *1000;
			dy = motionAcceleration.y *1000;
			gradientAngle = Math.atan2(dy, dx) + Math.PI /2; //
			//console.log(gradientAngle);
			//gradientCoords.x1 = (360 / 2) + Math.cos(gradientAngle) * maxLength * 0.5;
			//gradientCoords.y1 = (360 / 2) + Math.sin(gradientAngle) * maxLength * 0.5;
			// the end of the gradient subtracted from the center
			//gradientCoords.x2 = (360 / 2) - Math.cos(gradientAngle) * maxLength * 0.5;
			//gradientCoords.y2 = (360 / 2) - Math.sin(gradientAngle) * maxLength * 0.5;
			gx = (360 / 2) * Math.cos(gradientAngle);
			gy = (360 / 2) * Math.sin(gradientAngle);
			cx = 360 / 2;
			cy = 360;
			return gradientCoords;
		}
		function calculateRadialGradientPosition(motionAcceleration) {
			radialGradientCoords.x = Math.min(Math.round(radialGradientCoordsD.x + (motionAcceleration.x * 4)),250);
			radialGradientCoords.y = Math.min(Math.round(radialGradientCoordsD.y - ((motionAcceleration.y) * 4)),250)+30;
			//console.log('x: '+motionAcceleration.x+' y: '+motionAcceleration.y);
			return radialGradientCoords;
		}
		function resetRadialGradientPosition(){
			radialGradientCoords = radialGradientCoordsD;
		}
		function processMotion(motionAcceleration, context) {
			// console.log(motionAcceleration);
			calculateShadowOffset(motionAcceleration.accelerationIncludingGravity);
			calculateGradientPosition(motionAcceleration.accelerationIncludingGravity);
			calculateRadialGradientPosition(motionAcceleration.accelerationIncludingGravity);
			
			radialGradient = context.createRadialGradient(radialGradientCoords.x, radialGradientCoords.y, 0.000, 180.000, 180.000, 180.000);
			radialGradient.addColorStop(0.000, 'rgba(0, 0, 0,1)');
			radialGradient.addColorStop(0.300, 'rgba(0, 0, 0,0.2)');
			radialGradient.addColorStop(0.755, 'rgba(0,0,0,0.3)');
			radialGradient.addColorStop(0.83, 'rgba(20,20,20,0.3)');
			radialGradient.addColorStop(0.91, 'rgba(39,41,42,1)');
			//radialGradient.addColorStop(0.98, 'rgba(80,80,80,1)'); 
			radialGradient.addColorStop(1, 'rgba(120,120,120,1)');
			gradientLinear = context.createLinearGradient(cx - gx, cy - gy, cx + gx, cy + gy);
			
			if (theme== 'ice'){
				gradientLinear.addColorStop(1, "rgb(28,35,155)");
				gradientLinear.addColorStop(0.6, "rgb(41,137,216)");
				gradientLinear.addColorStop(0.3, "rgb(22,114,185)");
				gradientLinear.addColorStop(0, "rgb(192,221,243)");
			}
			else if (theme== 'fire'){
				gradientLinear.addColorStop(1, "rgb(255,90,2)");
				gradientLinear.addColorStop(0.6, "rgb(255,150,53)");
				gradientLinear.addColorStop(0.3, "rgb(248,181,0)");
				gradientLinear.addColorStop(0, "rgb(249,234,194)");
			}
			else {
				gradientLinear.addColorStop(1, "rgb(229,72,72)");
				gradientLinear.addColorStop(0.6, "rgb(252,123,123)");
				gradientLinear.addColorStop(0.3, "rgb(254,144,144)");
				gradientLinear.addColorStop(0, "rgb(251,232,232)");
			}
			
		}
		
		function getAmbiantGradient(ctxContent){
			
			grdAmbiant = ctxContent.createLinearGradient(0, 0, 360, 0);
			if (theme== 'ice'){
				grdAmbiant.addColorStop(1, "rgb(45,87,255)");
				grdAmbiant.addColorStop(0.6, "rgb(68,106,255)");
				grdAmbiant.addColorStop(0.3, "rgb(145,214,242)");
				grdAmbiant.addColorStop(0, "rgb(154,231,244)");
			}
			else if (theme== 'fire'){
				grdAmbiant.addColorStop(1, "rgb(255,90,2)");
				grdAmbiant.addColorStop(0.6, "rgb(255,150,53)");
				grdAmbiant.addColorStop(0.3, "rgb(248,181,0)");
				grdAmbiant.addColorStop(0, "rgb(249,234,194)");
			}
			else {
				grdAmbiant.addColorStop(1, "rgb(229,72,72)");
				grdAmbiant.addColorStop(0.6, "rgb(252,123,123)");
				grdAmbiant.addColorStop(0.3, "rgb(254,144,144)");
				grdAmbiant.addColorStop(0, "rgb(251,232,232)");
			}
			return grdAmbiant;
		}
		
		
		function doRadialGradientOrColor(context, color, options) {
			if (typeof options.gradient !== 'undefined') {
				context.fillStyle = radialGradient;
			} else {
				context.fillStyle = color;
			}
		}

		function doGradientOrColor(context, color, options) {
			if (typeof options.motion !== 'undefined') {
				if (options.motion !== null) {
//					context.shadowOffsetX = coords.x * -0.4;
//					context.shadowOffsetY = -coords.y * 0.4;
				}
			} else {
//				context.shadowOffsetX = 0;
//				context.shadowOffsetY = 0;
			}
			
			if (typeof options.gradient !== 'undefined') {
				//context.shadowColor = "rgb(150, 150, 150)";

				//context.shadowBlur = 10;

				context.fillStyle = gradientLinear;
			} else {
				context.fillStyle = color;
			}
		}
		/**
		 * Renders text at a specific center, radius, and color
		 * 
		 * @public
		 * @param {object}
		 *            context - the context for the text to be placed in
		 * @param {image}
		 *            iamge - the img obj
		 * @param {number}
		 *            x - the x-coordinate of the text
		 * @param {number}
		 *            y - the y-coordinate of the text
		 */
		function renderImage(context, img, x, y) {

			img.onload = function() {
				context.save();
				context.drawImage(img, x, y);
				context.restore();
			};

		}
		/**
		 * Initializes the module.
		 * 
		 * @memberof models/canvasDrawer
		 * @public
		 */
		function getRadialGradientCoords(){
			return radialGradientCoords;
		}
		function init() {
			bindEvents();
			if (tizen.preference.exists('theme')) {
				theme = tizen.preference.getValue('theme');
			}
		}
		function changeTheme(ev){
			theme = ev.detail;
		}
		function bindEvents() {
			event.on({
				'views.radial.changeTheme' : changeTheme,
				'models.motion.reset': resetRadialGradientPosition
			});

		}
		return {
			init : init,
			renderCircle : renderCircle,
			renderNeedle : renderNeedle,
			renderText : renderText,
			renderImage : renderImage,
			renderWeather : renderWeather,
			renderTime : renderTime,
			renderTimeBis : renderTimeBis,
			roundRect : roundRect,
			drawPulse : drawPulse,
			renderTextGradient : renderTextGradient,
			renderBackground : renderBackground,
			processMotion : processMotion,
			renderGrid : renderGrid,
			getRadialGradientCoords : getRadialGradientCoords,
			changeTheme:changeTheme,
			getAmbiantGradient:getAmbiantGradient,
			setOpacity:setOpacity,
			startFade:startFade,
			fade:fade,
			isFading:isFading,
			startShow:startShow,
			show:show,
			isShowing:isShowing
		};
	}
});
