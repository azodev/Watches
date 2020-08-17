class Flower extends Particle {
	  constructor(canvas,colors) {
		  super(canvas,colors);
		  let random = Math.random();
		  this.radius = random > .2 ? Math.random() * 1 : Math.random() * 3;
		    this.color = random > .2 ? this.colors[0] : this.colors[2];
		    this.radius = random > .8 ? Math.random() * 2.2 : this.radius;
		    this.color = random > .8 ? this.colors[1] : this.color;
		    this.radius = this.radius*1.2;
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

	  render() {
	    this.canvas.beginPath();
	    if (this.radius >= 3){
	    	this.canvas.arc(this.x, this.y+3, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.canvas.arc(this.x-3, this.y-2, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.canvas.arc(this.x+3, this.y-2, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
	    }
	    else{
	    	this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
	    }
	    this.canvas.closePath();
	  }

	  move() {

	    let p1 = {
	      x: this.x,
	      y: this.y };


	    let distance = this.calculateDistance(p1, this.point_of_attraction);
	    let force = Math.max(50, 1 + distance);

	    let attr_x = (this.point_of_attraction.x - this.x) / force;
	    let attr_y = (this.point_of_attraction.y - this.y) / force;

	    this.x += Math.cos(this.a) * this.s + attr_x;
	    this.y += Math.sin(this.a) * this.s + attr_y;
	    this.a += Math.random() > 0.5 ? Math.random() * 0.9 - 0.45 : Math.random() * 0.4 - 0.2;
	    if (this.x > this.point_of_attraction.x -15 && this.x < this.point_of_attraction.x +15 && 
	    		this.y > this.point_of_attraction.y -15 && this.y < this.point_of_attraction.y +15) return false;
	    this.render();
	    this.progress++;
	    return true;
	  }
}