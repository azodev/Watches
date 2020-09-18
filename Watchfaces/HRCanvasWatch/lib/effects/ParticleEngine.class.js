class ParticleEngine{
	  constructor(canvas, colors){
		  this.max_particles = 500;
		  this.particles = [];
		  this.frequency = 3;
		  this.init_num = this.max_particles;
		  this.max_time = this.frequency * this.max_particles;
		  this.colors = colors;
		  this.canvas = canvas;
		  this.type = 'Particle';
		  
	  }
	  setType(effect){
		  if (effect == 'attraction'){
			  this.type = 'Particle';
	    	}  
	    	else if (effect == 'flower'){
	    		this.type  = 'Flower';
	    	}
	    	else if (effect == 'lightspeed'){
	    		this.type  = 'LightSpeed';
	    	}
	    	else {
	    		this.type  = 'ParticleAlien';
	    	}
	  }
	  render(){
		  
	  }
	  generate(number){
		  
	  }
	  move(){
		  
	  }
	  clean(){
		  this.particles = [];
	  }
	  getLength(){
		  return this.particles.length;
	  }
}