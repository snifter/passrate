function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: point.lat, lng: point.lon },
    zoom: 10
  });

  map.data.loadGeoJson('./json/passes.json');
}