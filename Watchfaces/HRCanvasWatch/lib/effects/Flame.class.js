class Flame {
  constructor(canvas, options) {
    let random = Math.random();
    this.canvas = canvas;
    this.x = options.x;
    this.y = options.y;
    this.s = 3 + Math.random();
    this.a = 0;
    this.w = 360;
    this.h = 360;
    this.radius = 0.5 + Math.random() * 20;
    this.color = this.radius > 5 ? "#FF5E4C" : "#ED413C"; //this.randomColor()
  }

  randomColor() {
    let colors = ["#FF5E4C", "#FFFFFF"];
    return colors[this.randomIntFromInterval(0, colors.length - 1)];
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  render() {
    this.canvas.beginPath();
    this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.canvas.lineWidth = 2;
    this.canvas.fillStyle = this.color;
    this.canvas.fill();
    this.canvas.closePath();
  }

  move() {
    //this.swapColor()
    this.x += Math.cos(this.a) * this.s;
    this.y += Math.sin(this.a) * this.s;
    this.a += Math.random() * 0.8 - 0.4;

    if (this.x < 0 || this.x > this.w - this.radius) {
      return false;
    }

    if (this.y < 0 || this.y > this.h - this.radius) {
      return false;
    }
    this.render();
    return true;
  }
 }