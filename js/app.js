const SHAPE=0;
const LINE=1;

var v_x=0;
var v_y=0;

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
    this.text= "shape";
    this.h = h;
    this.type = SHAPE;
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
    this.type= LINE;
    this.linew=1;
    this.color=0;
}

var elements = [new Shape(2,2,60,78,30,30),
						new Shape(2,1,60,178,30,30) ];
var lines = [new Line(elements[0],elements[1],-0.8,0,0,-1,[new Point(65,110)],0,false,true,true)];


function importDiagram(k, str){
    str= str.trim();
    elSel=null;
    str_decrypt(str, k,
        function(s){
            var js = JSON.parse(s);
            elements=js.shapes;
            lines=js.lines;
            for(var i=0;i<elements.length;i++){
                var e=elements[i];
                e.type=SHAPE;
            }
            for(var i=0;i<lines.length;i++){
                var e=lines[i];
                e.type=LINE;
                e.a = elements[e.a];
                e.b = elements[e.b];
            }
            draw();
        }
    );
}
function exportDiagram(k, cb){
    var js = {shapes:[], lines:[]};
    
    for(var i=0;i<elements.length;i++){
        var e=elements[i];
        e.index=i;
        js.shapes.push({
           text:e.text,
           color:e.color,
           imageid:e.imageid,
           x:e.x,
           y:e.y,
           w:e.w,
           h:e.h
        });
    }
    for(var i=0;i<lines.length;i++){
        var e=lines[i];
        var points=[];
        for(var j=0;j<e.points.length;j++)
            points.push({x:e.points[j].x,y:e.points[j].y});
        js.lines.push({
            a:e.a.index,
            b:e.b.index,
            pax    :e.pax    ,
            pbx    :e.pbx    ,
            pay    :e.pay    ,
            pby    :e.pby    ,
            points :e.points ,
            color  :e.color  ,
            dash   :e.dash   ,
            arrow0 :e.arrow0 ,
            arrow1 :e.arrow1 ,
            type   :e.type   ,
            linew  :e.linew  ,
            color  :e.color 
        });
    }
    var ss = JSON.stringify(js);
    str_encrypt(ss, k,
        function(s){          
            cb(s);            
        }
    );
}
/*
 *  
            var textArea = document.createElement("textarea");
            textArea.value = s;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Fallback: Copying text command was ' + msg);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            
            document.body.removeChild(textArea); 
 * 
 */
 
var canvas = null;
var ctx = null;

var images = ["rect", "circle", "trapezoid","diamond"]
var colors = ["#faa","#afa","#aaf","#ff7"];
var lcolors = ["black","red","green","blue"];

var cimages = [];

var remim;

var multiSel = false;

const SELECT=0;
const DRAG=1;
const SCALE=2;
const MOVE_A = 3;
const MOVE_B =4;
const MOVE_POINT=5;
const ADD_SHAPE=6;;
const ADD_LINE=7;
const ADD_LINE_POINT=8;

var mode=SELECT; //"sel"


var CPS_C = 6;
var CPS = 6;

var view_zoom = 1;
var view_x = 0;
var view_y = 0;

var controls=[];

var lx,ly;
var elSel=null;
var pSel=null;

function showMessage(s){
	$("#mess").text(s);
	//$("#messc").show();	
	$("#messc").fadeIn(200).delay(500).fadeOut(200);
}

var prevp;
function shapeBelow(x,y){
    var es=null;
	for(var i = 0;es==null && i<elements.length;i++){
		var el = elements[i];	
        if(x> el.x-el.w/2 && x< el.x+el.w/2 &&
           y> el.y-el.h/2 && y< el.y+el.h/2){
           es = el;    
        } 
	}
    return es;
}

