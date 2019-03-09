var id = "ab88a8cf8a7ecf69f065faea6df65dd3"; //Should change this to .env /private variable

var iconMap = {};

//Saves current weather object and forecast object
var allWeatherData = {
  current: "",
  forecast: "",
  loadedIn: { current: false, forecast: false }
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const monthsOfYear = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

//type is either Thunderstorm, Drizzle, Rain, Snow, Atmosphere, Clear, Clouds
// From https://openweathermap.org/weather-conditions
function setWindowImage() {
  //use is looking for "weather" ,
    "Images/Weather/Window/Thunderstorm.jpg";
  document.getElementById("WeatherAnimation").src = `Images/Weather/Window/${allWeatherData["current"]["weather"][0]["main"]}.jpg`;
}

function tryAgainMessage(location) {
  document.getElementById("TryAgainMessage").innerHTML =
    '"' +
    location +
    '" ' +
    "was not a valid entry. Please enter a valid location name!";
}

async function getForecast() {
  return new Promise((resolve, reject) => {
  allWeatherData["loadedIn"]["forecast"] = false;
  let apiReq, jsonText, weatherData;
  var location = document.getElementById("Location").value;
  let url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${id}`;
  apiReq = new XMLHttpRequest();
  apiReq.open("GET", url, true); //assumed to be asynchronous
  apiReq.onreadystatechange = () => {
    if (apiReq.readyState === 4) {
      //Send is called
      if (apiReq.status === 200) {
        //HTTP status code meaning all is good
        jsonText = apiReq.responseText;
        weatherData = JSON.parse(jsonText);
        allWeatherData["forecast"] = weatherData;
        allWeatherData["loadedIn"]["forecast"] = true;
        resolve();
      } else {
        tryAgainMessage(location);
        reject(status);
      }
    }
  };
  apiReq.send();
});
}

async function getCurrentWeather() {
  return new Promise( (resolve,reject) => {
  allWeatherData["loadedIn"]["current"] = false;
  let apiReq, jsonText, weatherData;
  var location = document.getElementById("Location").value;
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${id}`;
  apiReq = new XMLHttpRequest();
  apiReq.open("GET", url, true); //assumed to be asynchronous
  apiReq.onreadystatechange = () => {
    if (apiReq.readyState === 4) {
      //Send is called
      if (apiReq.status === 200) {
        //HTTP status code meaning all is good
        jsonText = apiReq.responseText;
        weatherData = JSON.parse(jsonText);
        allWeatherData["current"] = weatherData;
        allWeatherData["loadedIn"]["current"] = true;
        resolve();
      } else {
        tryAgainMessage(location);
        reject(status);
      }
    }
  };
  apiReq.send();
});
}

async function setWeatherData() {
  await Promise.all([getCurrentWeather(), getForecast()]).then(loadWeatherData);
}

const FORECASTDAYS = 6; //Counting current day currently
const midDay = [11, 12, 13]; //Mid day values used to determine forecast condition
//Returns an array of length 5 with lists insid
//Checks for main weather condition at 3pm
function parseForForecast() {
  weatherData = allWeatherData["forecast"]["list"];
  let arr = [
    { date: "", maxTemp: "", minTemp: "", condition: "" },
    { date: "", maxTemp: "", minTemp: "", condition: "" },
    { date: "", maxTemp: "", minTemp: "", condition: "" },
    { date: "", maxTemp: "", minTemp: "", condition: "" },
    { date: "", maxTemp: "", minTemp: "", condition: "" }
  ];
  let daySplice = 24 / 3; //24 hours on a day, list is given in 3 hour incrementals
  let date;
  //intiial prevDate value
  let weatherListIndex = 0; //weather list index
  let arrIndex = 0;
  let currentTemp;
  let today = new Date(allWeatherData["current"]["dt"] * 1000);
  let prevDate;
  //Starts the weatherData list position at the day after today.
  date = new Date(weatherData[weatherListIndex]["dt"] * 1000);
  while (date.getDay() == today.getDay()) {
    weatherListIndex++;
    date = new Date(weatherData[weatherListIndex]["dt"] * 1000);
  }

  prevDate= date;
  currentTemp = weatherData[weatherListIndex]["main"]["temp"];
  arr[arrIndex].date =  prevDate ;
  arr[arrIndex].maxTemp = currentTemp;
  arr[arrIndex].minTemp = currentTemp;

  while (weatherListIndex < weatherData.length) {
    date = new Date(weatherData[weatherListIndex]["dt"] * 1000);
    currentTemp = weatherData[weatherListIndex]["main"]["temp"];
    if (date.getDate() != prevDate.getDate()) {
      arrIndex++;
      arr[arrIndex].date =  date;
      arr[arrIndex].maxTemp = currentTemp;
      arr[arrIndex].minTemp = currentTemp;
    }
    if (date.getHours() in midDay) {
      arr[arrIndex].condition =
        weatherData[weatherListIndex]["weather"][0]["main"];
    }

    if (currentTemp > arr[arrIndex].maxTemp) {
      arr[arrIndex].maxTemp = currentTemp;
    }

    if (currentTemp < arr[arrIndex].minTemp) {
      arr[arrIndex].minTemp = currentTemp;
    }
    prevDate = new Date(weatherData[weatherListIndex]["dt"] * 1000);
    weatherListIndex++;
  }

  return arr;
}

function datePrint(currentTime) {
  let minutes = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });

  return (
    daysOfWeek[currentTime.getDay()] +
    ", " +
    monthsOfYear[currentTime.getMonth()] +
    " " +
    currentTime.getDate() +
    ", " +
    minutes
  );
}

