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
	    
	    
		return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).split(' ')[0].substring(0,3)+". "+[day, month, year].join('/');
	}
	processHtml(){
		let i = 0;
		let day_events = document.createElement('div');
		day_events.className = 'day_events';
		let day = document.createElement('div');
		let event = null;
		let dates = null;
		let start =null;
		let end = null;
		let title= null, location = null;
		day.className = 'day';
		day.setAttribute('data-augmented-ui', 'tl-clip tr-clip inlay');
		day.innerHTML  = this.getDateToString();
		day_events.appendChild(day);
		for (i = 0 ; i< this.events.length ; i++){
			event = document.createElement('div');
			event.className = 'event';
			if (i==0){
				event.setAttribute('data-augmented-ui', 'tr-clip br-round bl-clip both');
			}
			else {
				event.setAttribute('data-augmented-ui', 'tl-round tr-clip  bl-clip br-round both');
			}
			dates =document.createElement('div');
			dates.className = (this.events[i].isFullDay())?'dates fd':'dates';
			dates.setAttribute('data-augmented-ui', 'tl-round tr-clip  bl-clip br-round both');
			if (!this.events[i].isFullDay()){
				start = document.createElement('span');
				start.className = 'start';
				start.innerHTML =  this.events[i].getTimefromDate(this.events[i].startDate);
				end = document.createElement('span');
				end.className = 'end'; 
				end.innerHTML =  this.events[i].getTimefromDate(this.events[i].endDate);
				dates.appendChild(start);
				dates.appendChild(end);
			}
			
			
			title = document.createElement('div');
			title.className = 'title';
			title.innerHTML = this.events[i].title;
			location = document.createElement('div');
			location.className = 'location';
			location.innerHTML = (this.events[i].location != null)?this.events[i].location:'';
			
			
			event.appendChild(dates);
			event.appendChild(title);
			event.appendChild(location);
			day_events.appendChild(event);
		}
		
		return day_events;
		
	}
	
	
}