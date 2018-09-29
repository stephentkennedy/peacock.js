/*
This document is an unfinished 2D canvas render framework. It's built around the idea of a game or logic loop registering both objects to render and functions to move those objects around the render space before a frame is output. It's calculations are built upon a top down x,y coordinate understanding of a play space. By itself it does absolutely nothing.

Still to do. Figure out how the hell we're going to solve the z-index problems. We need to draw background, then forground based on y coords.
This should be determined by the vCalc function, as it populates the array that we draw from, so it should also order the array by y coord.
*/
r = {};
r.ctx = '';
r.can = '';
r.id = 'mainRender';
r.x = 0;
r.y = 0;
r.x2 = 0;
r.y2 = 0;
r.width = 0;
r.height = 0;
r.cX = 0;
r.cY = 0;
r.boundX = 3079;
r.boundY = 1879;

//Frame Logic Array: as part of the draw we will evaluate all of the functions registered in this array.
r.fL = [];

//Render Loop Array: since we clear the frame logic array during the draw, everything in this array will be pushed back into the frame logic after the draw is finished. This should allow us to define functions that need to happen Every frame, as opposed to things that only need to happen once and a while.
r.renderLoop = [];

//In View Array: in order to save time on the render, we'll cull everything that isn't calculated to be in view.
r.iV = [];

//Render Objects Array: everything in this array will be considered for render, and pushed into the iV array if it is in the render frame.
r.obj = [];
r.loop = false;
r.framedelay = 16; //Just under 60 frames per second (58.82...). Consider increasing the interval if things get hairy. Most of the games we're going to develop with this can probably handle a drop to 40 frames (25) (Don't do this, most monitors refress at 60 or 30, and the further we are from the refress, the uglier it looks) or 30 (30.303...) frames (33). 

r.init = function(domID, canvasID){
	var dom = document.getElementById(domID);
	if(canvasID != undefined){
		r.id = canvasID;
	}
	var height = window.innerHeight;
	var width = window.innerWidth;
	r.height = height;
	r.width = width;
	r.x2 = r.x + r.width;
	r.y2 = r.y + r.height;
	r.cX = Math.floor(r.x2 / 2);
	r.cY = Math.floor(r.y2 / 2);
	dom.innerHTML += '<canvas id="' + r.id + '" width="' + width + '" height="' + height + '"></canvas>';
	r.can = document.getElementById(r.id);
	r.ctx = r.can.getContext('2d');
	/*r.ctx.globalCompositeOperation = 'destination-over';*/
	r.loop = setInterval(r.draw, r.framedelay);
}

r.frame = function(){
	//We might change the interval to call the draw function directly, but this pushes it to before the next repaint, which should keep our non-canvas layers relatively clean.
	window.requestAnimationFrame(r.draw);
}

r.draw = function(){
	//Clear our frame completely. Might be a more effecient way to do this, but I don't know if I want to waste CPU calc on doing partial clears of the frame.
	r.ctx.clearRect(0, 0, r.width, r.height);
	
	//Now we need to draw our objects.
	for(i in r.iV){
		var obj = r.iV[i];
		if(typeof obj.sprite[0] == 'object'){
			//Sprite frame logic. If it's an array, we need to render and then increment the frame, or that's the way we'd do it if the sprites are to run at the same speed as the main game, instead we'll allow the object to decide how many frames a second it runs at.
			var sprite = obj.sprite[obj.sC];
			/*obj.sC++;
			if( obj.sC >= obj.sprite.length){
				obj.sC = 0;
			}*/
			
		}else{
			//Else we just need to prepare the static image.
			var sprite = obj.sprite;
		}
		
		//Let's account for the frame offset
		var x = obj.x - r.x;
		var y = obj.y - r.y;
		
		//Handle image rotatation. This code doesn't work. Obviously we don't understand how the ctx.rotate function operates
		if(obj.rotate != false && obj.rotate != undefined){
			var fX = r.centerX(obj, x);
			var fY = r.centerY(obj, y);
			var cX = Math.floor(obj.width / 2);
			var cY = Math.floor(obj.height / 2);
			r.ctx.translate(fX, fY);
			r.ctx.rotate(obj.rotate);
			r.ctx.drawImage(sprite, (-1 * cX), (-1 * cY));
			r.ctx.rotate(obj.rotate * -1);
			r.ctx.translate((-1 * fX), (-1 * fY));
		}else{
			r.ctx.drawImage(sprite, x, y);
		}
	}
	r.logicLoop();
	r.logic();
}
r.logic = function(){
	r.iV = [];
	
	//Frame logic functions should then make changes to their render objects. It may also move the render frame or "camera"
	for(i in r.fL){
		r.fL[i]();
	}
	//Rather than running all logic events all the time, it's up to the game loop to register logic events when something needs to be manipulated. This should keep our frametimes relatively optimized.
	r.fL = [];
	
	//Now we need to calculate if our objects are even in view.
	r.vCalc();
}

r.centerX = function(obj, x){
	return Math.floor( x + (obj.width / 2) );
}

r.centerY = function(obj, y){
	return Math.floor( y + (obj.height / 2) );
}

//Lock our frame to one of our objects.
r.lockFrame = function(obj){
	//Get the coords of our object in relation to the frame
	var x = obj.x;
	var y = obj.y;
	
	//Find the center point of our object
	x = r.centerX(obj, x);
	y = r.centerY(obj, y);
	
	//Find out what that should make our frame move to
	fX = x - r.cX;
	fY = y - r.cY;
	
	if(fX <= 0){
		fX = 0;
	}
	if(fY <= 0){
		fY = 0;
	}
	if(fX >= (r.boundX - r.width)){
		fX = r.boundX - r.width;
	}
	if(fY >= (r.boundY - r.height)){
		fY = r.boundY - r.height;
	}
	r.moveFrame(fX, fY);
}

//Shortcut to make sure we're updating our In View calc values when we move the frame.
r.moveFrame = function(x, y){
	r.x = x;
	r.x2 = x + r.width;
	r.y = y;
	r.y2 = y + r.height;
}

//Is our stuff in view?
r.vCalc = function(debug){
	if(debug == undefined){
		debug = false;
	}
	for(i in r.obj){
		var obj = r.obj[i];
		var x = obj.x;
		var y = obj.y;
		var x2 = obj.x + obj.width;
		var y2 = obj.y + obj.height;
		if(debug == true){
			var log = {
				x: x,
				x2: x2,
				y: y,
				y2: y2
			};
			console.log(log);
		}
		if((x2 >= r.x && x <= r.x2 && y <= r.y2 && y2 >= r.y)){
			r.iV.push(obj);
		}
	}
}

r.logicLoop = function(){
	for(i in r.renderLoop){
		r.fL.push(r.renderLoop[i]);
	}
}

r.stop = function(){
	clearInterval(r.loop);
}
r.start = function(){
	r.loop = setInterval(r.frame, r.framedelay);
}