function setHourly() {
  let currentTime = new Date();
  const tempTimes = 8; //want 8 different times
  let hourArray = next24Hours(currentTime);
  for (i = 0; i < tempTimes; i++) {
    document.getElementById(`Temperature${i + 1}`).innerHTML =
      hourArray[i] +
      ":  " +
      roundString(allWeatherData["forecast"]["list"][i]["main"]["temp"]);
    currentTime.setHours(currentTime.set);
  }
}

function drawCurrentData() {
  document.getElementById("TempertureResult").innerHTML =
  roundString(allWeatherData["current"]["main"]["temp"]);
  document.getElementById("TryAgainMessage").innerHTML = "";
  setWindowImage();
  document.getElementById(
    "CurrentLocation"
  ).innerHTML = document.getElementById("Location").value.toUpperCase();
}

//condition is either Thunderstorm, Drizzle, Rain, Snow, Atmosphere, Clear, Clouds
function setWeatherIcon(forecast5Days) {
  let i = 0;
  while (i < forecast5Days.length) {
    let date = new Date(forecast5Days[i]["date"]);
    document.getElementById(
      `day${i + 1}`
    ).style.backgroundImage = `url("Images/Weather/forecastIcons/${
      forecast5Days[i]["condition"]
    }.png")`;
    document.getElementById(`date${i + 1}`).innerHTML =
      daysOfWeek[date.getDay()].substring(0,3); 
    document.getElementById(`minTemp${i + 1}`).innerHTML =
    roundString(forecast5Days[i]["minTemp"]);
    document.getElementById(`maxTemp${i + 1}`).innerHTML =
    roundString(forecast5Days[i]["maxTemp"]);
    i++;
  }
}

function setNext24Hours() {
  for (let i = 0; i < 8; i++) {
    let date = new Date(allWeatherData["forecast"]["list"][i]["dt"] * 1000);
    let time = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
    document.getElementById(`Temperature${i + 1}`).innerHTML =
      time + ": " + roundString(allWeatherData["forecast"]["list"][i]["main"]["temp"]);
  }
}

//takes string number, rounds it, and returns as string
function roundString(numbString) {
  return Math.round(parseInt(numbString)).toString();
}

//Main function that calls the weather subfunctions to load their data
// has to wait for weatherData to be set.
function loadWeatherData() {
  let forecast5Days = parseForForecast(); //an arry of forecasts
  drawCurrentData();
  setWeatherIcon(forecast5Days);
  setNext24Hours();
  setWindowImage();
}

document.addEventListener("DOMContentLoaded", function(event) {
  let currentTime = new Date();
  document.getElementById("Location").value = "Toronto";
  document.getElementById("CurrentTime").innerHTML = datePrint(currentTime);
  setWeatherData();
});