function mousedown(x,y){
    lx=x;
    ly=y;
	var mindis = 1000000000;
    if(mode == ADD_LINE_POINT){
        if(elSel!=null && elSel.type==LINE){
            elSel.points.push(new Point(x,y));
        }
        clearButton();        
        draw();
        return;
    }
    
    if(mode == ADD_SHAPE){
        var s = new Shape(2,2,x,y,30,30);
        if(elSel!=null && elSel.type==SHAPE){
            s.color=elSel.color;
            s.imageid=elSel.imageid;
            s.w=elSel.w;
            s.h=elSel.h;
            
        }        
        elements.push(s);
        clearButton();
        
        draw();
        return;
    }
    
    if(mode == ADD_LINE){
        prevp = new Point(x,y);
        draw();
        return;
    }
    if(mode == ADD_SHAPE){
        elements.push(new Shape(2,2,x,y,30,30));
        clearButton();
        
        draw();
        return;
    }
    
    if(elSel!= null && elSel.type==SHAPE && x> elSel.x+elSel.w/2-CPS && x< elSel.x+elSel.w/2+CPS &&
           y> elSel.y+elSel.h/2-CPS && y< elSel.y+elSel.h/2+CPS ){
       mode = SCALE;    
       return;
    } 
    if(elSel!= null && elSel.type==LINE){
		var e = elSel;	
        for(var j=0;j< 2+e.points.length;j++){
            var ax,ay;
            if(j==0){                
                ax=e.a.x + e.a.w*e.pax*0.5;
                ay=e.a.y + e.a.h*e.pay*0.5;
            }else if(j==e.points.length+1){
                ax=e.b.x + e.b.w*e.pbx*0.5;
                ay=e.b.y + e.b.h*e.pby*0.5;
            }else{
                ax=e.points[j-1].x;
                ay=e.points[j-1].y;
            }
            if(x> ax-CPS && x< ax+CPS &&
                   y> ay-CPS && y< ay+CPS ){
                if(j==0)
                    mode = MOVE_A;
                else if(j==e.points.length+1)
                    mode = MOVE_B;
                else{
                    mode = MOVE_POINT;
                    pSel= e.points[j-1];
                }
                return;
            } 
    
        }

    }
    
    elSel = shapeBelow(x,y);
    
	for(var i = 0;elSel==null && i<lines.length;i++){
		var e = lines[i];	
        for(var j=0;j< 1+e.points.length;j++){
            var ax,ay;
            var bx,by;
            if(j==0){                
                ax=e.a.x + e.a.w*e.pax*0.5;
                ay=e.a.y + e.a.h*e.pay*0.5;
            }else{
                ax=e.points[j-1].x;
                ay=e.points[j-1].y;
            }
            
            if(j==e.points.length){                
                bx=e.b.x + e.b.w*e.pbx*0.5;
                by=e.b.y + e.b.h*e.pby*0.5;
            }else{
                bx=e.points[j].x;
                by=e.points[j].y;
            }
            var dx= x-ax;
            var dy= y-ay;
            var abx= bx-ax;
            var aby= by-ay;
            var t = (dx*abx+dy*aby)/( abx*abx+aby*aby);
            if(t<0)t=0;
            if(t>1)t=1;
            var px= ax+ abx*t;
            var py= ay + aby*t;
            if((x-px)*(x-px) + (y-py)*(y-py) < CPS*CPS){
                elSel = e;  
            } 
        }
	}
    if(elSel!=null && elSel.type == SHAPE){     
        mode = DRAG;            
    }    
	console.log("md");
	draw();
}

