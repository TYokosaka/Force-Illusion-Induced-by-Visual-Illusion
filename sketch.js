let gauss_on =1;

let phase = 0;
let proc=0;

let trial_st_t=0;
let reference_t =0;

let card_ctrl=300;
let card_w = 0;
let card_h = 0;
let pixw =0;
let pixh =0;

const ncur_width = 15.0; // width of cursor[mm]
const cur_width = 8.0; // width of reference[mm]
const stop_width = 10.0; // width of start/goal point[mm]
const bg_width = 35.0; //width of background [mm]
const eccentricity = 30.0; //[mm]

let bgsize = 128; //Pixel size of background image
let cur_size = 32; // Pixel size of cursor image

let contrast1 = 0.75;

let vdisp = 2;
const vdispm = [-7.0, -3.5, 0.0, 3.5, 7.0];//[mm]

let pattern = 0; // 0: random noise, 1: gabor patch
let visibility = 0; // 0: lower (gray), 1: higher (black)

var vdispButtons = []; 
var vsibilityButtons = []; 
var patternButtons = []; 

var buttonX = [-40, -20, 0, 20, 40, -90, -70, 70, 90];

let clickT = [0, 0, 0];
let lastId = [0, 0, 0];

let curV1 = [];

let curr_cycle = 4000; //Time required for the referene to make one round trip. [ms]

let currt = 0;
let larger_t = 0;
let smaller_t = 0;


let referenceMissedFlag = false; // Flag representing deviation between cursor and reference

function setup() {
  
  createCanvas(windowWidth, windowHeight);
  
  clickT = [millis(), millis(), millis()];

}

function draw() {

  background(160);
  
  if(phase == 0){
    
    draw_monitor_maximize();
    
  }else if (phase ==1){
    
    draw_cardsize();
    
  }else if (phase ==2){
    
    //setup after pixel-size adjustment
    let diam =16/pixw;
    vdispButtons = [new vdispButton(buttonX[0]/pixw, 0, 0, "-7.0\nmm", diam),
                 new vdispButton(buttonX[1]/pixw, 0, 1, "-3.5\nmm", diam),
                 new vdispButton(buttonX[2]/pixw, 0, 2, "0.0\nmm", diam),
                 new vdispButton(buttonX[3]/pixw, 0, 3, "3.5\nmm", diam),
                 new vdispButton(buttonX[4]/pixw, 0, 4, "7.0\nmm",diam)];
    
    patternButtons = [new patternButton(buttonX[5]/pixw, 0, 0, "Random\nnoise", diam),
                 new patternButton(buttonX[6]/pixw, 0, 1, "Gabor\npatch", diam)];
    
    visibilityButtons = [new visibilityButton(buttonX[7]/pixw, 0, 0, "Low\n(gray)", diam),
                 new visibilityButton(buttonX[8]/pixw, 0, 1, "High\n(black)", diam)];
    
    draw_reset();
    phase++;
    
  }else if (phase ==3){
    
    noCursor();
    draw_trial();
    
  } 
}

//////////////////////////////////////////////////////////
// input

function mousePressed() {
  if (phase == 0) {
    let fs = fullscreen();
    fullscreen(!fs);
    phase ++;
    
  } 
  
  if(phase == 3){
    
    //button input
    for(let i = 0; i < vdispm.length; i++){
      vdispButtons[i].click();
    }
    patternButtons[0].click();
    patternButtons[1].click();
    visibilityButtons[0].click();
    visibilityButtons[1].click();
  }
  
}

function keyPressed() {
  
  if(phase==1){
    
    //card size adjustment
    
    if(keyCode === RIGHT_ARROW){
      card_ctrl= card_ctrl+5;
      larger_t = millis();
    }
    else if (keyCode === LEFT_ARROW){
      card_ctrl= card_ctrl-5;
      if(card_ctrl<1){
        card_ctrl=1;
      }
      smaller_t = millis();
    }
    else if (key == " "){
      card_w = card_ctrl;
      card_h = card_ctrl*53.98/85.6;
      
      pixw = 85.6/card_w; //width per 1pixel
      pixh = 53.98/card_h;//height per 1pixel
      
      bgsize = int(bg_width/pixw);
      cur_size = int(ncur_width/pixw);
      
      phase++;
      
    }
    
  }
  
  return false;
}

