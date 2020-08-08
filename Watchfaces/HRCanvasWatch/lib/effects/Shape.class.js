class Shape {
      
	  constructor(x,y,w,h) {
	    
	    this.x  = x;
	    this.y = y;
	    this.width = w;
	    this.height = h;
	    this.timePassed = 0 ;
	    this.animating = false;
	    this.animationOver = false;
	    //this.canvas = canvas;
	   
	  }
	  getCoords(){
		  return {x:this.x, y:this.y};
	  }
	  setCoords(x,y){
		  this.x  = x;
		    this.y = y;
	  }
	  getSize(){
		  return {w:this.width,h:this.h};
		 
	  }
	  setSize(w,h){
		  this.width = w;
		    this.height = h;
	  }
	  getX(){
		  return this.x; 
	  }
	  getY(){
		  return this.y;  
	  }
	  getWidth(){
		  return this.width; 
	  }
	  getHeight(){
		  return this.height; 
	  }
	  animate(){
		  this.animating = true;
	  }
	  isAnimating(){
		  return this.animating;
	  }
	  isAnimationOver (){
		  return this.animationOver;
	  }
	  growRight(secondsPassed,size,newSize,duration){
		  if (this.isAnimating() && this.width < newSize){
			  secondsPassed = Math.min(secondsPassed, 0.05);
			  this.timePassed += secondsPassed;
			  this.width = easeLinear(this.timePassed, size, newSize-size, duration);
			  //this.width = Math.round(this.width);
			  if (this.width >= newSize){
				  this.animating = false;
				  this.width = newSize;
				  this.resetTime() ;
			  }
		  }
		  else {
			  this.animating = false;
			  this.resetTime() ;
		  }
		  
	  }
	  resetTime(){
		  this.timePassed = 0 ;
	  }
	  shrinkRight(secondsPassed,size,newSize,duration){
		  if (this.isAnimating() && this.width > newSize){
			  secondsPassed = Math.min(secondsPassed, 0.05);
			  this.timePassed += secondsPassed;
			  this.width = easeLinear(this.timePassed, size, newSize-size, duration);
			  //this.width = Math.min((newSize*(duration/this.timePassed)) - size,size);
			  //this.width = Math.round(this.width);
			  if (this.width <= newSize){
				  this.animating = false;
				  this.width = newSize;
				  this.resetTime() ;
			  }
		  }
		  else {
			  this.animating = false;
			  this.resetTime() ;
		  }
	  }
	  
	  
	  
}
function easeLinear (time, size, newSize, duration) {
    return ((newSize * time) / duration) + size;
}
function easeInOutQuint (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}
function easeInOutQuad (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}
