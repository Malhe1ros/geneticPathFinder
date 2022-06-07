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
var lifespan = 200;
var popSize=200;
var mutationProb=0.01;
var thresh=5;
var posId=0;
var circleX = 200
var circleY = 50;
var fitness = []
function createRandomPop(){
  population=new Population();
  for(var i=0;i<popSize;i++){
    population.add(new Rocket());
  }
  
}

function f(d){
  if(d<1)return 1e9;
  return 1e9/(d*d*d);
}

function fitnessFunction(v){
 
  let x1=v.x;
  let y1=v.y;
  let d = Math.sqrt((x1-circleX)*(x1-circleX)+(y1-circleY)*(y1-circleY));
  return f(d);
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

function mutate(){
  if(getRandomFloat(0,1)<mutationProb)return 1;
  return 0;
}

function crossover(r1,r2){
  let r = new Rocket();
  let mid=lifespan/2;
  for(var i=0;i<lifespan;i++){
    if(mutate()) r.dna.info[i] = p5.Vector.random2D();
    else if(i<mid) r.dna.info[i]=r1.dna.info[i];
    else r.dna.info[i]=r2.dna.info[i];
    r.dna.info[i].setMag(0.1);
  }
  return r;

}
var bestRocket;
function restart(){
  newPopulation = new Population();
  fitness=[];
  for(var i=0;i<popSize;i++){
    fitness.push(fitnessFunction(population.rockets[i].pos));
  }
  let menor = 0;
  let melhor=0;
  for(var i=0;i<popSize;i++){

    if(fitness[i]>menor){
      melhor=i;
      menor=fitness[i];
    }
  }
  fill(0,0,255);
  for(var i=0;i<population.rockets.length;i++){
    
    if(i==melhor){
      circle(population.rockets[i].pos.x,population.rockets[i].pos.y,20);
    }
  }
  for(var i=1;i<popSize;i++){
    fitness[i]+=fitness[i-1];
  }
  //print(fitness);
    
  while(newPopulation.rockets.length<popSize){
    r1=selectRandom();
    r2=selectRandom();
    newPopulation.add(crossover(population.rockets[r1],population.rockets[r2]));
  }
  population=newPopulation;
  fill(255,255,255);

}

function setup() {
  createCanvas(400, 400);
  createRandomPop();
  
}


var runOnly=false;
function draw() {
  background(0);
  push();
  fill(0,256,50);
  circle(circleX,circleY,20);
  
  pop();
  if(runOnly){
    bestRocket.update();
    bestRocket.show();
    posId++;
  }
  else population.update();
  if(posId==lifespan){
    if(runOnly){
      noLoop();
    }
    
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
    
   
    if(!runOnly)restart();
    
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

class Rocket{
  constructor(){
    this.dna =new DNA();
    this.hasReached=false;
    this.pos=createVector(width/2,height);
    this.vel=createVector();
    this.acc=createVector();
  }
  applyForce(force){
    this.acc.add(force);
  } 
  update(){
    if(this.hasReached==false){
      this.applyForce(this.dna.info[posId]);
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.acc.mult(0);
      if(this.pos.dist(createVector(circleX,circleY))<thresh)this.hasReached=true;
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