/////////////////////////////////////////////////
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


/////////////////////////////////////////////////
function draw_monitor_maximize(){
  cursor(CROSS);
  textSize(18);
  fill(0);
  text('Click the monitor to maximize it', 
       windowWidth / 2 - 160, windowHeight / 2 - 10, 400, 400);
  noFill();
  stroke(32, 32, 32);
  rect(windowWidth / 2 - 250, windowHeight / 2 - 30, 500, 60);
 
}



/////////////////////////////////////////////////
function draw_cardsize(){
  
  fill(0);
  rect(windowWidth / 2-200, windowHeight / 2-100, 100, 10);
  rect(windowWidth / 2-200, windowHeight / 2-100, 10, 100);

  fill(255);
  rect(windowWidth / 2-200+10, windowHeight / 2-100+10, 
       card_ctrl, card_ctrl*53.98/85.6);
  
  noStroke();
  if((larger_t > 0)&&(millis() - larger_t < 200)){
    fill(0, 0, 0);   
  }else{
    larger_t=0;
    fill(192,192,192);
  }
  triangle(windowWidth / 2-200+8+card_ctrl, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6,
           windowWidth / 2-200+8+card_ctrl, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6-15,
           windowWidth / 2-200+8+card_ctrl-15, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6);
  
  if((smaller_t > 0)&&(millis() - smaller_t < 200)){
    fill(0, 0, 0);   
  }else{
    smaller_t=0;
    fill(192,192,192);
  }
  triangle(windowWidth / 2-200+8+card_ctrl-17, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6-17,
           windowWidth / 2-200+8+card_ctrl-17, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6-2,
           windowWidth / 2-200+8+card_ctrl-2, 
           windowHeight / 2-100+8+card_ctrl*53.98/85.6-17);
  
  noStroke();
  fill(0);
  
  textSize((windowWidth/2)/39.6);
  let longest_inst = textWidth('Make the white rectangle the same size as a credit card by using the arrow keys.'); //width=39.6
  
  text('Make the white rectangle the same size as a credit card by using the arrow keys. \n-> key: increase the size of the white rectangle \n<- key: decrease the size of the white rectangle \nSpace key: complete the size adjustment', 
       windowWidth / 2 - longest_inst/2, windowHeight / 4 - 10);
  
}

/////////////////////////////////////////////////////////////
// Visual stimuli

function draw_trial(){
  
  currt = millis()-reference_t;
  
  //background image
  draw_bg(); 
  
  if(proc == 0){
    if(referenceMissedFlag){
      fill(0);
      textAlign(CENTER);
      textSize(5/pixw);
      text("Restart the trial since the deviation between cursor and reference was large!",windowWidth/2-0/pixw,windowHeight/2-80/pixw)
    }

    if((mouseX > windowWidth/2 - bg_width/pixw - stop_width/pixw/2) &&
       (mouseX < windowWidth/2 - bg_width/pixw + stop_width/pixw/2) &&
       (mouseY > windowHeight/2 -eccentricity/pixw - stop_width/pixw/2) &&
       (mouseY < windowHeight/2 -eccentricity/pixw + stop_width/pixw/2)) {
      proc++;
      trial_st_t = millis();
    }

    noStroke();
    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(4/pixw);
    text("Start", 
        windowWidth/2 - bg_width/pixw ,
          windowHeight/2 - eccentricity/pixw - stop_width/2/pixw);
    
    noStroke();
    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(4/pixw);
    text("Goal", 
        windowWidth/2 + bg_width/pixw,
          windowHeight/2 - eccentricity/pixw - stop_width/2/pixw);
    
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(5/pixw);
    text("See our paper for details on the stimuli and procedure.", 
        windowWidth/2,
          windowHeight/2 +60/pixw);

    draw_arrow();
    
    draw_buttons();

    draw_fixation(0);
    draw_noisecursor(0);
    draw_circlecursor();


  }else if(proc ==1){
    // countdown

    if((mouseX <= windowWidth/2 - bg_width/pixw - stop_width/pixw/2) ||
       (mouseX >= windowWidth/2 - bg_width/pixw + stop_width/pixw/2) ||
       (mouseY <= windowHeight/2 -eccentricity/pixw - stop_width/pixw/2) ||
       (mouseY >= windowHeight/2 -eccentricity/pixw + stop_width/pixw/2)){
      proc--;      
    }
    else{
      if(millis()-trial_st_t > 2000){
        proc++;
        reference_t = millis();
      }

    }

    draw_fixation(1);
    draw_noisecursor(0);
    draw_circlecursor();

  }
  else if(proc ==2){      

    draw_reference();

    if(millis()-trial_st_t < 4000){
      draw_fixation(0);
      draw_noisecursor(1);
      draw_circlecursor();
    }
    else{
      draw_reset();
      proc=0;
      referenceMissedFlag = false;
    }

    //When the deviation is large
    if(!is_noisecursor_in_reference()){
      proc = 0;
      referenceMissedFlag = true;
    }

  }     

}

