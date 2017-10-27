function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.86, lng: 11.24},
    zoom: 7
  });

  map.data.loadGeoJson('./json/passes.json');

  const infowindow = new google.maps.InfoWindow();

  map.data.addListener('click', ev => {
    const f = ev.feature;
    const name = f.getProperty('name');
    const elevation = f.getProperty('elevation');
    const slope = f.getProperty('slope');

    infowindow.setContent(`<strong>${name}</strong><br/>${elevation}<br/>${slope}`);
    infowindow.setPosition(f.getGeometry().get());
    infowindow.setOptions({
      pixelOffset: new google.maps.Size(0, -30)
    });
    infowindow.open(map);
  });
}