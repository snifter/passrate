function initMap() {
  const passPoint = { lat: point.lat, lng: point.lon };

  const map = new google.maps.Map(document.getElementById('map'), {
    center: passPoint,
    zoom: 12
  });

  var marker = new google.maps.Marker({
    position: passPoint,
    map: map
  });
}