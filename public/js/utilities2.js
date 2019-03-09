function makeModulesDroppable() {
  let modules;
  modules = document.getElementsByClassName("modules");
  for (let i = 0; i < modules.length; i++) {
    console.log(modules[i]);
    modules[i].droppable = true;
  }
}

document.addEventListener(
  "dragstart",
  e => {
    e.dataTransfer.setData("text/plain", e.target.id);
  },
  false
);

document.addEventListener(
  "dragover",
  e => {
    if (e.dataTransfer.getData("text/plain")) {
      e.preventDefault();
    }
  },
  false
);

//drop event to allow the element to be dropped into valid targets
document.addEventListener(
  "drop",
  function(e) {
    //if this element is a drop target, move the item here
    //then prevent default to allow the action (same as dragover)
    if (e.target.getAttribute("data-draggable") == "target") {
      e.target.appendChild(item);
      e.preventDefault();
    }
  },
  false
);

//dragend event to clean-up after drop or abort
//which fires whether or not the drop target was valid
document.addEventListener(
  "dragend",
  function(e) {
    item = null;
  },
  false
);
