function setClassAndWaitForTransition(node, newClass, prop) {
	return new Promise(function(resolve) {
		function handler(event) {
			if (event.target == node && event.propertyName == prop) { 
				node.removeEventListener('transitionend', handler);
				resolve();
			}
		}
		node.addEventListener('transitionend', handler);
		node.setAttribute('class', newClass);
	});
}
function fancyTimeFormat(time)
{   
	var ret= '';
	var array = {
			hours: ~~(time / 3600),
			minutes: ~~((time % 3600) / 60)
			
			};
	
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    if (mins > 0)  {
    	ret += "" + mins;
    }
    return ret;
}
function hasSomeParentTheClass(element, classname) {
    if (element.className != null && element.classList.length >0 && element.classList.contains(classname)) return true;
    return element.parentNode && hasSomeParentTheClass(element.parentNode, classname);
}
function showDropdownApp() {
	var event;
    event = document.createEvent('MouseEvents');
    console.log('test');
    var element = document.getElementById('testme');
    event.initMouseEvent('mousedown', true, true, window);
    //event.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    element.dispatchEvent(event);
    //document.body.dispatchEvent(element);
}
function hexToRgbA(hex,a,shift){
    let c;
    let r,g,b;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        r= ((c>>16)&255) +shift;
        g= ((c>>8)&255) +shift;
        b= (c&255) +shift;
        //return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
        return 'rgba('+[r, g, b].join(',')+','+a+')';
    }
    throw new Error('Bad Hex');
}

