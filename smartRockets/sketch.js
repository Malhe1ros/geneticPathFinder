function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) ) + min;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

/////////////////////////////////////////////////////////
var population;
var death;
var lifespan = 200;
var increaseLifespan = 100;
var increaseEvery = 2;
var elitism = true;
var popSize=500;
var mutationProb=0.001;
var thresh=5;
var posId=0;
var circleX = 200
var circleY = 50;
var fitness = [];
var threshZero=0.01;
function createRandomPop(){
  population=new Population();
  for(var i=0;i<popSize;i++){
    population.add(new Rocket());
  }
  
}

function f(d){
  if(d<1)return 1e12;
  return 1e12/(d*d*d*d);
}
function gamb(vx,maxx){
  if(vx<0) vx=0;
  if(vx>maxx)vx=maxx;
  return vx;
}

function cost(roc){
  if(roc.hasStopped)return 0;
  return 1;
}
function fitnessFunction(roc){
 
  let v=roc.pos;
  let x1=v.x;
  let y1=v.y;
  let fx1=Math.floor(x1);
  let fy1=Math.floor(y1);
  
  var d;
  if(!pode(fx1,fy1)){
    fx1 = gamb(fx1,W-1);
    fy1 = gamb(fy1,H-1);
  }
    d=wave[fx1][fy1];
    //print(fx1,fy1,d,f(d));
  
  return f(d)*cost(roc);

}

function lowerBound(x) {
  let l=0;
  let r=popSize;
  let melhor=0;
  while(l<r){
    let mid=Math.floor((l+r)/2);
    if(fitness[mid]>=x){
      melhor=mid;
      r=mid;
    }
    else{
      l=mid+1;
    }
  }
  
  return melhor;
}

function selectRandom(){
  let teste=getRandomFloat(0,fitness[popSize-1]);
  let ret=lowerBound(teste);
  return ret;
}
function mergeDNA(r1,r2){
  let r = createVector();
  r.x=(r1.x+r2.x);
  r.y=(r1.y+r2.y);
  return r;
}

function unZero(a){
  if(a.mag()<threshZero)return p5.Vector.random2D();
  return a;
}

function addVector(a,b){
  return createVector(a.x+b.x,a.y+b.y);
}

function mutate(){
  if(getRandomFloat(0,1)<mutationProb)return 1;
  return 0;
}
var nIteration=0;
var whichCross = 0;
function crossover(r1,r2){
  let r = new Rocket();
  let mid=lifespan/2;
  
  if(whichCross==0){
    for(var i=0;i<lifespan;i++){
      if(mutate()) r.dna.info[i] = p5.Vector.random2D();
      else if (i<mid) r.dna.info[i]=unZero(r1.dna.info[i]);
      else r.dna.info[i]=unZero(r2.dna.info[i]);
      r.dna.info[i].setMag(0.1);
    }
  }
  else{//crossover other version;
    for(var i=0;i<lifespan;i++){
      if(mutate()) r.dna.info[i] = p5.Vector.random2D();
      else r.dna.info[i]=addVector(unZero(r1.dna.info[i]),unZero(r2.dna.info[i]));
      r.dna.info[i].setMag(0.1);
    }
    
  }
  return r;

}
var bestRocket;
var toprintX=-1;
var toPrintY=-1;
var toPrintR=-1;
var minAns=0;
function printCircle(){
  circle(toPrintX,toPrintY,toPrintR);
}
function restart(){
  newPopulation = new Population();
  fitness=[];
  for(var i=0;i<popSize;i++){
    fitness.push(fitnessFunction(population.rockets[i]));
  }
  let menor = 0;
  let melhor=0;
  for(var i=0;i<popSize;i++){

    if(fitness[i]>menor){
      melhor=i;
      menor=fitness[i];
    }
  }
  minAns=menor;
  
  toPrintX=population.rockets[melhor].pos.x;
  toPrintY=population.rockets[melhor].pos.y;
  toPrintR=10;

  
  for(var i=1;i<popSize;i++){
    fitness[i]+=fitness[i-1];
  }
  if(elitism){
    let theBest = new Rocket();
    theBest.dna = population.rockets[melhor].dna; 

    newPopulation.add(theBest);
  }
  while(newPopulation.rockets.length<popSize){
    r1=selectRandom();
    r2=selectRandom();
    newPopulation.add(crossover(population.rockets[r1],population.rockets[r2]));
  }
  population=newPopulation;
  if(nIteration%increaseEvery==0){
    print("AUMENTANDOOOOO");
    population.increase();
  }
  fill(255,255,255);

}
var b1;
var W=400;
var H=400;
var wave;
const INFINITO=1e9;
function createDoubleStackQueue() {
  var that = {};
  var pushContainer = [];
  var popContainer = [];
  
  function moveElementToPopContainer() {
      while (pushContainer.length !==0 ) {
          var element = pushContainer.pop();
          popContainer.push(element);
      }
  }
  
  that.push = function(element) {
      pushContainer.push(element);
  };
  
  that.shift = function() {
      if (popContainer.length === 0) {
          moveElementToPopContainer();
      }
      if (popContainer.length === 0) {
          return null;
      } else {
          return popContainer.pop();
      }
  };
  
  that.front = function() {
      if (popContainer.length === 0) {
          moveElementToPopContainer();
      }
      if (popContainer.length === 0) {
          return null;
      }
      return popContainer[popContainer.length - 1];
  };
  
  that.length = function() {
      return pushContainer.length + popContainer.length;
  };
  
  that.isEmpty = function() {
      return (pushContainer.length + popContainer.length) === 0;
  };
  
  return that;
}

function pode(x,y){
  if(x<0 || x>=W || y<0 || y>=H)return false;
  return true;
}
  
