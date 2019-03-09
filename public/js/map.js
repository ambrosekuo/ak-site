const defaultLat = 43.6577209;
const defaultLng = -79.38116649999999;


// Todo: put token .env file and add as constiable to Heroku after submitting assignment
const mapboxToken = 'pk.eyJ1IjoiYW1icm9zZWsiLCJhIjoiY2pzZ2tzM2g0MWN3eTQ0dGxpbnEwbTN0MyJ9.G-6gXVcJOFNLbZksnDgTEw';
const mymap = L.map('mapid').setView([defaultLat, defaultLng], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: mapboxToken,
}).addTo(mymap);

/*  const polygon = L.polygon([[51.509, -0.08], [51.503, -0.06], [51.51, -0.047]]).addTo(mymap);

const marker = L.marker([43.6577, -79.3788]).addTo(mymap); */

let distance = '';
const startIcon = L.icon({
  iconUrl: 'Images/startLocation.png',

  iconSize: [20, 50], // size of the icon
  iconAnchor: [12, 45], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

let startMarker = L.marker( [defaultLat, defaultLng], {
  icon: startIcon,
}).addTo(mymap);

let destinationMarker = L.marker([defaultLat, defaultLng]).addTo(mymap);
let distanceLine = L.polygon([[51.505, -0.09], [51.505, -0.09]]).addTo(mymap);

// Given an object with lon, lat properties convert to name;
async function coordToName(latLng) {
  return new Promise((resolve, reject) => {
    let data;
    let jsonText;
    const xmlhttp = new XMLHttpRequest();
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latLng.lat}&lon=${
      latLng.lng
    }`;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4) {
        // Send is called
        if (xmlhttp.status === 200) {
          // HTTP status code meaning all is good
          jsonText = xmlhttp.responseText;
          data = JSON.parse(jsonText);
          // return data['display_name'];
          resolve(data.display_name);
        } else {
          console.log('did not work :(');
          reject(xmlhttp.status);
        }
      }
    };
    xmlhttp.open('GET', url, true); // assumed to be asychronous
    xmlhttp.send();
  });
}

async function nameToCoord(address) {
  return new Promise((resolve, reject) => {
    let data;
    let jsonText;
    const xmlhttp = new XMLHttpRequest();
    // Removs leading/ending white space and converts string to url format.
    const urlAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search/${urlAddress}?format=json&addressdetails=1&limit=1&polygon_svg=1`;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4) {
        // Send is called
        if (xmlhttp.status === 200) {
          // HTTP status code meaning all is good
          jsonText = xmlhttp.responseText;
          data = JSON.parse(jsonText);
          if (data[0]) {
            resolve({ lat: data[0].lat, lng: data[0].lon, display_name: data[0].display_name });
          } else {
            reject(new Error('failed'));
          }
        } else {
          reject(xmlhttp.status);
        }
      }
    };
    xmlhttp.open('GET', url, true); // assumed to be asychronous
    xmlhttp.send();
  });
}

function Location(lat, lng, address, osmTxt) {
  this.lat = lat || '';
  this.lng = lng || '';
  this.address = address || '';
  this.osmTxt = osmTxt || '';
}

// idName is the main name of the section. e.g. start,destination
function DivArea(idName) {
  this.baseid = idName;
  this.location = new Location();
  this.dropbox = document.getElementById(`input-${this.baseid}`);
  /*
  this.dropbox.ondragenter = this.ignoreDrag;
  this.dropbox.ondragover = this.ignoreDrag;
  this.dropbox.ondrop = this.drop.bind(this);
  */
  this.errorMessage = true;
}

DivArea.prototype.resetLocation = function resetLocation() {
  this.location = new Location();
};

// can't use arrow function due to difference in how they handle "this"
// loadData whenever a change occurs
DivArea.prototype.loadData = function loadData() {
  if (this.location.address && this.location.lat && this.location.lng) {
    this.errorMessage = false;
    this.handleErrorMessage();
    // document.getElementById(`${this.baseid}Location`).value = this.location.address;
    document.getElementById(`${this.baseid}-location`).innerHTML = this.location.address.slice(0, 60) + "...";
    document.getElementById(`${this.baseid}-latitude`).innerHTML = Math.round(this.location.lat*100)/100;
    document.getElementById(`${this.baseid}-longitude`).innerHTML = Math.round(this.location.lng*100)/100;
  }
};

