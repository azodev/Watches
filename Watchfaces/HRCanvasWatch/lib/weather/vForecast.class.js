class vForecast {
	constructor(array,mapping){
		this.date = new Date(array['dt']*1000);
		this.main = array['main'];
		this.weather = array['weather'][0];
		this.wind = array['wind'];
		this.day = array['day'];
		this.mapping = mapping;
	}
	
	
	getDate(){
		return this.date;
	}
	getMapping(id, dayNightBool) {
		if (this.mapping.map[id]) {
			if (!dayNightBool) {
				if (this.mapping.map[id+'n']){
					return this.mapping.map[id+'n'];
				}
			} 
			return this.mapping.map[id];

		} else {
			return DEFAULT_ICON;
		}
	}
	processHtml(){
		let block =document.createElement('div');
		block.className = 'block';
		let hour = document.createElement('div');
		hour.className = 'hour';
		let icon = document.createElement('div');
		icon.className = 'icon';
		let temp = document.createElement('div');
		temp.className = 'temp';
		
		hour.innerHTML =  this.date.getHours()+'h';
		icon.innerHTML = this.getMapping(this.weather.id, this.day);
		temp.innerHTML = Math.round(this.main.temp) + "°";
		block.appendChild(hour);
		block.appendChild(icon);
		block.appendChild(temp);
		block.setAttribute('augmented-ui', 'tl-clip tr-clip  bl-clip br-clip exe');
		
		return block;
	}

}