// JScript source code
	var DayName={en:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],heb:["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"]};
	var MonthName={en:["January","February","March","April","May","June","July","August","September","October","November","December"],heb:["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]};
	
	
	
	var oneMinute=1000*60;
	var intervalObject=new Object();
	intervalObject["yyyy"]=1000*60*60*24*365;
	intervalObject["m"]=1000*60*60*24*30.333;
	intervalObject["d"]=1000*60*60*24;
	
	
	function DateAdd(dateAddObj){
		this.interval=dateAddObj.interval;
		this.number=dateAddObj.number;
		this.date=dateAddObj.date;
		this.language=dateAddObj.language;
		this.calculate=calculate;
		this.calculate();
	}

	Date.prototype.DateAdd=DateAdd;
	
	
	
	
	function calculate(){
		var paramDate=new String(this.date);
		splitDate=paramDate.split("-");
		paramDateYear=splitDate[0];
		paramDateMonth=splitDate[1]-1;
		paramDateDay=splitDate[2];
		if(paramDateMonth>12){
			alert("Invalid Month!");
			return false;
		}
		if(paramDateDay>31){
			alert("Invalid Day!");
			return false;
		}
		var paramDateObject=new Date(paramDateYear,paramDateMonth,paramDateDay);
		paramDateObject.setHours(0);
		paramDateObject.setMinutes(0);
		paramDateObject.setSeconds(0);
		paramDateObject.getTimezoneOffset() * oneMinute;
		var paramDateObjectTime=paramDateObject.getTime();
		if(typeof intervalObject[this.interval]=="undefined"){
			alert("Interval is invalid!");
			return false;
		}
		intervalObject[this.interval]=intervalObject[this.interval] * this.number;
		var newDateTime=paramDateObjectTime + parseInt(intervalObject[this.interval]);
		var newDateObject=new Date(newDateTime);
		if(this.language=="heb"){
			var newDateObjectWeekDayName=DayName.heb[newDateObject.getDay()];
			var newDateObjectMonthName=MonthName.heb[newDateObject.getMonth()];
			var newDateObjectMonthDay=newDateObject.getDate();
		}
		else{
			var newDateObjectWeekDayName=DayName.en[newDateObject.getDay()];
			var newDateObjectMonthName=MonthName.en[newDateObject.getMonth()];
			var newDateObjectMonthDay=newDateObject.getDate();
		}
		
		var newDateObjectYear=newDateObject.getFullYear();
		this.weekDay=newDateObjectWeekDayName;
		this.month=newDateObjectMonthName;
		this.monthDay=newDateObjectMonthDay;
		this.year=newDateObjectYear;
		
	}