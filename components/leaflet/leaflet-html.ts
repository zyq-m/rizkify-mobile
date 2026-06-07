export function buildLeafletHtml(lat: number = 0, lng: number = 0, zoom: number = 2): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .leaflet-container { background: #f0f0f0; }
    .custom-marker {
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 50%;
      border: 2px solid white; background: #22c55e;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
    }
    .custom-marker svg { width: 18px; height: 18px; }
    .locate-marker {
      width: 16px; height: 16px; border-radius: 50%;
      background: #3b82f6; border: 3px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    });
    map.setView([${lat}, ${lng}], ${zoom});
    var currentMarker = null;
    var currentCircle = null;
    var userLocationMarker = null;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    function sendMessage(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    map.on('click', function(e) {
      sendMessage({ type: 'MAP_CLICK', data: { latitude: e.latlng.lat, longitude: e.latlng.lng } });
    });

    map.whenReady(function() {
      sendMessage({ type: 'MAP_READY' });
    });

    window.bridge = {
      setMarker: function(data) {
        if (currentMarker) { map.removeLayer(currentMarker); currentMarker = null; }
        if (!data) return;
        var icon = data.html
          ? L.divIcon({ html: data.html, className: '', iconSize: [40, 40], iconAnchor: [20, 20] })
          : L.divIcon({ html: '<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
        currentMarker = L.marker([data.latitude, data.longitude], { icon: icon }).addTo(map);
      },
      clearMarkers: function() {
        if (currentMarker) { map.removeLayer(currentMarker); currentMarker = null; }
      },
      setCircle: function(data) {
        if (currentCircle) { map.removeLayer(currentCircle); currentCircle = null; }
        if (!data) return;
        currentCircle = L.circle([data.latitude, data.longitude], {
          radius: data.radius,
          fillColor: data.fillColor || 'rgba(34, 197, 94, 0.2)',
          fillOpacity: 1,
          color: data.strokeColor || 'rgba(34, 197, 94, 0.7)',
          weight: data.strokeWidth || 2,
        }).addTo(map);
      },
      clearCircle: function() {
        if (currentCircle) { map.removeLayer(currentCircle); currentCircle = null; }
      },
      setCenter: function(data) {
        var zoom = data.zoom !== undefined ? data.zoom : map.getZoom();
        map.flyTo([data.latitude, data.longitude], zoom, { duration: 1 });
      },
      setUserLocation: function(data) {
        if (userLocationMarker) { map.removeLayer(userLocationMarker); }
        if (data) {
          userLocationMarker = L.marker([data.latitude, data.longitude], {
            icon: L.divIcon({ html: '<div class="locate-marker"></div>', className: '', iconSize: [16, 16], iconAnchor: [8, 8] }),
            zIndexOffset: 1000,
          }).addTo(map);
        }
      },
      setInteractive: function(data) {
        if (data && data.enabled === false) {
          map.dragging.disable();
          map.touchZoom.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
          if (map.tap) map.tap.disable();
        } else {
          map.dragging.enable();
          map.touchZoom.enable();
          map.doubleClickZoom.enable();
          map.scrollWheelZoom.enable();
          map.boxZoom.enable();
          map.keyboard.enable();
          if (map.tap) map.tap.enable();
        }
      },
    };
  </script>
</body>
</html>`;
}
