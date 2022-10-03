const getData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const temp = await fetch(url);
  const data = await temp.json();

  const arrivalDataUrl =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const arrivalTemp = await fetch(arrivalDataUrl);
  const arrivalJson = await arrivalTemp.json();
  const arrivalIndexes = arrivalJson.dataset.dimension.Tuloalue.category.index;
  const arrivalValues = arrivalJson.dataset.value;

  const departureDataUrl =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const departureTemp = await fetch(departureDataUrl);
  const departureJson = await departureTemp.json();
  const departureIndexes =
    departureJson.dataset.dimension.Lähtöalue.category.index;
  const departureValues = departureJson.dataset.value;

  let map = L.map("map", {
    minZoom: -3
  });

  let background = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "© OpenStreetMap"
    }
  ).addTo(map);

  const getFeature = (feature, layer) => {
    layer.bindTooltip(feature.properties.name);
    var arrivals =
      arrivalValues[arrivalIndexes["KU" + feature.properties.kunta]];
    var departures =
      departureValues[departureIndexes["KU" + feature.properties.kunta]];
    layer.bindPopup(
      `<p>Arrivals: ${arrivals}</p>
          <p>Departures: ${departures}</p>`
    );
  };
  const getHue = (feature) => {
    var hue =
      (arrivalValues[arrivalIndexes["KU" + feature.properties.kunta]] /
        departureValues[departureIndexes["KU" + feature.properties.kunta]]) **
        3 *
      60;
    if (hue > 120) {
      hue = 120;
    }
    return hue;
  };

  const getStyle = (feature) => {
    return {
      weight: 2,
      color: `hsl(${getHue(feature)}, 75%, 50%)`
    };
  };
  let geoJson = L.geoJSON(data, {
    onEachFeature: getFeature,
    style: getStyle
  }).addTo(map);
  map.fitBounds(geoJson.getBounds());
};

getData();