DivArea.prototype.startPopUp = function startPopUp() {
  startMarker.bindPopup(this.location.address);
};

DivArea.prototype.swapLocation = function swapLocation(divArea2) {
  const temp = new Location();
  temp.lat = this.location.lat;
  temp.lng = this.location.lng;
  temp.address = this.location.address;
  temp.osmTxt = this.location.osmTxt;

  this.location.lat = divArea2.location.lat;
  this.location.lng = divArea2.location.lng;
  this.location.address = divArea2.location.address;
  this.location.osmTxt = divArea2.location.osmTxt;

  divArea2.location.lat = temp.lat;
  divArea2.location.lng = temp.lng;
  divArea2.location.address = temp.address;
  divArea2.location.osmTxt = temp.osmTxt;

  this.loadData();
  divArea2.loadData();

  //  Object.prototype.hasOwnProperty.call(divArea2, 'baseid') ? divArea2.baseid : 1;
};

DivArea.prototype.ignoreDrag = function ignoreDrag(e) {
  e.stopPropagation();
  e.preventDefault();
};

DivArea.prototype.drop = function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  const data = e.dataTransfer;
  const { files } = data;

  this.processFiles(files);
};

DivArea.prototype.processFiles = function processFiles(files) {
  const file = files[0];

  const reader = new FileReader();
  reader.onload = (e) => {
    const textData = e.target.result.split(',');
    this.location.lat = parseFloat(textData[0]);
    this.location.lng = parseFloat(textData[1]);
  };
  reader.readAsText(file);
};

DivArea.prototype.loadLocation = function loadLocation(location) {
  Object.assign(this.location, location);
};

// Fills remaining address if lon, lat exist or lon,lat if address exists
DivArea.prototype.fillRemaining = async function fillRemaining(divArea2) {
  const { location } = this;
  if (location.lat && location.lng && location.address === '') {
    await coordToName({ lat: location.lat, lng: location.lng }).then((value) => {
      location.address = value;
      this.loadData();
      this.mapView(divArea2);
    });
  } else if (location.lat === '' && location.lng === '' && location.address !== '') {
    await nameToCoord(location.address)
      .then((value) => {
        this.location.lat = parseFloat(value.lat);
        this.location.lng = parseFloat(value.lng);
        this.location.address = value.display_name;
        this.loadData();
        this.mapView(divArea2);
      })
      .catch(() => {
        this.errorMessage = true;
        this.handleErrorMessage();
      });
  }
};

DivArea.prototype.handleErrorMessage = function handleErrorMessage() {
  if (this.errorMessage) {
    document.getElementById(`${this.baseid}-error-message`).innerHTML = 'Invalid search, please try again';
  } else {
    document.getElementById(`${this.baseid}-error-message`).innerHTML = '';
  }
};

DivArea.prototype.mapView = function mapView(divArea2) {
  const divArea1 = this;
  let location1;
  let location2;
  if (divArea1.baseid === 'start' && divArea2.baseid === 'destination') {
    location1 = divArea1.location;
    location2 = divArea2.location;
  } else {
    location1 = divArea2.location;
    location2 = divArea1.location;
  }
  if (location2.lat !== '' && location2.lat !== '') {
    mymap.fitBounds([[location1.lat, location1.lng], [location2.lat, location2.lng]], { padding: [20, 20] });
    distanceLine.remove();
    distanceLine = L.polygon([[location1.lat, location1.lng], [location2.lat, location2.lng]], {
      color: 'blue',
      weight: '1',
    }).addTo(mymap);
  } else {
    mymap.setView(L.latLng(location1.lat, location1.lng, 13));
  }
  startMarker.remove();
  destinationMarker.remove();
  startMarker = L.marker([location1.lat, location1.lng], {
    icon: startIcon,
    draggable: true,
    autoPan: true,
  }).addTo(mymap);
  destinationMarker = L.marker([location2.lat, location2.lng], {
    draggable: true,
    autoPan: true,
  }).addTo(mymap);
  // coordToName(mymap.getCenter());
};

