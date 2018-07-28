function Point(x,y){
    this.x=x;
    this.y=y;
}
function Shape(iid, col, x,y,w,h){
    this.imageid= iid ;
    this.color = col;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sel = false;
}
function Line(a,b,pax,pay,pbx,pby,points,col, dash, arr0,arr1){
    this.a = a;
    this.b = b;
    this.pax = pax;
    this.pbx = pbx;
    this.pay = pay;
    this.pby = pby;
    this.points= points;
    this.color=col;
    this.dash=dash;
    this.arrow0=arr0;
    this.arrow1=arr1;
}

var elements = [new Shape(2,2,60,78,30,30),
						new Shape(2,1,60,178,30,30) ];
var lines = [new Line(elements[0],elements[1],-0.8,0,0,-1,[new Point(65,110)],0,false,true,true)];
var canvas = null;
var ctx = null;

var images = ["rect", "circle", "trapezoid","diamond"]
var colors = ["red","green","blue","pink"];
var cimages = [];

var remim;

var multiSel = false;

const SELECT=0;
const DRAG=1;
const SELECT_RECT=2;
const SCALE=2;

var mode=SELECT; //"sel"


var CPS = 6;

var zoom = 1;
var dx = 0;
var dy = 0;

var controls=[];

var lx,ly;
var toScale=null;

function mousedown(x,y){
    lx=x;
    ly=y;
	var mindis = 1000000000;
	var elSel = null;
	for(var i = 0;i<elements.length;i++){
		var el = elements[i];	
        if(el.sel && x> el.x+el.w/2-CPS && x< el.x+el.w/2+CPS &&
           y> el.y+el.h/2-CPS && y< el.y+el.h/2+CPS ){
           toScale = el;
           mode = SCALE;    
        } 
	}
    
	for(var i = 0;i<elements.length;i++){
		var el = elements[i];	
        if(x> el.x-el.w/2 && x< el.x+el.w/2 &&
           y> el.y-el.h/2 && y< el.y+el.h/2){
           elSel = el;    
        } 
	}
    if(elSel ==null){
        mode= SELECT_RECT;
    }else{
        if(!multiSel){
            
            for(var i = 0;i<elements.length;i++){
                var el = elements[i];
                el.sel = false;	
            }
            elSel.sel=true;
            mode = DRAG;
                
        }else{
            if(elSel!=null)
                elSel.sel = !elSel.sel; 
        }        
    }
	console.log("md");
	draw();
}

function mousemove(x,y){
    var mx=x-lx;
    var my=y-ly;
    if(mode==DRAG){        
        for(var i = 0;i<elements.length;i++){
            var el = elements[i];
            if(el.sel){
                el.x+=mx;
                el.y+=my;
            }	
        }        
    }else if(mode==SCALE){
        toScale.w+=mx;
        toScale.h+=my;        
    }
    	
    lx=x;
    ly=y;
    draw();
}
function mouseup(x,y){
    mode = SELECT;
    draw();
}