function draw_bg(){
  //background image
  image(bg,
        int(windowWidth/2 - bgsize/2),
        int(windowHeight/2 - eccentricity/pixw - bgsize/2));

  stroke(0);
  fill(192,192,192);
  rect(windowWidth/2 - bg_width/pixw - stop_width/pixw/2,
       windowHeight/2 - eccentricity/pixw - stop_width/2/pixw,
       stop_width/pixw, stop_width/pixw);
  rect(windowWidth/2 + bg_width/pixw - stop_width/pixw/2,
       windowHeight/2 - eccentricity/pixw - stop_width/2/pixw,
       stop_width/pixw, stop_width/pixw);
  
}

function draw_noisecursor(_proc){    
  
  if(_proc==0){   
    image(curV1[0],
          int(mouseX - ncur_width/pixw/2), 
          int(mouseY - ncur_width/pixw/2));
  }
  else if(_proc==1){
    if(mouseX < windowWidth/2 - bg_width/2/pixw){        
      image(curV1[0],
            int(mouseX - ncur_width/pixw/2), 
            int(mouseY - ncur_width/pixw/2));
    }else if (mouseX < windowWidth/2 + bg_width/2/pixw){  
      let _curr_pos = int( (mouseX - windowWidth/2+bg_width/2/pixw)*(pixw/bg_width)*bgsize);
      image(curV1[_curr_pos],
            int(mouseX - ncur_width/pixw/2), 
            int(mouseY - ncur_width/pixw/2));

    }else{   
      image(curV1[0],
            int(mouseX - ncur_width/pixw/2), 
            int(mouseY - ncur_width/pixw/2));
    }
  }
  
}

function draw_circlecursor(){  
  strokeWeight(1.2/pixw);
  if(visibility){
    stroke(0);
  }
  else{
    stroke(255/2);
  }
  noFill();
  ellipse(mouseX, mouseY, 10/pixw, 10/pixw);
  strokeWeight(1);
  
}


function draw_reference(){
  
  fill(0);
  rect(int(calc_reference_X() - cur_width/pixw/2), 
       int(windowHeight/2 + eccentricity/pixw-cur_width/pixw/2), 
       cur_width/pixw, 
       cur_width/pixw);
  
}


function draw_fixation(_proc){

  stroke(0);
  fill(255);
  ellipse(windowWidth / 2, windowHeight / 2, 14/pixw, 8/pixw);
  fill(0);
  ellipse(windowWidth / 2, windowHeight / 2, 6/pixw, 6/pixw);
  fill(255);

  if(_proc==1){ //count down
    if(millis()-trial_st_t>500){  

      arc(windowWidth / 2, windowHeight / 2, 
          6/pixw, 6/pixw,
          -PI/2, -PI/2+(millis()-trial_st_t-500)*2*PI/1500);
    }
  }
  
}

function is_noisecursor_in_reference(){
  var nowReferencePos = calc_reference_X();
  let aceptableDiff = stop_width*1.5/pixw; //Acceptable deviation
  
  if((mouseX >= nowReferencePos - stop_width/pixw/2- aceptableDiff) &&
     (mouseX <= nowReferencePos + stop_width/pixw/2+ aceptableDiff)){   
    return true;
  }
  else{
    return false;
  }
  
}

function calc_reference_X(){
  return windowWidth/2 + -1 * cos(2*PI*currt/curr_cycle) * bg_width/pixw;  
}


