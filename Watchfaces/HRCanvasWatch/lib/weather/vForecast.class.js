class vForecast  {
	constructor(array,mapping){
		if (array != null){
			this.id = array['dt'];
			this.date = new Date(array['dt']*1000);
			this.city = array['city'];
			this.main = array['main'];
			this.weather = array['weather'][0];
			this.wind = array['wind'];
			this.cloud = array['cloud'];
			this.rain = array['rain'];
			this.snow = array['snow'];
			this.day = array['day'];
		}
		
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
		block.setAttribute('block-id', this.id);
		
		return block;
	}
	processHtmlDetails(){
		let block =document.createElement('div');
		block.className = 'block';
		let header =document.createElement('table');
		header.className = 'header';
		let row = header.insertRow();
	    let cell = row.insertCell();
	    cell.className = 'city';
	    let text = document.createTextNode('City');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'date';
	    text = document.createTextNode(this.getDateToString());
	    cell.appendChild(text);
		
	    cell = row.insertCell();
	    cell.className = 'hour'; 
	    cell.rowSpan = 2;
	    text = document.createTextNode(this.date.getHours()+"h");
	    cell.appendChild(text);
		
	    
	    row = header.insertRow();
	    cell = row.insertCell();
	    cell.className = 'city-value';
	    text = document.createTextNode(this.city);
	    cell.colSpan = 2;
	    cell.appendChild(text);
	    
	   
	    block.appendChild(header);
	    
	    
	    let middle =document.createElement('table');
	    middle.className = 'middle';
	    row = middle.insertRow();
	    cell = row.insertCell();
	    cell.className = 'title';
	    text = document.createTextNode('Temperature:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(Math.round(this.main.temp)+"°");
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'title';
	    text = document.createTextNode('Pressure:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(this.main.pressure);
	    cell.appendChild(text);
	    
	    //2nd
	    row = middle.insertRow();
	    cell = row.insertCell();
	    cell.className = 'title';
	    text = document.createTextNode('Temp. min:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(Math.round(this.main.temp_min)+"°");
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'title'; 
	    text = document.createTextNode('Pres. Sea:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(this.main.sea_level);
	    cell.appendChild(text);
	    
	    
	    
	    row = middle.insertRow();
	    cell = row.insertCell();
	    cell.className = 'title';
	    text = document.createTextNode('Temp. max:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(Math.round(this.main.temp_max)+"°");
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'title';
	    text = document.createTextNode('Humidity:');
	    cell.appendChild(text);
	    
	    cell = row.insertCell();
	    cell.className = 'value';
	    text = document.createTextNode(this.main.humidity+"%");
	    cell.appendChild(text);
	    
	    block.appendChild(middle);
	    
	    let bottom =document.createElement('table');
	    bottom.className = 'bottom';

	    row = bottom.insertRow();
	    cell = row.insertCell();
	    cell.className = 'icon';
	    text = document.createTextNode(this.getMapping(this.weather.id, this.day));
	    cell.appendChild(text);
	    
	    block.appendChild(bottom);
		block.setAttribute('augmented-ui', 'tl-clip tr-clip  bl-clip br-clip exe');
		//console.log(block);
		return block;
	}
	getDateToString(){
		let date = new Date(this.date);
		 let month = '' + (date.getMonth() + 1);
	       let  day = '' + date.getDate();
	        let year = date.getFullYear();

	    if (month.length < 2) 
	        month = '0' + month;
	    if (day.length < 2) 
	        day = '0' + day;
	    
	    
		return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).split(' ')[0].substring(0,3)+". "+[day, month, year].join('/');
	}

}