function loadImage(i){
	var ii = i;				
	var img = new Image();   // Create new img element
	img.addEventListener('load', function() {
		/*console.log(ii);
		context2D.drawImage(img, 0, 0);
        imageData = context2D.getImageData(0, 0, img.width, img.height);
        var imageDataPixels = imageData.data;
        
        for (var i = 0; i <= 255; ++i)
        {
            var newImageData = context2D.createImageData(5, 5);
            var pixels = newImageData.data;
            for (var j = 0, n = pixels.length; j < n; j += 4)
            {
                pixels[j] = imageDataPixels[j];
                pixels[j + 1] = imageDataPixels[j + 1];
                pixels[j + 2] = imageDataPixels[j + 2];
                pixels[j + 3] = Math.floor(imageDataPixels[j + 3] * i / 255);
            }
            blueParticleTextureAlpha.push(newImageData);
        }
        blueParticleTextureLoaded = true;*/
        
		
		cimages[ii] = img;
		
		
		/*
		for(var j=0;j<colors.length;j++){
			
			var c = colors[j];
			var newImageData = context2D.createImageData(5, 5);
			var pixels = newImageData.data;
            for (var j = 0, n = pixels.length; j < n; j += 4)
            {
				for(var k=0;k<3;k++)
					pixels[j+k] =  Math.floor(imageDataPixels[j+k]*c[k]);
                pixels[j + 3] =imageDataPixels[j + 3];
            }
			
			cimages[ii*colors.length + j] = img;
		}*/
		remim--;
		if(remim==0){
			draw();
		}
	}, false);
	img.src = "img/"+images[i]+".png"; // Set source path

}
function init(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	remim = images.length;
	
	for(var i=0;i<images.length;i++){ 
		cimages.push(null);
	}

	for(var i=0;i<images.length;i++){
		loadImage(i);
	}
	
	$('#canvas').mousedown(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;			

		mousedown(mouseX,mouseY);

	});
	
	$('#canvas').mousemove(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;			

		mousemove(mouseX,mouseY);

	});
	$('#canvas').mouseup(function(e){
        mouseup();
    });
}

function draw(){
	
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.scale(1, 1);
	ctx.strokeStyle = "red";
	ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
	for(var i = 0;i<elements.length;i++){
		var e = elements[i];		
		ctx.drawImage(cimages[e.imageid], e.x-e.w/2, e.y-e.h/2, e.w, e.h);
		ctx.fillStyle = colors[e.color];
		ctx.globalCompositeOperation = "source-atop";

		ctx.fillRect(e.x-e.w/2, e.y-e.h/2, e.w, e.h);
		ctx.globalCompositeOperation = "source-over";
			
		
		if(e.sel){
			ctx.setLineDash([2, 2]);
			ctx.rect(e.x-e.w/2, e.y-e.h/2, e.w, e.h);			
			ctx.stroke();

            ctx.fillStyle = "red";
            ctx.fillRect(e.x+e.w/2 -CPS, e.y+e.h/2 -CPS, CPS*2, CPS*2);
		}
	}	
    ctx.setLineDash([1, 0]);
	ctx.strokeStyle = "black";
	for(var i = 0;i<lines.length;i++){
		var e = lines[i];	
            
        ctx.beginPath();
        var ax=e.a.x + e.a.w*e.pax*0.5;
        var ay=e.a.y + e.a.h*e.pay*0.5;
        ctx.moveTo(ax,ay);
        for(var j=0;j<e.points.length;j++){            
            ctx.lineTo(e.points[j].x ,e.points[j].y );
        }
        var bx=e.b.x + e.b.w*e.pbx*0.5;
        var by=e.b.y + e.b.h*e.pby*0.5;
        ctx.lineTo(bx,by);
        
        if(e.arrow0){
            var lx,ly;
            if(e.points.length>0){
                lx=ax-e.points[0].x;
                ly=ay-e.points[0].y;
            }else{
                lx = ax-bx;
                ly = ay-by;
            }
            
            var l = Math.sqrt(lx*lx + ly*ly);
            lx/=l;
            ly/=l;
            
            ctx.moveTo(ax+(-lx-ly)*CPS,ay+(-ly+lx)*CPS);
            ctx.lineTo(ax,ay);
            ctx.lineTo(ax+(-lx+ly)*CPS,ay+(-ly-lx)*CPS);
        }
        if(e.arrow1){
            var lx,ly;
            if(e.points.length>0){
                lx=bx-e.points[e.points.length-1].x;
                ly=by-e.points[e.points.length-1].y;
            }else{
                lx = bx-ax;
                ly = by-ay;
            }
            
            var l = Math.sqrt(lx*lx + ly*ly);
            lx/=l;
            ly/=l;
            
            ctx.moveTo(bx+(-lx-ly)*CPS,by+(-ly+lx)*CPS);
            ctx.lineTo(bx,by);
            ctx.lineTo(bx+(-lx+ly)*CPS,by+(-ly-lx)*CPS);
        }
        ctx.stroke();	
    }
    
	ctx.restore();
	

}