/////////////////////////////////////////////////
function draw_noise(cur2, w, contrast){
  cur2.loadPixels();
  cur2_width = w;
  for (let y = 0; y < cur2_width; y++){
    for (let x = 0; x < cur2_width; x++){
      let index = (x + y * cur2_width) * 4;
      cur2.pixels[index]=127.5+contrast*127.5*(-1+2*round(random()));
      
      cur2.pixels[index + 1] = cur2.pixels[index];
      cur2.pixels[index + 2] = cur2.pixels[index];
      cur2.pixels[index + 3] = 255.0;
    }  
  }
  cur2.updatePixels();
  cur2.filter(BLUR,1);
  return cur2;
}


/////////////////////////////////////////////////
function draw_gabor(cur2, w, contrast){
  cur2.loadPixels();
  cur2_width = w;
  for (let y = 0; y < cur2_width; y++){
    let waveY = 255*contrast*(sin(2*PI*y*5/w+w/2)+1)/2
    for (let x = 0; x < cur2_width; x++){
      let index = (x + y * cur2_width) * 4;
      cur2.pixels[index]=waveY;      
      cur2.pixels[index + 1] = waveY;
      cur2.pixels[index + 2] = waveY;
      cur2.pixels[index + 3] = 255.0;
    }  
  }
  cur2.updatePixels();
  cur2.filter(BLUR,1);
  return cur2;
}

/////////////////////////////////////////////////
function draw_sequence(cur2,w,_vdisp){
  tmp = createImage(w, w);
  tmp.loadPixels();
  cur2.loadPixels();
  let index2;
  let index;
  let dist
  let sigma = int(0.4*w/2);
  for (let y = 0; y < w; y++){
    for (let x = 0; x < w; x++){
      index = (x + y * w) * 4;
      if (y+_vdisp>=0){
          index2 = (x + (int(y+_vdisp)%w) * w) * 4;
      
      }
      else{
          index2 = (x + (int(w+y+_vdisp)%w) * w) * 4;
      }
      tmp.pixels[index] = cur2.pixels[index2]
      tmp.pixels[index + 1] = tmp.pixels[index];
      tmp.pixels[index + 2] = tmp.pixels[index];
      if(gauss_on==1 && pattern==1){
        tmp.pixels[index + 3] = 255*exp(-(pow((w/2-x)/sigma,2)+pow((w/2-y)/sigma,2)));
      }else{
        if((w/2-x)*(w/2-x)+(w/2-y)*(w/2-y) < (10/2/pixw)*(10/2/pixw)){
          tmp.pixels[index + 3] = 255;
        }
        else{
          tmp.pixels[index + 3] = 0;
        }
      }
    }  
  }
  tmp.updatePixels();
  return tmp;
}

/////////////////////////////////////////////////
function draw_reset(){
  let lmr = [0, 1, 2];
  
  initial_image_setup();
  
  ///Generating image sequences //////////////////////////
  ydisp_val = 0;
  for (let frame = 0; frame < bgsize; frame++){
    ydisp_val = int(vdispm[vdisp]/pixw)*
                exp(-(((bgsize/2-frame)**2)/(2*((16*bgsize/128)**2))));
    curV1[frame] = draw_sequence(cur2,cur_size,int(ydisp_val));  

  }
  
}

/////////////////////////////////////////////////
function initial_image_setup(){
  bg = createImage(bgsize , bgsize);
  bg.loadPixels();
  for (let y = 0; y < bgsize ; y++){
    for (let x = 0; x < bgsize ; x++){
      let index = (x + y * bgsize ) * 4;
      bg.pixels[index]=127.5+contrast1*127.5*(-1+2*round(random()));
      bg.pixels[index + 1] = bg.pixels[index];
      bg.pixels[index + 2] = bg.pixels[index];
      bg.pixels[index + 3] = 255.0;
    }  
  }
  bg.updatePixels();
  bg.filter(BLUR,1);
  
  //Generating cursor noise///////////////////////////////
  cur2 = createImage(cur_size, cur_size);
  if(pattern==0){
    cur2 = draw_noise(cur2, cur_size, 0.75);
  }else{
    cur2 = draw_gabor(cur2, cur_size, 1.0);
  }
}

////////////////////////