function mousemove(x,y){
    var mx=x-lx;
    var my=y-ly;
    if(mode==DRAG){ 
        if(elSel!=null){
            elSel.x+=mx;
            elSel.y+=my;            
        }       
    }else if(mode==SCALE){
        elSel.w+=mx*2;
        elSel.h+=my*2;        
    }else if(mode==MOVE_POINT){
        pSel.x+=mx;
        pSel.y+=my;        
    }else if(mode==MOVE_A){
        elSel.pax=Math.min(1,Math.max(-1,elSel.pax+2*mx/elSel.a.w));
        elSel.pay=Math.min(1,Math.max(-1,elSel.pay+2*my/elSel.a.h));              
    }else if(mode==MOVE_B){              
        elSel.pbx=Math.min(1,Math.max(-1,elSel.pbx+2*mx/elSel.b.w));
        elSel.pby=Math.min(1,Math.max(-1,elSel.pby+2*my/elSel.b.h));              
    }
    	
    lx=x;
    ly=y;
    draw();
}
function mouseup(x,y){
    if(mode == ADD_LINE){
        
        clearButton();
        var a = shapeBelow(prevp.x,prevp.y);
        var b = shapeBelow(lx,ly);
        if(a!=null && b!=null && a!=b){
            var l= new Line(a,b,(prevp.x-a.x)/a.w,(prevp.y-a.y)/a.h,  (lx-b.x)/b.w,(ly-b.y)/b.h,[],0,false,false,true)
            lines.push(l);
            if(elSel!=null && elSel.type==LINE){
                l.color=elSel.color;
                l.linew=elSel.linew;
                l.arrow0=elSel.arrow0;
                l.arrow1=elSel.arrow1;            
            }    
        }
        
        prevp=null;
            
        
    }
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
var lastButton = null;
function clearButton(b, m){
    if(lastButton!=null)
        $(lastButton).removeClass("act");
    mode = SELECT;
    lastButton=null;
}
function setButtonActive(b, m){
    if(lastButton!=null)
        $(lastButton).removeClass("act");
    if(lastButton!=b){
        lastButton=b;
        $(b).addClass("act");
        mode= m;
        return true;
    }else{
        lastButton=null;
        mode = SELECT;
        return false;
    }
}

//https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
function is_touch_device() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}
function setZoom(z, ks){

    view_zoom= z;
    if(ks){
        var cx=(canvas.width/2-view_x)/view_zoom;
        var cy=(canvas.height/2-view_y)/view_zoom;
        view_x = canvas.width/2-cx*view_zoom;
        view_y = canvas.height/2-cy*view_zoom;            
    }
    CPS= CPS_C/z;
}
var edit_image_id=0;
var edit_color_id=0;

function updatePreview(){
    var ocanvas = document.getElementById('opreview');
	var octx = ocanvas.getContext('2d');
    octx.clearRect(0,0,ocanvas.width,ocanvas.height);
    
    octx.drawImage(cimages[edit_image_id], 0,0,ocanvas.width,ocanvas.height);
    octx.fillStyle = colors[edit_color_id];
    octx.globalCompositeOperation = "source-atop";

    octx.fillRect(0,0, ocanvas.width,ocanvas.height);
    octx.globalCompositeOperation = "source-over";   
    
}
function updateLPreview(){
    var ocanvas = document.getElementById('lpreview');
	var octx = ocanvas.getContext('2d');
    octx.clearRect(0,0,ocanvas.width,ocanvas.height);
    
    octx.strokeStyle= lcolors[edit_color_id];
    octx.lineWidth = Math.pow(2,edit_line_w);
    octx.beginPath();
    octx.moveTo(0,ocanvas.height/2);
    octx.lineTo(ocanvas.width,ocanvas.height/2);
    var S=10;
    if($("#lara").prop( "checked")){        
        octx.moveTo(S,ocanvas.height/2-S);
        octx.lineTo(0,ocanvas.height/2);
        octx.lineTo(S,ocanvas.height/2+S);
    }
    if($("#larb").prop( "checked")){        
        octx.moveTo(ocanvas.width-S,ocanvas.height/2-S);
        octx.lineTo(ocanvas.width,ocanvas.height/2);
        octx.lineTo(ocanvas.width-S,ocanvas.height/2+S);
    }
    octx.stroke();
}
var modal=null;
function showModal(name){
    modal =name;
    $(modal).show();
}

