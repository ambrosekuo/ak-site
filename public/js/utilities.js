function makeModulesDroppable() {
  let modules;
  modules = document.getElementsByClassName("modules");
  for (let i = 0; i < modules.length; i++) {
    console.log(modules[i]);
    modules[i].droppable = true;
    modules[i].ondrop = drop;
  }
}

function moveModules() {
  console.log("zzz");
  document.getElementById("edit-button").style.border = "1px black solid";
  document.getElementById("edit-button").style.background = "gold";
  let modules;
  modules = document.getElementsByClassName("modules");
  for (let i = 0; i < modules.length; i++) {
    makeDraggable(modules[i]);
  }
}

// Passsed in div element and make it droppable
function makeDraggable(div) {
  div.draggable = true;
}

function ignoreDrag(e) {
  e.stopPropagation();
  e.preventDefault();
}

document.addEventListener("dragstart", (e) => {
  console.log(e.target.id);
  e.dataTransfer.setData("text/plain", e.target.id);
}, false);

document.addEventListener("dragenter", (e) => {
  e.preventDefault();
  // highlight potential drop target when the draggable element enters it
  if (e.target.className == "modules") {
    //e.target.style.background = "green";
  }
}, false);

document.addEventListener("dragleave" , (e) => {
  e.preventDefault();
  if (e.target.className == "modules") {
 //   e.target.style.background = "black";
  }
}, false);

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
}, false);

function drop(e) {
  console.log("Success");
  e.preventDefault();
  let dragID = e.dataTransfer.getData("text/plain");
  let tempOrder = window.getComputedStyle(e.target).order;
  console.log(document.getElementById(dragID));
  e.target.style.order = window.getComputedStyle(document.getElementById(dragID)).order;
  document.getElementById(dragID).style.order = tempOrder;
}

window.addEventListener("load", function(){
  makeModulesDroppable();
 });