function draw_arrow(){
  
  noStroke();
  fill(255, 255*(millis()%2000/2000));
  triangle(windowWidth/2 + bg_width/pixw - stop_width/pixw/3,
           windowHeight/2 - eccentricity/pixw,
           windowWidth/2 + bg_width/pixw - stop_width/pixw,
           windowHeight/2 - eccentricity/pixw-5/pixw,
           windowWidth/2 + bg_width/pixw - stop_width/pixw,
           windowHeight/2 - eccentricity/pixw+5/pixw)
  rect(windowWidth/2 - bg_width/pixw + stop_width/pixw/2+3/pixw,
       windowHeight/2 - eccentricity/pixw - stop_width/4/pixw,
       2*bg_width/pixw - stop_width*3/2/pixw - 3/pixw, 
       stop_width/2/pixw);
  
}


function draw_buttons(){
  
  let buttonCoverHeight = vdispButtons[0].diam+((buttonX[1]-buttonX[0])/pixw-vdispButtons[0].diam);
  noStroke();
  fill(200);
  rect(windowWidth/2+(buttonX[0]-10)/pixw,
       windowHeight/2+30/pixw-buttonCoverHeight/2,
       (buttonX[1]-buttonX[0])*5/pixw,
       buttonCoverHeight,
       3/pixw);
  if(millis() - clickT[0] < 400){
    noStroke();
    fill(255);
    rect(windowWidth/2+buttonX[lastId[0]]/pixw+(buttonX[lastId[0]]-buttonX[vdisp])/pixw*(cos(2*PI/2*(millis() - clickT[0])/400)-1)/2-vdispButtons[0].diam/2, 
       windowHeight/2+30/pixw-vdispButtons[0].diam/2,
       vdispButtons[0].diam, vdispButtons[0].diam,
       3/pixw);
  }
  for(let i = 0; i < vdispm.length; i++){
    vdispButtons[i].display();
  }
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(5/pixw);
  text("Amplitude of drift", windowWidth/2, windowHeight/2+45/pixw);

  noStroke();
  fill(200);
  rect(windowWidth/2+(buttonX[5]-10)/pixw,
       windowHeight/2+30/pixw-buttonCoverHeight/2,
       (buttonX[6]-buttonX[5])*2/pixw,
       buttonCoverHeight,
       3/pixw);
  if(millis() - clickT[1] < 400){
    noStroke();
    fill(255);
    rect(windowWidth/2+buttonX[lastId[1]+5]/pixw+(buttonX[lastId[1]+5]-buttonX[pattern+5])/pixw*(cos(2*PI/2*(millis() - clickT[1])/400)-1)/2-patternButtons[0].diam/2, 
       windowHeight/2+30/pixw-patternButtons[0].diam/2,
       patternButtons[0].diam, patternButtons[0].diam,
       3/pixw);
  }
  patternButtons[0].display();
  patternButtons[1].display();
  fill(0);
  textAlign(CENTER, CENTER);    
  textSize(5/pixw);
  text("Cursor pattern", windowWidth/2+(buttonX[5]+buttonX[6])/2/pixw, windowHeight/2+45/pixw);

  noStroke();
  fill(200);
  rect(windowWidth/2+(buttonX[7]-10)/pixw,
       windowHeight/2+30/pixw-buttonCoverHeight/2,
       (buttonX[8]-buttonX[7])*2/pixw,
       buttonCoverHeight,
       3/pixw);
  if(millis() - clickT[2] < 400){
    noStroke();
    fill(255);
    rect(windowWidth/2+buttonX[lastId[2]+7]/pixw+(buttonX[lastId[2]+7]-buttonX[visibility+7])/pixw*(cos(2*PI/2*(millis() - clickT[2])/400)-1)/2-visibilityButtons[0].diam/2, 
       windowHeight/2+30/pixw-visibilityButtons[0].diam/2,
       visibilityButtons[0].diam, visibilityButtons[0].diam,
       3/pixw);
  }
  visibilityButtons[0].display();
  visibilityButtons[1].display();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(5/pixw);
  text("Visibility", windowWidth/2+(buttonX[7]+buttonX[8])/2/pixw, windowHeight/2+45/pixw);
  
}