function setupShapeEditDialog(){
    $("#ein").click(function(){
        edit_image_id=(edit_image_id+1)%cimages.length;
        updatePreview();
    })
    $("#eip").click(function(){
        edit_image_id=(cimages.length+edit_image_id-1)%cimages.length;
        updatePreview();
    })
    $("#ecn").click(function(){
        edit_color_id=(edit_color_id+1)%colors.length;
        updatePreview();
    })
    $("#ecp").click(function(){
        edit_color_id=(colors.length+edit_color_id-1)%colors.length;
        updatePreview();
    })
    $("#oset").click(function(){
        if(elSel==null)return;        
        if(elSel.type==SHAPE){
            elSel.text = $("#otext").val();
            elSel.color=edit_color_id;
            elSel.imageid=edit_image_id ;
            $(modal).hide();
            draw();
        }        
    });  
      
}
var edit_line_w=0;
var max_line_w=5;

function setupLineEditDialog(){
    $("#lin").click(function(){
        edit_line_w=(edit_line_w+1)%max_line_w;
        updateLPreview();
    })
    $("#lip").click(function(){
        edit_line_w=(max_line_w+edit_line_w-1)%max_line_w;
        updateLPreview();
    })
    $("#lcn").click(function(){
        edit_color_id=(edit_color_id+1)%lcolors.length;
        updateLPreview();
    })
    $("#lcp").click(function(){
        edit_color_id=(lcolors.length+edit_color_id-1)%lcolors.length;
        updateLPreview();
    })
    $("#lset").click(function(){
        if(elSel==null)return;        
        if(elSel.type==LINE){
            elSel.color=edit_color_id;
            elSel.linew=edit_line_w;
            elSel.arrow0=$("#lara").prop( "checked");
            elSel.arrow1=$("#larb").prop( "checked");
            
            $(modal).hide();
            draw();
        }        
    });    
    $(".lchange").change(function(){
        updateLPreview();
    });
}
function setupMobile(){
    var lx=0;
    var ly=0;
    var ss=1;
    var sz;
    var pang=false;
    var lasttt=0;
    
    canvas.addEventListener('touchstart',function(e){
        e.preventDefault();
        if(e.touches.length==1){
          //  console.log(e.touches[0]);
          
            if(lookm){
                lx = e.touches[0].clientX;
                ly = e.touches[0].clientY;
                lasttt = new Date().getTime();
            }else mousedown((e.touches[0].clientX-view_x)/view_zoom,(e.touches[0].clientY-view_y)/view_zoom);
        }else{
            if(e.touches.length==2){
                lx = (e.touches[0].clientX+e.touches[1].clientX)*0.5;
                ly = (e.touches[0].clientY+e.touches[1].clientY)*0.5;
                ss = (e.touches[0].clientX-e.touches[1].clientX)*(e.touches[0].clientX-e.touches[1].clientX)
                        + (e.touches[0].clientY-e.touches[1].clientY)*(e.touches[0].clientY-e.touches[1].clientY);
                sz=view_zoom;
                pang=true;
            }
            
            mode=SELECT;
            elSel= null;
        }
    });
    canvas.addEventListener('touchmove',function(e){
        e.preventDefault();
        if(pang){
            var cx = (e.touches[0].clientX+e.touches[1].clientX)*0.5;
            var cy = (e.touches[0].clientY+e.touches[1].clientY)*0.5;
            var s = (e.touches[0].clientX-e.touches[1].clientX)*(e.touches[0].clientX-e.touches[1].clientX)
                        + (e.touches[0].clientY-e.touches[1].clientY)*(e.touches[0].clientY-e.touches[1].clientY);
            
            view_x+= (cx-lx)/view_zoom;
            view_y+= (cy-ly)/view_zoom;
            
            setZoom(sz*Math.sqrt(s/ss));
            
            lx=cx;
            ly=cy;
            draw();
            return;
        }
        if(e.touches.length==1){
          //  console.log(e.touches[0]);
            if(lookm){
                
                v_x += e.touches[0].clientX-lx;
                v_y += e.touches[0].clientY-ly;
                lx = e.touches[0].clientX;
                ly = e.touches[0].clientY;
                
                if(v_x<0)
                    v_x=0;
                if(v_x>canvas.width)
                    v_x=canvas.width;
                if(v_y<0)
                    v_y=0;
                if(v_y>canvas.height)
                    v_y=canvas.height;
                    
                mousemove((v_x-view_x)/view_zoom,(v_y-view_y)/view_zoom)
            
                draw();
            }else mousemove((e.touches[0].clientX-view_x)/view_zoom,(e.touches[0].clientY-view_y)/view_zoom);
        }
        
    });
    
    canvas.addEventListener('touchend',function(e){
        e.preventDefault();
        if(!pang){
            if(lookm){
                if(new Date().getTime() -lasttt < 300){
                    
                    lookd= !lookd;
                    if(lookd){
                        mousedown((v_x-view_x)/view_zoom,(v_y-view_y)/view_zoom);
                    }else{
                        mouseup();                            
                    }
                    draw();
                }                 
            }else{
                if(e.touches.length==0 && mode!=SELECT){
                    mouseup();
                }         
            }  
        }
        pang = false;
        
        
    });
}
function setupDesktop(){
	var dragg=false;
	var zoomg=false;
    var llx,lly;
    var ctrlKey = false;
    var shiftKey = false;
    window.onkeydown = function(e) {
        if(e.keyCode == 17) {
            ctrlKey = true;
        }
        if(e.keyCode == 16) {
            shiftKey = true;
        }
    };
    window.onkeyup = function(e) {
        if(e.keyCode == 17) {
            ctrlKey = false;
        }
        if(e.keyCode == 16) {
            shiftKey = false;
        }
    };
    var szo = 0;
	$('#canvas').mousedown(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;			
                     
        llx=mouseX;           
        lly=mouseY;
        if(ctrlKey){
            dragg=true;  
            return;
        }
        if(shiftKey){
            zoomg=true;
            szo = view_zoom;
            return;
        }
		mousedown((mouseX-view_x)/view_zoom,(mouseY-view_y)/view_zoom);

	});
	
	$('#canvas').mousemove(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;

        var ddx=mouseX-llx;
        var ddy=mouseY-lly;
                    
        llx=mouseX;           
        lly=mouseY;
        if(dragg){
                    
            view_x+= ddx/view_zoom;
            view_y+= ddy/view_zoom;
            draw();
            return;
        }    
        if(zoomg){
            setZoom(view_zoom*Math.exp(2*ddx/canvas.width),true);
            
            
            draw();
            return;;
        }
		mousemove((mouseX-view_x)/view_zoom,(mouseY-view_y)/view_zoom);

	});
	$('#canvas').mouseup(function(e){
        if(dragg){
            dragg=false;                
            return;
        }
        
        if(zoomg){
            zoomg=false;                
            return;
        }
        mouseup();
    });
}
var lookm=false;
var lookd=false;
function init(){
    
    $("#upload").click(function(){
        showModal("#uploadD");//
        $("#ukeyw").focus();
    });
    var cmpr;
    $("#dupload").click(function(){
        exportDiagram($("#ukeyw").val(),function(s){
            $("#ukeyw").val("");
            $(modal).hide();
            cmpr=s;
            showModal("#uploadD2");            
        });
    });
    $("#dupload2").click(function(){
        var textArea = document.createElement("textarea");
        textArea.value = cmpr;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            showMessage("copied to clipboard");
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        
        document.body.removeChild(textArea); 
        $(modal).hide();
    });
    $("#download").click(function(){
        showModal("#downloadD");//
        $("#ddata").val("");
        $("#ddata").focus();
    });
    $('#ddata').on('paste', function () {
        setTimeout(function(){
            $("#dkeyw").focus();
        },1000);
    });
    
    $("#ddownload").click(function(){
        importDiagram($("#dkeyw").val(),$("#ddata").val());
        $("#dkeyw").val("");
        $(modal).hide();
    });
    setupShapeEditDialog();
    setupLineEditDialog();
    
    $(".close").click(function(){
       if(modal!=null){
           $(modal).hide();
           modal=null;
       }
    });
    $("#props").click(function(){
        if(elSel==null)return;
        
        if(elSel.type==SHAPE){
            showModal("#shapeEdit");
            $("#otext").val(elSel.text);
            edit_color_id= elSel.color;
            edit_image_id = elSel.imageid;
            
            updatePreview();
        }else if(elSel.type ==LINE){
            $("#lara").prop( "checked",elSel.arrow0);
            $("#larb").prop( "checked",elSel.arrow1);
            edit_line_w = elSel.linew;
            edit_color_id = elSel.color;
            showModal("#lineEdit");
            
            updateLPreview();
        }
    });
    $("#lookm").click(function(){
        lookm=!lookm;
        $("#lookm").toggleClass("act");     
        draw();       
    });
    
    $("#lookd").click(function(){
        if(lookd){
            mouseup();
        }else{
            mousedown((v_x-view_x)/view_zoom,(v_y-view_y)/view_zoom);
        }
        lookd=!lookd;
        $("#lookd").toggleClass("act");            
    });
    
    $("#adds").click(function(){
        setButtonActive("#adds",ADD_SHAPE);
    });
    $("#addl").click(function(){
        setButtonActive("#addl",ADD_LINE);
    });
    $("#addp").click(function(){
        if(elSel!=null && elSel.type==LINE)setButtonActive("#addp",ADD_LINE_POINT);
    });
    $("#delp").click(function(){        
        if(elSel!=null && elSel.type==LINE){
            var i = elSel.points.indexOf(pSel);
            if(i!=-1){
                elSel.points.splice(i,1);
                draw();
            }
        }
    });
    $("#del").click(function(){
        if(elSel!=null){
            if(elSel.type==LINE){
                var i = lines.indexOf(elSel);
                lines[i] = lines[lines.length-1];
                lines.pop();
            }else if(elSel.type==SHAPE){
                var i = elements.indexOf(elSel);
                elements[i] = elements[elements.length-1];
                elements.pop();
                for(var i=0;i<lines.length;){
                    if(lines[i].a==elSel || lines[i].b==elSel){
                        lines[i]=lines[lines.length-1];
                        lines.pop();
                    }else{
                        i++;
                    }
                }
            }
            elSel=null;
            draw();
        }
    });
    
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	remim = images.length;
	
	for(var i=0;i<images.length;i++){ 
		cimages.push(null);
	}

	for(var i=0;i<images.length;i++){
		loadImage(i);
	}
    setupDesktop();
    if(is_touch_device()){
        setupMobile();
    }
    
}

