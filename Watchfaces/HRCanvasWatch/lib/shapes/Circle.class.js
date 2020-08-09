class Circle extends Shape {
	constructor(x,y,radius){
		super();
		this.center = {x:Math.round(x),y:Math.round(y)};
		this.x = this.center.x-radius;
		this.y = this.center.y-radius;
		this.radius = radius;
		this.width = radius*2;
		this.height = radius*2;
		
	}
	getCenter(){
		return this.center;
	}
	
	getRadius(){
		return this.radius;
	}
}