"use strict";var DEFAULT_SIZE=50;var MIN_SECTORS=3;function RadialMenu(b){var a=this;a.theme="ice";a.parent=b.parent||[];a.size=b.size||DEFAULT_SIZE;a.onClick=b.onClick||null;a.menuItems=b.menuItems?b.menuItems:[{id:"one",title:"One"},{id:"two",title:"Two"}];a.radius=50;a.innerRadius=a.radius*0.4;a.sectorSpace=a.radius*0.06;a.sectorCount=Math.max(a.menuItems.length,MIN_SECTORS);a.closeOnClick=b.closeOnClick!==undefined?!!b.closeOnClick:false;a.scale=1;a.holder=null;a.parentMenu=[];a.parentItems=[];a.levelItems=null;a.createHolder();a.addIconSymbols();a.currentMenu=null;}RadialMenu.prototype.setMenuItems=function(a){self.menuItems=a;};RadialMenu.prototype.open=function(){var a=this;if(!a.currentMenu){document.querySelector(".menuHolder").style.display="-webkit-flex";a.currentMenu=a.createMenu("menu inner",a.menuItems);a.holder.appendChild(a.currentMenu);RadialMenu.nextTick(function(){a.currentMenu.setAttribute("class","menu");});}};RadialMenu.prototype.close=function(){var a=this;if(a.currentMenu){var b;while(b=a.parentMenu.pop()){b.remove();}a.parentItems=[];var c=new window.CustomEvent("RadialMenu.closing",{detail:"closing",cancelable:true});window.dispatchEvent(c);RadialMenu.setClassAndWaitForTransition(a.currentMenu,"menu inner").then(function(){a.currentMenu.remove();a.currentMenu=null;document.querySelector(".menuHolder").style.display="none";});}};RadialMenu.prototype.getParentMenu=function(){var a=this;if(a.parentMenu.length>0){return a.parentMenu[a.parentMenu.length-1];}else{return null;}};RadialMenu.prototype.createHolder=function(){var a=this;a.holder=document.createElement("div");a.holder.className="menuHolder";a.holder.style.width=a.size+"px";a.holder.style.height=a.size+"px";a.parent.appendChild(a.holder);};RadialMenu.prototype.showNestedMenu=function(b){var a=this;a.parentMenu.push(a.currentMenu);a.parentItems.push(a.levelItems);a.currentMenu=a.createMenu("menu innerbis",b.items,true);a.holder.appendChild(a.currentMenu);RadialMenu.cleanButtons(a.theme);RadialMenu.nextTick(function(){a.getParentMenu().setAttribute("class","menu outer");a.currentMenu.setAttribute("class","menu");});};RadialMenu.cleanButtons=function(a){document.querySelectorAll("svg.menu > g > path").forEach(function(b){b.setAttribute("class",a);});};RadialMenu.prototype.setTheme=function(b){var a=this;a.theme=b;};RadialMenu.prototype.getTheme=function(){var a=this;return a.theme;};RadialMenu.prototype.highlightButton=function(b,a){document.querySelector("svg.menu > g[data-id="+b+"] > path").setAttribute("class",a);};RadialMenu.prototype.darkenButton=function(a,b){document.querySelector("svg.menu > g[data-id="+a+"] > path").setAttribute("class",b);};RadialMenu.prototype.returnToParentMenu=function(){var a=this;a.getParentMenu().setAttribute("class","menu");RadialMenu.setClassAndWaitForTransition(a.currentMenu,"menu innerbis").then(function(){a.currentMenu.remove();a.currentMenu=a.parentMenu.pop();a.levelItems=a.parentItems.pop();});};RadialMenu.prototype.handleClick=function(){var b=this;var a=b.getSelectedIndex();if(a>=0){var c=b.levelItems[a];if(c.items){b.showNestedMenu(c);}else{if(b.onClick){b.onClick(c);if(b.closeOnClick){b.close();}}}}};RadialMenu.prototype.handleCenterClick=function(){var a=this;if(a.parentItems.length>0){a.returnToParentMenu();}else{a.close();}};RadialMenu.prototype.createCenter=function(c,f,e,j){var i=this;j=j||8;var d=document.createElementNS("http://www.w3.org/2000/svg","g");d.setAttribute("class","center");var b=i.createCircle(0,0,i.innerRadius-i.sectorSpace/3);d.appendChild(b);if(h){var h=i.createText(0,0,f);d.appendChild(h);}if(e){var a=i.createUseTag(0,0,e);a.setAttribute("width",j);a.setAttribute("height",j);a.setAttribute("transform","translate(-"+RadialMenu.numberToString(j/2)+",-"+RadialMenu.numberToString(j/2)+")");d.appendChild(a);}c.appendChild(d);};RadialMenu.prototype.getIndexOffset=function(){var a=this;if(a.levelItems.length<a.sectorCount){switch(a.levelItems.length){case 1:return -2;case 2:return -2;case 3:return -2;default:return -1;}}else{return -1;}};RadialMenu.prototype.createMenu=function(b,d,k){var n=this;n.levelItems=d;n.sectorCount=Math.max(n.levelItems.length,MIN_SECTORS);n.scale=n.calcScale();var g=document.createElementNS("http://www.w3.org/2000/svg","svg");g.setAttribute("class",b);g.setAttribute("viewBox","-50 -50 100 100");g.setAttribute("width",n.size);g.setAttribute("height",n.size);var m=360/n.sectorCount;var h=m/2+270;var f=n.getIndexOffset();for(var e=0;e<n.sectorCount;++e){var j=h+m*e;var c=h+m*(e+1);var a=RadialMenu.resolveLoopIndex(n.sectorCount-e+f,n.sectorCount);var l;if(a>=0&&a<n.levelItems.length){l=n.levelItems[a];}else{l=null;}n.appendSectorPath(j,c,g,l,a);}if(k){n.createCenter(g,"Close","#return",8);}else{n.createCenter(g,"Close","#close",10);}g.addEventListener("mousedown",function(p){var o=p.target.parentNode.getAttribute("class").split(" ")[0];switch(o){case"sector":var i=parseInt(p.target.parentNode.getAttribute("data-index"));if(!isNaN(i)){n.setSelectedIndex(i);}break;default:}});g.addEventListener("click",function(o){var i=o.target.parentNode.getAttribute("class").split(" ")[0];switch(i){case"sector":n.handleClick();break;case"center":n.handleCenterClick();break;default:}});return g;};RadialMenu.prototype.selectDelta=function(c){var b=this;var a=b.getSelectedIndex();if(a<0){a=0;}a+=c;if(a<0){a=b.levelItems.length+a;}else{if(a>=b.levelItems.length){a-=b.levelItems.length;}}b.setSelectedIndex(a);};RadialMenu.prototype.onKeyDown=function(b){var a=this;if(a.currentMenu){switch(b.key){case"Escape":case"Backspace":a.handleCenterClick();b.preventDefault();break;case"Enter":a.handleClick();b.preventDefault();break;case"ArrowRight":case"ArrowUp":a.selectDelta(1);b.preventDefault();break;case"ArrowLeft":case"ArrowDown":a.selectDelta(-1);b.preventDefault();break;}}};RadialMenu.prototype.onMouseWheel=function(b){var a=this;if(a.currentMenu){var c=-b.deltaY;if(c>0){a.selectDelta(1);}else{a.selectDelta(-1);}}};RadialMenu.prototype.getSelectedNode=function(){var b=this;var a=b.currentMenu.getElementsByClassName("selected");if(a.length>0){return a[0];}else{return null;}};RadialMenu.prototype.getSelectedIndex=function(){var a=this;var b=a.getSelectedNode();if(b){return parseInt(b.getAttribute("data-index"));}else{return -1;}};RadialMenu.prototype.setSelectedIndex=function(c){var b=this;if(c>=0&&c<b.levelItems.length){var a=b.currentMenu.querySelectorAll('g[data-index="'+c+'"]');if(a.length>0){var e=a[0];var d=b.getSelectedNode();if(d){d.setAttribute("class","sector");}e.setAttribute("class","sector selected");}}};RadialMenu.prototype.createUseTag=function(a,d,c){var b=document.createElementNS("http://www.w3.org/2000/svg","use");b.setAttribute("x",RadialMenu.numberToString(a));b.setAttribute("y",RadialMenu.numberToString(d));b.setAttribute("width","10");b.setAttribute("height","10");b.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",c);return b;};RadialMenu.prototype.appendSectorPath=function(b,j,d,k,f){var l=this;var h=l.getSectorCenter(b,j);var c={x:RadialMenu.numberToString((1-l.scale)*h.x),y:RadialMenu.numberToString((1-l.scale)*h.y)};var e=document.createElementNS("http://www.w3.org/2000/svg","g");e.setAttribute("transform","translate("+c.x+" ,"+c.y+") scale("+l.scale+")");var m=document.createElementNS("http://www.w3.org/2000/svg","path");m.setAttribute("d",l.createSectorCmds(b,j));m.setAttribute("class",l.theme);e.appendChild(m);if(k){e.setAttribute("class","sector");if(f==0){e.setAttribute("class","sector selected");}e.setAttribute("data-id",k.id);e.setAttribute("data-index",f);if(k.title){var i=l.createText(h.x,h.y,k.title);if(k.icon){i.setAttribute("transform","translate(0,8)");}else{i.setAttribute("transform","translate(0,2)");}e.appendChild(i);}if(k.icon){var a=l.createUseTag(h.x,h.y,k.icon);if(k.title){a.setAttribute("transform","translate(-5,-8)");}else{a.setAttribute("transform","translate(-5,-5)");}e.appendChild(a);}}else{e.setAttribute("class","dummy");}d.appendChild(e);};RadialMenu.prototype.createSectorCmds=function(a,f){var g=this;var d=RadialMenu.getDegreePos(a,g.radius);var i="M"+RadialMenu.pointToString(d);var b=g.radius*(1/g.scale);i+="A"+b+" "+b+" 0 0 0"+RadialMenu.pointToString(RadialMenu.getDegreePos(f,g.radius));i+="L"+RadialMenu.pointToString(RadialMenu.getDegreePos(f,g.innerRadius));var h=g.radius-g.innerRadius;var e=(h-(h*g.scale))/2;var c=(g.innerRadius+e)*(1/g.scale);i+="A"+c+" "+c+" 0 0 1 "+RadialMenu.pointToString(RadialMenu.getDegreePos(a,g.innerRadius));i+="Z";return i;};RadialMenu.prototype.createText=function(a,e,d){var b=this;var c=document.createElementNS("http://www.w3.org/2000/svg","text");c.setAttribute("text-anchor","middle");c.setAttribute("x",RadialMenu.numberToString(a));c.setAttribute("y",RadialMenu.numberToString(e));c.setAttribute("font-size","17%");c.innerHTML=d;return c;};RadialMenu.prototype.createCircle=function(a,d,b){var c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",RadialMenu.numberToString(a));c.setAttribute("cy",RadialMenu.numberToString(d));c.setAttribute("r",b);return c;};RadialMenu.prototype.calcScale=function(){var c=this;var b=c.sectorSpace*c.sectorCount;var d=Math.PI*2*c.radius;var a=c.radius-(d-b)/(Math.PI*2);return(c.radius-a)/c.radius;};RadialMenu.prototype.getSectorCenter=function(b,c){var a=this;return RadialMenu.getDegreePos((b+c)/2,a.innerRadius+(a.radius-a.innerRadius)/2);};RadialMenu.prototype.addIconSymbols=function(){var b=this;var a=document.createElementNS("http://www.w3.org/2000/svg","svg");a.setAttribute("class","icons");var c=document.createElementNS("http://www.w3.org/2000/svg","symbol");c.setAttribute("id","return");c.setAttribute("viewBox","0 0 489.394 489.394");var d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d","M375.789,92.867H166.864l17.507-42.795c3.724-9.132,1-19.574-6.691-25.744c-7.701-6.166-18.538-6.508-26.639-0.879L9.574,121.71c-6.197,4.304-9.795,11.457-9.563,18.995c0.231,7.533,4.261,14.446,10.71,18.359l147.925,89.823c8.417,5.108,19.18,4.093,26.481-2.499c7.312-6.591,9.427-17.312,5.219-26.202l-19.443-41.132h204.886c15.119,0,27.418,12.536,27.418,27.654v149.852c0,15.118-12.299,27.19-27.418,27.19h-226.74c-20.226,0-36.623,16.396-36.623,36.622v12.942c0,20.228,16.397,36.624,36.623,36.624h226.74c62.642,0,113.604-50.732,113.604-113.379V206.709C489.395,144.062,438.431,92.867,375.789,92.867z");c.appendChild(d);a.appendChild(c);var e=document.createElementNS("http://www.w3.org/2000/svg","symbol");e.setAttribute("id","close");e.setAttribute("viewBox","0 0 512 512");e.setAttribute("enable-background","new 0 0 512 512");var f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d","M189.217,0H33.38C14.97,0,0,14.982,0,33.391v155.826c0,18.41,14.982,33.391,33.391,33.391h155.826c18.41,0,33.391-14.982,33.391-33.391V33.391C222.609,14.982,207.627,0,189.217,0z M200.348,189.217c0,6.133-4.998,11.13-11.13,11.13H33.391c-6.133,0-11.13-4.998-11.13-11.13V33.391c0-6.133,4.986-11.13,11.119-11.13h155.837c6.133,0,11.13,4.998,11.13,11.13V189.217z");e.appendChild(f);a.appendChild(e);b.holder.appendChild(a);f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d","M478.609,0H322.783c-18.41,0-33.391,14.982-33.391,33.391v155.826c0,18.41,14.982,33.391,33.391,33.391h155.826c18.41,0,33.391-14.982,33.391-33.391V33.391C512,14.982,497.018,0,478.609,0zM489.739,189.217c0,6.133-4.986,11.13-11.13,11.13H322.783c-6.144,0-11.13-4.998-11.13-11.13V33.391c0-6.133,4.986-11.13,11.13-11.13h155.826c6.144,0,11.13,4.998,11.13,11.13V189.217z");e.appendChild(f);a.appendChild(e);b.holder.appendChild(a);f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d","M189.217,289.391H33.38C14.97,289.391,0,304.373,0,322.783v155.826C0,497.018,14.982,512,33.391,512h155.826c18.41,0,33.391-14.982,33.391-33.391V322.783C222.609,304.373,207.627,289.391,189.217,289.391z M200.348,478.609c0,6.144-4.998,11.13-11.13,11.13H33.391c-6.133,0-11.13-4.986-11.13-11.13V322.783c0-6.144,4.986-11.13,11.119-11.13h155.837c6.133,0,11.13,4.986,11.13,11.13V478.609z");e.appendChild(f);a.appendChild(e);b.holder.appendChild(a);f=document.createElementNS("http://www.w3.org/2000/svg","path");f.setAttribute("d","M478.609,289.391H322.783c-18.41,0-33.391,14.982-33.391,33.391v155.826c0,18.41,14.982,33.391,33.391,33.391h155.826c18.41,0,33.391-14.982,33.391-33.391V322.783C512,304.373,497.018,289.391,478.609,289.391z M489.739,478.609c0,6.144-4.986,11.13-11.13,11.13H322.783c-6.144,0-11.13-4.986-11.13-11.13V322.783c0-6.144,4.986-11.13,11.13-11.13h155.826c6.144,0,11.13,4.986,11.13,11.13V478.609z");e.appendChild(f);a.appendChild(e);b.holder.appendChild(a);};RadialMenu.getDegreePos=function(a,b){return{x:Math.sin(RadialMenu.degToRad(a))*b,y:Math.cos(RadialMenu.degToRad(a))*b};};RadialMenu.pointToString=function(a){return RadialMenu.numberToString(a.x)+" "+RadialMenu.numberToString(a.y);};RadialMenu.numberToString=function(b){if(Number.isInteger(b)){return b.toString();}else{if(b){var a=(+b).toFixed(5);if(a.match(/\./)){a=a.replace(/\.?0+$/,"");}return a;}}};RadialMenu.resolveLoopIndex=function(a,b){if(a<0){a=b+a;}if(a>=b){a=a-b;}if(a<b){return a;}else{return null;}};RadialMenu.degToRad=function(a){return a*(Math.PI/180);};RadialMenu.setClassAndWaitForTransition=function(a,b){return new Promise(function(d){function c(e){if(e.target==a&&e.propertyName=="visibility"){a.removeEventListener("transitionend",c);d();}}a.addEventListener("transitionend",c);a.setAttribute("class",b);});};RadialMenu.nextTick=function(a){setTimeout(a,10);};