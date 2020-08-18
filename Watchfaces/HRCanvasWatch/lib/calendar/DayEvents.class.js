class DayEvents {
	constructor(date,vEvents){
		this.date = date;
		this.events = vEvents;
		
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
		return date.toString().split(' ')[0]+" "+[day, month, year].join('/');
	}
	processHtml(){
		let i = 0;
		let day_events = document.createElement('div');
		day_events.className = 'day_events';
		let day = document.createElement('div');
		let event = null;
		let dates = null;
		
		day.className = 'day';
		day.setAttribute('augmented-ui', 'tl-round tr-clip exe');
		day.innerHTML  = this.getDateToString();
		day_events.appendChild(day);
		console.log(this.events);
		for (i = 0 ; i< this.events.length ; i++){
			event =document.createElement('div');
			event.className = 'event';
			if (i==0){
				day.setAttribute('augmented-ui', 'tr-clip br-round bl-clip  exe');
			}
			else {
				day.setAttribute('augmented-ui', 'tl-round tr-clip  bl-clip br-round exe');
			}
			dates =document.createElement('div');
			dates.className = 'dates';
			dates.setAttribute('augmented-ui', 'tl-round tr-clip  bl-clip br-round exe');
			let start = document.createElement('span');
			start.className = 'start';
			start.innerHTML =  this.events[i].getTimefromDate(this.events[i].startDate);
			let end = document.createElement('span');
			end.className = 'end';
			end.innerHTML =  this.events[i].getTimefromDate(this.events[i].endDate);
			dates.appendChild(start);
			dates.appendChild(end);
			
			let title = document.createElement('div');
			title.className = 'title';
			title.innerHTML = this.events[i].title;
			let location = document.createElement('div');
			location.className = 'location';
			location.innerHTML = (this.events[i].location != null)?this.events[i].location:'';
			
			
			event.appendChild(dates);
			event.appendChild(title);
			event.appendChild(location);
			day_events.appendChild(event);
		}
		document.getElementById('overflower').appendChild(day);
		
	}
	
	
}