const box1 = new DivArea('start'); // box1 , initialized as start
box1.location.lat = defaultLat;
box1.location.lng = defaultLng;

const box2 = new DivArea('destination'); // box2 , initialized as destination
box2.location.lat = defaultLat;
box2.location.lng = defaultLng;

const currentLocation = new Location();
// const textData = '';
const divAreaList = [];
divAreaList.push(box1);
divAreaList.push(box2);

const errorMsg = document.getElementById('ErrorMessage');

function geolocationFailure(error) {
  errorMsg.innerHTML = `Geolocation failed: ${errorMsg.message}`;
}

function geolocationSucess(position) {
  currentLocation.lat = position.coords.latitude;
  currentLocation.lng = position.coords.longitude;
  const currentImg = document.getElementsByClassName('current-img');
  for (let i = 0; i < currentImg.length; i += 1) {
    currentImg[i].style.opacity = 1;
  }
}

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geolocationSucess, geolocationFailure);
  } else {
    // results.innerHTML = "This browser doesn't support geolocation.";
  }
};

// TODO: Modularize box1 to box2 to in general.
async function loadValues() {
  box1.fillRemaining(box2);
  box2.fillRemaining(box1);
}

const distanceWorker = new Worker('distanceWorker.js');

function findDistance(lat1, lng1, lat2, lng2) {
  document.getElementById('distance').innerHTML = '... calculting...';
  distanceWorker.postMessage([lat1, lng1, lat2, lng2]);
}

distanceWorker.onmessage = function (e) {
  distance = e.data;
};

// convert all ln, lat to address or vice versa
function updateMap() {
  loadValues();
  if (
    box1.location.lat !== ''
    && box1.location.lng !== ''
    && box2.location.lat !== ''
    && box2.location.lng !== ''
  ) {
    findDistance(box1.location.lat, box1.location.lng, box2.location.lat, box2.location.lng);
  }
  if (distance !== '') {
    document.getElementById('distance').innerHTML = `${distance.toFixed(2)} km`;
  }
}

function loadCurrent(baseid) {
  for (let i = 0; i < divAreaList.length; i += 1) {
    if (divAreaList[i].baseid === baseid) {
      divAreaList[i].loadLocation(currentLocation);
      divAreaList[i].loadData();
    }
  }
}

function startSearch(baseid) {
  for (let i = 0; i < divAreaList.length; i += 1) {
    if (divAreaList[i].baseid === baseid) {
      divAreaList[i].resetLocation();
      divAreaList[i].location.address = document.getElementById(`${baseid}Location`).value;
      break;
    }
  }
}

function swapInputs() {
  box1.swapLocation(box2);
  box1.mapView(box2);
}

// Assumes box1 is start, box2 is destination
function mapTrigger(e) {
  document.getElementById('map').style.border = '0.5vw solid red';
  destinationMarker.on('dragend', (event) => {
    box2.location.lat = event.target.getLatLng().lat;
    box2.location.lng = event.target.getLatLng().lng;
    box2.location.address = '';
    loadValues();
    box1.mapView(box2);
  });
  startMarker.on('dragend', (event) => {
    box1.location.lat = event.target.getLatLng().lat;
    box1.location.lng = event.target.getLatLng().lng;
    box1.location.address = '';
    loadValues();
    box1.mapView(box2);
  });
}

mymap.on('mousedown', mapTrigger);

// Shows that you have clicked outside of map
// if the event target is #menucontainer or has #menucontainer as a parent

document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
  if (!e.target.closest('#map')) {
    document.getElementById('map').style.border = '0.3vw solid black';
  }
});

// saves box to text
function saveToText() {}

// /_________________________________________

setInterval(updateMap, 1000);