var drawin =false;
function draw(){    
    if(!drawin){
        drawin=true;
        setTimeout(function(){
            drawin = false;
            drawD();
        },1);
    }
}
function drawD(){
    
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
    
    
	ctx.translate(view_x,view_y);
    ctx.scale(view_zoom,view_zoom);
    
	ctx.strokeStyle = "red";
	ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    
	ctx.font = '22px serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign  = 'center';
	for(var i = 0;i<elements.length;i++){
		var e = elements[i];		
		ctx.drawImage(cimages[e.imageid], e.x-e.w/2, e.y-e.h/2, e.w, e.h);
		ctx.fillStyle = colors[e.color];
		ctx.globalCompositeOperation = "source-atop";

		ctx.fillRect(e.x-e.w/2, e.y-e.h/2, e.w, e.h);
		ctx.globalCompositeOperation = "source-over";
			
        ctx.fillStyle = "black";
        ctx.fillText(e.text, e.x,e.y);
		
		if(e==elSel){
			ctx.setLineDash([2, 2]);
			ctx.rect(e.x-e.w/2, e.y-e.h/2, e.w, e.h);			
			ctx.stroke();

            ctx.fillStyle = "red";
            ctx.fillRect(e.x+e.w/2 -CPS, e.y+e.h/2 -CPS, CPS*2, CPS*2);
            
		}
	}	
    ctx.setLineDash([1, 0]);
	for(var i = 0;i<lines.length;i++){
        
		var e = lines[i];	
        
        ctx.strokeStyle = lcolors[e.color]; 
        ctx.lineWidth = Math.pow(2,e.linew);
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
            var ldx,ldy;
            if(e.points.length>0){
                ldx=ax-e.points[0].x;
                ldy=ay-e.points[0].y;
            }else{
                ldx = ax-bx;
                ldy = ay-by;
            }
            
            var l = Math.sqrt(ldx*ldx + ldy*ldy);
            ldx/=l;
            ldy/=l;
            
            ctx.moveTo(ax+(-ldx-ldy)*CPS,ay+(-ldy+ldx)*CPS);
            ctx.lineTo(ax,ay);
            ctx.lineTo(ax+(-ldx+ldy)*CPS,ay+(-ldy-ldx)*CPS);
        }
        if(e.arrow1){
            var ldx,ldy;
            if(e.points.length>0){
                ldx=bx-e.points[e.points.length-1].x;
                ldy=by-e.points[e.points.length-1].y;
            }else{
                ldx = bx-ax;
                ldy = by-ay;
            }
            
            var l = Math.sqrt(ldx*ldx + ldy*ldy);
            ldx/=l;
            ldy/=l;
            
            ctx.moveTo(bx+(-ldx-ldy)*CPS,by+(-ldy+ldx)*CPS);
            ctx.lineTo(bx,by);
            ctx.lineTo(bx+(-ldx+ldy)*CPS,by+(-ldy-ldx)*CPS);
        }
        ctx.stroke();
        ctx.lineWidth = 1;	
        if(e==elSel){            
            ctx.fillStyle = "black";
            ctx.globalAlpha =0.5;
            ctx.fillRect(ax -CPS, ay -CPS, CPS*2, CPS*2);
            ctx.fillRect(bx -CPS, by -CPS, CPS*2, CPS*2);
            for(var j=0;j<e.points.length;j++){
                if( e.points[j] ==pSel)ctx.fillStyle = "#333";
                else ctx.fillStyle = "black";         
                ctx.fillRect(e.points[j].x -CPS, e.points[j].y -CPS, CPS*2, CPS*2);
            }
            ctx.globalAlpha =1;
        }
    }
    ctx.strokeStyle = "red";
    if(mode == ADD_LINE && prevp!=null){
        ctx.beginPath();
        ctx.moveTo(prevp.x,prevp.y);
        ctx.lineTo(lx,ly);       
            
        ctx.stroke();	
    }
	ctx.restore();
	
    if(lookm){
        ctx.beginPath();
        if(lookd){
            ctx.fillStyle = "#f44";
            ctx.lineWidth=2;
            ctx.moveTo(v_x-6,v_y);
            ctx.lineTo(v_x,v_y-6);
            ctx.lineTo(v_x+6,v_y);
            ctx.lineTo(v_x,v_y+6);
            ctx.lineTo(v_x-6,v_y);
        }else{
            ctx.fillStyle = "#d44";
            
            ctx.moveTo(v_x-3,v_y-10);
            ctx.lineTo(v_x+3,v_y-10);
            ctx.lineTo(v_x  ,v_y-3 );            
            ctx.moveTo(v_x-3,v_y+10);
            ctx.lineTo(v_x+3,v_y+10);
            ctx.lineTo(v_x  ,v_y+3 );
            
            ctx.moveTo(v_x-10,v_y-3);
            ctx.lineTo(v_x-10,v_y+3);
            ctx.lineTo(v_x-3 ,v_y  );            
            ctx.moveTo(v_x+10,v_y-3);
            ctx.lineTo(v_x+10,v_y+3);
            ctx.lineTo(v_x+3 ,v_y  );
            
            /*ctx.moveTo(v_x-10,v_y);
            ctx.lineTo(v_x-3,v_y);
            ctx.moveTo(v_x+10,v_y);
            ctx.lineTo(v_x+3,v_y);        
            ctx.moveTo(v_x,v_y -10);
            ctx.lineTo(v_x,v_y -3 );
            ctx.moveTo(v_x,v_y +10);
            ctx.lineTo(v_x,v_y +3 ); */

        }
        ctx.globalAlpha=0.9;
        ctx.lineWidth=1;
        ctx.fill();	
        ctx.strokeStyle = "#000";
        ctx.lineWidth=1;
        ctx.stroke();	
        ctx.globalAlpha=1;
    }
}
