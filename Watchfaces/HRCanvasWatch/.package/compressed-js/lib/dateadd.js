var DayName={en:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],heb:["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"]};var MonthName={en:["January","February","March","April","May","June","July","August","September","October","November","December"],heb:["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]};var oneMinute=1000*60;var intervalObject=new Object();intervalObject.yyyy=1000*60*60*24*365;intervalObject.m=1000*60*60*24*30.333;intervalObject.d=1000*60*60*24;function DateAdd(a){this.interval=a.interval;this.number=a.number;this.date=a.date;this.language=a.language;this.calculate=calculate;this.calculate();}Date.prototype.DateAdd=DateAdd;function calculate(){var e=new String(this.date);splitDate=e.split("-");paramDateYear=splitDate[0];paramDateMonth=splitDate[1]-1;paramDateDay=splitDate[2];if(paramDateMonth>12){alert("Invalid Month!");return false;}if(paramDateDay>31){alert("Invalid Day!");return false;}var i=new Date(paramDateYear,paramDateMonth,paramDateDay);i.setHours(0);i.setMinutes(0);i.setSeconds(0);i.getTimezoneOffset()*oneMinute;var c=i.getTime();if(typeof intervalObject[this.interval]=="undefined"){alert("Interval is invalid!");return false;}intervalObject[this.interval]=intervalObject[this.interval]*this.number;var a=c+parseInt(intervalObject[this.interval]);var d=new Date(a);if(this.language=="heb"){var f=DayName.heb[d.getDay()];var h=MonthName.heb[d.getMonth()];var b=d.getDate();}else{var f=DayName.en[d.getDay()];var h=MonthName.en[d.getMonth()];var b=d.getDate();}var g=d.getFullYear();this.weekDay=f;this.month=h;this.monthDay=b;this.year=g;}