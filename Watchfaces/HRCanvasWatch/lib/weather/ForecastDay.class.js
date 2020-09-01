class ForecastDay {
	constructor(date,forecasts){
		this.date = date;
		this.forecasts = forecasts;
		
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
	processHtml(){
		let i = 0;
		let block;
		let day_weather = document.createElement('div');
		day_weather.className = 'day_weather';
		let day = document.createElement('div');
		let forecast = null;
		day.className = 'day';
		day.setAttribute('augmented-ui', 'tl-clip tr-clip exe');
		day.innerHTML  = this.getDateToString();
		day_weather.appendChild(day);
		forecast = document.createElement('div');
		forecast.className = 'forecast';
		forecast.setAttribute('augmented-ui', 'tr-clip br-round bl-clip exe');
		
		
		for (i = 0 ; i< this.forecasts.length ; i++){
			block = this.forecasts[i].processHtml();
			forecast.appendChild(block);
		}
		day_weather.appendChild(forecast);
		return day_weather;
		
		
	}
	
	
}