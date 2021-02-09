class Flower extends Particle {
	  constructor(canvas,colors) {
		  super(canvas,colors);
		  let random = Math.random();
		  this.j= 0;
		  this.fa=  0;
		  this.x = this.w / 2 + (Math.random() * 200 - Math.random() * 200);
		    this.y = this.h / 2 + (Math.random() * 200 - Math.random() * 200);
		  this.radius = random > .2 ? Math.random() * 1 : 1;
		    this.color = random > .2 ? this.colors[0] : this.colors[1];
		    this.radius = random > .8 ? Math.random() * 2.2 : this.radius;
		    this.color = random > .8 ? this.colors[2] : this.color;
		    this.radius = this.radius*1.2;
		    this.s = Math.random() * 1.5;//2
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
	    if (this.radius >= 2){
	    	let x;
	    	let y;
	    	this.j ++;
	    	this.fa=  this.j * (Math.PI * 2) / 5;
	    	x = (this.radius*1.5) * Math.cos(this.fa) +this.x;
	    	y = (this.radius*1.5) * Math.sin(this.fa) +this.y;
	    	this.canvas.arc(x, y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.j ++;
	    	this.fa=  this.j * (Math.PI * 2) / 5;
	    	x = (this.radius*1.5) * Math.cos(this.fa) +this.x;
	    	y = (this.radius*1.5) * Math.sin(this.fa) +this.y;
		    this.canvas.arc(x, y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.j ++;
	    	this.fa=  this.j * (Math.PI * 2) / 5;
	    	x = (this.radius*1.5) * Math.cos(this.fa)+this.x;
	    	y = (this.radius*1.5) * Math.sin(this.fa) +this.y;
		    this.canvas.arc(x, y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.j ++;
	    	this.fa=  this.j * (Math.PI * 2) / 5;
	    	x = (this.radius*1.5) * Math.cos(this.fa)+this.x;
	    	y = (this.radius*1.5)* Math.sin(this.fa) +this.y;
		    this.canvas.arc(x, y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color; 
		    this.canvas.fill();
		    this.j ++;
	    	this.fa=  this.j * (Math.PI * 2) / 5;
	    	x = (this.radius*1.5) * Math.cos(this.fa)+this.x;
	    	y = (this.radius*1.5) * Math.sin(this.fa) +this.y;
		    this.canvas.arc(x, y, this.radius, 0, 2 * Math.PI);
		    this.canvas.lineWidth = 2;
		    this.canvas.fillStyle = this.color;
		    this.canvas.fill();
		    
		    this.fa = 0;
		    this.j = this.j+0.02;
		    //if (this.j > 5) this.j = 0.05;
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
	 
/*
	    let distance = this.calculateDistance(p1, this.point_of_attraction);
	    let force = Math.max(100, 5 + distance);

	    let attr_x = (this.point_of_attraction.x - this.x) / force;
	    let attr_y = (this.point_of_attraction.y - this.y) / force;

	    this.x += Math.cos(this.a) * this.s + attr_x;
	    this.y += Math.sin(this.a) * this.s + attr_y;
	    this.a += Math.random() > 0.5 ? Math.random() * 0.9 - 0.45 : Math.random() * 0.4 - 0.2;
	    if (this.x > this.point_of_attraction.x -15 && this.x < this.point_of_attraction.x +15 && 
	    		this.y > this.point_of_attraction.y -15 && this.y < this.point_of_attraction.y +15) return false;*/
		  this.x += Math.cos(this.a) * this.s;
		    this.y += Math.sin(this.a) * this.s;
		    this.a += Math.random() * 0.8 - 0.4; 

		    /*if (this.x > this.point_of_attraction.x -15 && this.x < this.point_of_attraction.x +15 && 
		    		this.y > this.point_of_attraction.y -15 && this.y < this.point_of_attraction.y +15) return false;*/
		    if (this.x < 0 || this.x > this.w ) {
		        return false;
		      }

		      if (this.y < 0 || this.y > this.h ) {
		        return false;
		      }
	    this.render();
	    return true;
	  }
}