function vdispButton(x, y, vdisp_id, name, diam){
  this.x = x;
  this.y = y;
  this.id = vdisp_id;
  this.name = name;
  this.diam = diam;
  
  
  this.display = function(){
    
    if(millis() - clickT[0] < 300){
      
      noFill();
      stroke(255/2);
      rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
    }
    else{
      if(this.id==vdisp){
        noStroke();
        fill(255);
        let dinamic_diam = this.diam+0.5/pixw*sin(2*PI*millis()/1000);
        rect(windowWidth/2+this.x-dinamic_diam/2, 
             windowHeight/2+30/pixw-dinamic_diam/2,
             dinamic_diam,
             dinamic_diam,
             3/pixw);
      }else{
        noFill();
        stroke(255/2);
        rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
      }
    }
    
    noStroke();
    if(this.id==vdisp){
      fill(0);
    }else{
      fill(150);
    }
    textAlign(CENTER, CENTER);
    textLeading(3/pixw);
    textSize(3/pixw);
    text(this.name, 
         windowWidth/2+this.x, 
         windowHeight/2+30/pixw)
    
  }
  
  this.click = function(){
    var d = dist(mouseX, mouseY, 
                 windowWidth/2+this.x, windowHeight/2+30/pixw);
    if(d < this.diam/2){
      lastId[0] = vdisp;
      vdisp = this.id; 
      clickT[0] = millis();
      draw_reset();
    }
  }
}

function patternButton(x, y, vdisp_id, name, diam){
  this.x = x;
  this.y = y;
  this.id = vdisp_id;
  this.name = name;
  this.diam = diam;
  
  
  this.display = function(){

    if(millis() - clickT[1] < 300){
      
      noFill();
      stroke(255/2);
      rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
    }
    else{
      if(this.id==pattern){
        noStroke();
        fill(255);
        let dinamic_diam = this.diam+0.5/pixw*sin(2*PI*millis()/1000);
        rect(windowWidth/2+this.x-dinamic_diam/2, 
             windowHeight/2+30/pixw-dinamic_diam/2,
             dinamic_diam,
             dinamic_diam,
             3/pixw);
      }else{
        noFill();
        stroke(255/2);
        rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
      }
    }
    
    noStroke();
    if(this.id==pattern){
      fill(0);
    }else{
      fill(150);
    }
    textAlign(CENTER, CENTER);
    textLeading(3/pixw);
    textSize(3/pixw);
    text(this.name, 
         windowWidth/2+this.x, 
         windowHeight/2+30/pixw)
    
  }
  
  this.click = function(){
    var d = dist(mouseX, mouseY, 
                 windowWidth/2+this.x, windowHeight/2+30/pixw);
    if(d < this.diam/2){
      lastId[1] = pattern;
      pattern = this.id; 
      clickT[1] = millis();
      draw_reset();
    }
  }
}

function visibilityButton(x, y, vdisp_id, name, diam){
  this.x = x;
  this.y = y;
  this.id = vdisp_id;
  this.name = name;
  this.diam = diam;
  
  
  this.display = function(){
    
    if(millis() - clickT[2] < 300){
      
      noFill();
      stroke(255/2);
      rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
    }
    else{
      if(this.id==visibility){
        noStroke();
        fill(255);
        let dinamic_diam = this.diam+0.5/pixw*sin(2*PI*millis()/1000);
        rect(windowWidth/2+this.x-dinamic_diam/2, 
             windowHeight/2+30/pixw-dinamic_diam/2,
             dinamic_diam,
             dinamic_diam,
             3/pixw);
      }else{
        noFill();
        stroke(255/2);
        rect(windowWidth/2+this.x-this.diam/2, 
           windowHeight/2+30/pixw-this.diam/2,
           this.diam, this.diam,
           3/pixw);
      }
    }
    
    noStroke();
    
    if(this.id==visibility){
      fill(0);
    }else{
      fill(150);
    }
    textAlign(CENTER, CENTER);
    textLeading(3/pixw);
    textSize(3/pixw);
    text(this.name, 
         windowWidth/2+this.x, 
         windowHeight/2+30/pixw)
    
  }
  
  this.click = function(){
    var d = dist(mouseX, mouseY, 
                 windowWidth/2+this.x, windowHeight/2+30/pixw);
    if(d < this.diam/2){
      lastId[2] = visibility;
      visibility = this.id; 
      clickT[2] = millis();
    }
  }
}