// Given 2 sets of longitude and latitudes, finds the distance between the two locations.

const EARTH_RADIUS = 6371; // 6,371km

function toRadians(x) {
  return (x / 180) * Math.PI;
}

function findDistance(lat1, lng1, lat2, lng2) {
  lat1 = toRadians(lat1);
  lng1 = toRadians(lng1);
  lat2 = toRadians(lat2);
  lng2 = toRadians(lng2);
  deltaLat = lat2-lat1;
  deltaLng = lng2-lng1;
  const a = Math.sin(deltaLat / 2) ** 2;
  const b = Math.sin(deltaLng / 2) ** 2;
  const c = Math.cos(lat1) * Math.cos(lat2);
  const d = a + b * c;
  const distance = 2 * EARTH_RADIUS * Math.asin(Math.sqrt(d));
  return distance;
}

onmessage = function (e) {
  const workerResult = findDistance(e.data[0], e.data[1], e.data[2], e.data[3]);
  postMessage(workerResult);
};
