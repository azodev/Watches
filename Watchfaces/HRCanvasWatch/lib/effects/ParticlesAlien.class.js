class ParticleAlien{
	  constructor(canvas, progress){
	    let random = Math.random();
	    this.progress = 0;
	    this.canvas = canvas;

	    this.x = (360/2)  + (Math.random()*200 - Math.random()*200);
	    this.y = (360/2) + (Math.random()*200 - Math.random()*200);
	    this.s = Math.random() * 1;
	    this.a = 0;
	    this.w = 360;
	    this.h = 360;
	    this.radius = random > .2 ? Math.random()*1 : Math.random()*3;
	    this.color  = random > .2 ? "#2E4765" : "#BDDAF0";
	    this.radius = random > .8 ? Math.random()*2 : this.radius;
	    this.color  = random > .8 ? "#2E4765" : this.color;

	    // this.color  = random > .1 ? "#ffae00" : "#f0ff00" // Alien
	    this.variantx1 = Math.random()*300;
	    this.variantx2 = Math.random()*400;
	    this.varianty1 = Math.random()*100;
	    this.varianty2 = Math.random()*120;
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
	    this.x += Math.cos(this.a) * this.s;
	    this.y += Math.sin(this.a) * this.s;
	    this.a += Math.random() * 0.8 - 0.4;

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