function wavefront(){
  wave=[]
  for(var i=0;i<W;i++){
   wave.push([]);
    for(var j=0;j<H;j++){
      wave[i].push(INFINITO);
    }
  }

  wave[circleX][circleY]=1;

  var queue = createDoubleStackQueue();
  queue.push([circleX,circleY]);

  X=[-1,0,1];
  while(!queue.isEmpty()){
    var ans=queue.front();
    let xl=ans[0];
    let yl=ans[1];
    queue.shift();
    for(let dx of X){
      for(let dy of X){
        if(pode(xl+dx,yl+dy) && (wave[xl+dx][yl+dy]>(1+wave[xl][yl]))&& (!intersects(createVector(xl+dx,yl+dy)))){
          wave[xl+dx][yl+dy]=1+wave[xl][yl];
          queue.push([xl+dx,yl+dy]);
        }
      }
    }
  }

  
}

var flag=0;
function torun(){
  flag=1;
  popSize = parseInt(document.getElementById("popSiz").value);
  lifespan = parseInt(document.getElementById("lifesp").value);
  mutationProb = parseInt(document.getElementById("mutationpro").value);
  
}
function setup() {

  createCanvas(W,H);

  createRandomPop();
  death = new deathZone();
  death.add(250,200,300,300);
  death.add(150,140,200,250);
  death.add(-20,100,300,150);
  death.add(100,290,410,350);
  
  //death add()
  wavefront();


}



var runOnly=false;


function draw() {
 
  document.getElementById("tempo").innerHTML = "Tempo"+" = "+posId;
  document.getElementById("geracao").innerHTML = "Geração"+" = "+nIteration;
  document.getElementById("melhor").innerHTML = "Melhor"+" = "+minAns;

  background(0);
  //population.html(posId);
  if((toPrintR!=-1) && !runOnly){
    push();
      fill(0,0,255);
      printCircle();
    pop();
  }
  push();
    fill(0,256,50);
    circle(circleX,circleY,20);
  pop();
  push();
    fill(123,92,0);
    death.draw();
  pop();
  if(flag==0)return;
  
  if(runOnly){
    bestRocket.update();
    bestRocket.show();
    posId++;
  }
  else population.update();
  if(posId==lifespan){
    

    for(var i=0;i<popSize;i++){
      if(population.rockets[i].hasReached==true){
        bestRocket= population.rockets[i];
        bestRocket.hasReached=false;
        bestRocket.pos=createVector(width/2,height);
        bestRocket.vel=createVector();
        bestRocket.acc=createVector();
        runOnly=true;
        
        break;
      }
    }
    
   
    if(!runOnly) {
      nIteration++;
      restart();
    }
    
    
    posId=0;
  }
  
}

/////////////////////////////////////////////////////////////

class Population{
  constructor(){
    this.rockets = [];
    
  }
  add(cross){
    this.rockets.push(cross);
  }
  update(){
    for(var i=0;i<popSize;i++){
      this.rockets[i].update();
      this.rockets[i].show();
    }
    posId++;
  }
  increase(){
    var ini=0;
    if(elitism){
      ini=1;
      for(var j=0;j<increaseLifespan;j++){
        var toad=createVector(0,0);
        this.rockets[0].dna.info.push(toad);
      }
      //print(this.rockets[0]);
    }
    for(var i=ini;i<popSize;i++){
      for(var j=0;j<increaseLifespan;j++){
        var toad=p5.Vector.random2D();
        toad.setMag(0.1);
        this.rockets[i].dna.info.push(toad);
      }
    }
    lifespan+=increaseLifespan;
  }
}

class DNA{
  constructor(){
    this.info = [];
    for(var i=0;i<lifespan;i++){
      this.info[i]=p5.Vector.random2D();
      this.info[i].setMag(0.1);
    }
  }
}

class Barrier{
  constructor(x1,y1,x2,y2){
    this.x1=x1;
    this.y1=y1;
    this.x2=x2;
    this.y2=y2;
  }
  draw(){
    push();
    translate(this.x1,this.y1);
    rect(0,0,Math.abs(this.x2-this.x1),Math.abs(this.y2-this.y1));
    pop();
  }
}
class deathZone{
  barries=[];
  constructor(){

  }
  add(x1,y1,x2,y2){
    this.barries.push(new Barrier(x1,y1,x2,y2));
  }
  draw(){
    for(let x of this.barries){
      x.draw();
    }
  }
}

let eps=10;
function intersects(p){
  if(p.x<(0-eps) || p.x>(W+eps) || p.y<(0-eps) || p.y>(H+eps))return true;
  for(let b of death.barries){
    //print(b);
    if(interWithBarrier(b,p)){
      return true;
    }
  }
  return false;
}

function interWithBarrier(b,p){
  if((p.x >= b.x1) && (p.x<=b.x2) && (p.y>=b.y1) && (p.y<=b.y2))return true;
  return false;
}

class Rocket{
  constructor(){
    this.dna =new DNA();
    this.hasReached=false;
    this.pos=createVector(width/2,height);
    this.vel=createVector();
    this.acc=createVector();
    this.hasStopped=false;
  }
  applyForce(force){

    if(force.mag()<threshZero){
      this.acc=createVector();
      this.vel=createVector();
    }
    else
     this.acc.add(force);
  } 
  update(){
    
    if((this.hasReached==false) && (this.hasStopped==false)){
      this.applyForce(this.dna.info[posId]);
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.acc.mult(0);
      if(intersects(this.pos))this.hasStopped=true;
      else if(this.pos.dist(createVector(circleX,circleY))<thresh)this.hasReached=true;
    }
  }

  show(){
    push();
    noStroke();
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0,0,25,5)
    pop();
  }
}
