class ParticleAlien{
	  constructor(canvas, colors){
	    let random = Math.random();
	    this.progress = 0;
	    this.canvas = canvas;
	    this.colors = colors;
	    this.x = (360/2)  ;
	    this.y = (360/2);
	    this.point_of_attraction = {
	  	      x: 360 / 2,
	  	      y: 360 / 2 };
	    this.s = Math.random() * 3;
	    this.a = 360 *Math.random() * (Math.PI * 2) / 280;
	    this.w = 360;
	    this.h = 360;
	    this.radius = random > .2 ? Math.random()*1 : 1;
	    this.color  = random > .2 ? this.colors[0] : this.colors[1];
	    this.radius = random > .8 ? Math.random()*2 : this.radius;
	    this.color  = random > .8 ? this.colors[2] : this.color;
	    
	    // this.color  = random > .1 ? "#ffae00" : "#f0ff00" // Alien

	  }
	  setPoA(coords){
		  this.point_of_attraction.x = coords.x;
		  this.point_of_attraction.y = coords.y;
	  }
	  calculateDistance(v1, v2) {
		    let x = Math.abs(v1.x - v2.x);
		    let y = Math.abs(v1.y - v2.y);
		    return Math.sqrt(x * x + y * y);
		  }
	  render(){
	    this.canvas.beginPath();
	    this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	    this.canvas.lineWidth = 2;
	    this.canvas.fillStyle = this.color;
	    this.canvas.fill();
	    this.canvas.closePath();
	  }

	  move(){
		  let p1 = {
			      x: this.x,
			      y: this.y };


	    let distance = this.calculateDistance(p1, this.point_of_attraction);
	    let force = Math.min(50, 1 - distance);

	    let attr_x = (this.point_of_attraction.x - this.x) / force;
	    let attr_y = (this.point_of_attraction.y - this.y) / force;  
		  
		  
	    this.x += Math.cos(this.a) * this.s + attr_x;
	    this.y += Math.sin(this.a) * this.s + attr_y;
	    this.a +=  Math.random() > 0.5 ? Math.random() * 0.9 - 0.45 : Math.random() * 0.4 - 0.2;
	   // this.a += 
	    
	    if(this.x < 0 || this.x > this.w - this.radius){
	      return false;
	    }

	    if(this.y < 0 || this.y > this.h - this.radius){
	      return false;
	    }
	    this.render();
	    this.progress++;
	    return true;
	  }
}