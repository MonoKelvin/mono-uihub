/* CDN-only geographic map. The SVG map remains available if a provider fails. */
window.createCityMap = function createCityMap(callbacks) {
  'use strict';
  const host = document.getElementById('geo-map');
  const stage = document.getElementById('map-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let map, tiles, spidey, ring, routeLine, resizeObserver, loadTimer;
  let enabled = true, successfulTiles = 0, failedTiles = 0, initializing = false;
  let rejectedTiles = false;
  const tileFingerprints = new Map();
  const tileSample = document.createElement('canvas');
  tileSample.width = tileSample.height = 32;
  const tilePixels = tileSample.getContext('2d', { willReadFrequently: true });
  let selectedRouteStop = 5;
  const groups = {};
  const layerStates = { route: true, sightings: true, incidents: true, heat: false };
  const api = { active: false, ready: false };
  const icon = (className, html, size, anchor = [size[0] / 2, size[1] / 2]) => L.divIcon({ className, html, iconSize: size, iconAnchor: anchor });
  const leftPadding = () => matchMedia('(max-width: 1100px), (max-height: 700px)').matches || document.querySelector('.map-expanded') ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--left-width'));
  const status = (mode, text) => callbacks.onStatus(mode, text);

  // Some providers return the same error notice as a successful HTTP 200 image.
  // Repeated textured tiles at different coordinates are not a usable basemap.
  function repeatedNotice(event) {
    if (!tilePixels) return false;
    try {
      tilePixels.clearRect(0, 0, 32, 32);
      tilePixels.drawImage(event.tile, 0, 0, 32, 32);
      const pixels = tilePixels.getImageData(0, 0, 32, 32).data;
      let hash = 2166136261, minimum = 255, maximum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        minimum = Math.min(minimum, pixels[i]); maximum = Math.max(maximum, pixels[i]);
        hash = Math.imul(hash ^ pixels[i], 16777619);
        hash = Math.imul(hash ^ pixels[i + 1], 16777619);
        hash = Math.imul(hash ^ pixels[i + 2], 16777619);
      }
      if (maximum - minimum < 16) return false; // Empty water tiles can match.
      const coordinates = tileFingerprints.get(hash) || new Set();
      coordinates.add(`${event.coords.z}/${event.coords.x}/${event.coords.y}`);
      tileFingerprints.set(hash, coordinates);
      return coordinates.size >= 3;
    } catch { return false; }
  }

  function asset(url, style) {
    return new Promise((resolve, reject) => {
      const element = document.createElement(style ? 'link' : 'script');
      const timeout = setTimeout(() => { element.remove(); reject(new Error('CDN timeout')); }, 9000);
      if (style) { element.rel = 'stylesheet'; element.href = url; }
      else { element.src = url; element.async = true; }
      element.onload = () => { clearTimeout(timeout); resolve(); };
      element.onerror = () => { clearTimeout(timeout); element.remove(); reject(new Error('CDN unavailable')); };
      document.head.append(element);
    });
  }

  function visible(value) {
    if (api.active === value) return;
    api.active = value;
    stage.classList.toggle('has-geo-map', value);
    host.inert = !value;
    document.getElementById('city-map').inert = value;
    if (value) map.invalidateSize({ animate: false, pan: false });
  }

  function updateZoom() {
    if (!api.active) return;
    document.getElementById('zoom-in').disabled = map.getZoom() >= 18;
    document.getElementById('zoom-out').disabled = map.getZoom() <= 10;
    document.getElementById('map-zoom-value').textContent = `Z${map.getZoom().toFixed(1)}`;
    const width = document.querySelector('.map-scale > span').getBoundingClientRect().width;
    const center = map.getSize().divideBy(2);
    const meters = map.distance(map.containerPointToLatLng(center), map.containerPointToLatLng(center.add([width, 0])));
    document.getElementById('map-scale-value').textContent = meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters / 10) * 10} m`;
    if (groups.landmarks) {
      if (map.getZoom() >= 14.25) groups.landmarks.addTo(map);
      else map.removeLayer(groups.landmarks);
    }
  }

  async function init() {
    if (api.ready || initializing) return;
    initializing = true;
    status('loading', '正在载入真实街区');
    try {
      await Promise.all([
        asset('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css', true),
        window.L ? Promise.resolve() : asset('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js', false)
      ]);
      map = L.map(host, { zoomControl: false, attributionControl: true, minZoom: 10, maxZoom: 18, zoomSnap: .25, zoomDelta: .5, wheelPxPerZoomLevel: 110, wheelDebounceTime: 55, scrollWheelZoom: true, dragging: true, touchZoom: true, doubleClickZoom: true, boxZoom: false, zoomAnimation: !reduced.matches, fadeAnimation: !reduced.matches, markerZoomAnimation: !reduced.matches, preferCanvas: false }).setView([40.7484, -73.9857], 15);
      map.attributionControl.setPrefix(false);
      ['route', 'incidents', 'sightings', 'heat', 'landmarks'].forEach(name => { groups[name] = L.layerGroup(); if (layerStates[name]) groups[name].addTo(map); });
      tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, maxNativeZoom: 16, keepBuffer: 2, updateWhenIdle: true, crossOrigin: 'anonymous', className: 'city-tiles', attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> · HERE, Garmin, <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> contributors' });
      tiles.on('loading', () => {
        successfulTiles = 0; failedTiles = 0;
        tileFingerprints.clear();
        if (enabled && !rejectedTiles) status('loading', '街区图块载入中');
        clearTimeout(loadTimer);
        loadTimer = setTimeout(() => {
          if (enabled && !successfulTiles) { visible(false); status('fallback', '网络较慢，已切换示意地图'); }
        }, 10000);
      });
      tiles.on('tileload', event => {
        if (rejectedTiles) { event.tile.style.visibility = 'hidden'; return; }
        if (repeatedNotice(event)) {
          rejectedTiles = true;
          clearTimeout(loadTimer);
          visible(false);
          if (enabled) status('fallback', '图源返回重复提示图，已启用示意地图');
          return;
        }
        successfulTiles++;
        if (enabled) { visible(true); status('online', 'Esri 真实街区已连接'); updateZoom(); }
      });
      tiles.on('tileerror', event => { failedTiles++; event.tile.style.visibility = 'hidden'; });
      tiles.on('load', () => {
        clearTimeout(loadTimer);
        if (!enabled || rejectedTiles) return;
        if (!successfulTiles && failedTiles) { visible(false); status('fallback', '图块不可用，使用示意地图'); }
        else if (failedTiles) status('partial', '部分街区暂未载入');
      });
      tiles.addTo(map);
      ring = L.circle([40.7484, -73.9857], { radius: 100, color: '#ec6577', weight: 1, opacity: .4, fillOpacity: .025, interactive: false }).addTo(map);
      spidey = L.marker([40.7484, -73.9857], { zIndexOffset: 2000, keyboard: true, title: '蜘蛛侠当前位置', icon: icon('spidey-map-marker', '<span class="spidey-pin"><span class="pin-orbit"></span><svg viewBox="0 0 48 52" aria-hidden="true"><path d="M24 3C7 3 3 16 6 30c3 12 12 19 18 20 6-1 15-8 18-20C45 16 41 3 24 3Z" fill="#d93951"/><path d="m10 17 11 11q-1 10-7 3-4-5-4-14Zm28 0L27 28q1 10 7 3 4-5 4-14Z" fill="#f5eee7" stroke="#142039" stroke-width="2"/></svg></span><span class="geo-target-label"><strong>蜘蛛侠</strong><small>帝国大厦 / 屋顶</small></span>', [42, 48], [21, 24]) }).addTo(map);
      spidey.on('click', () => callbacks.onTarget());
      const tower = '<svg viewBox="0 0 42 68" aria-hidden="true"><path d="m6 46 16 8 14-8v12l-14 8-16-8Z" fill="#3f5b7b" stroke="#8da9bd"/><path d="m13 45 1-25 8-5 8 5 1 25-9 7Z" fill="#7691a8" stroke="#aec1cf"/><path d="M22 15v37l9-7-1-25Z" fill="#3d5b7c"/><path d="M18 18V9l4-3 4 3v9M22 6V0" fill="#d7e2e8" stroke="#c6d6df"/></svg>';
      const flatiron = '<svg viewBox="0 0 42 68" aria-hidden="true"><path d="M4 32 30 20l8 13-25 12Z" fill="#c5c1b4" stroke="#8b9eaf"/><path d="M4 32v24l9 10V45Z" fill="#8591a0" stroke="#b8c5d0"/><path d="m13 45 25-12v23L13 66Z" fill="#4e6986" stroke="#a1b5c6"/><path d="m17 47 17-8m-17 14 17-8m-17 14 17-8" stroke="#bdc9d0" stroke-width="1.2"/></svg>';
      const worldTrade = '<svg viewBox="0 0 42 68" aria-hidden="true"><path d="m10 57 12 9 12-9-5-40H15Z" fill="#799eb8" stroke="#c3d6e0"/><path d="m22 66 12-9-5-40Z" fill="#375d80"/><path d="m10 57 19-40m-7 49-7-49m7 0V0" stroke="#d7e5ee"/><path d="M16 25h12m-13 8h14m-15 8h16" stroke="#e0eaf0" stroke-opacity=".4"/></svg>';
      [[40.7484, -73.9857, '帝国大厦', tower], [40.7411, -73.9897, '熨斗大厦', flatiron], [40.7127, -74.0134, '世界贸易中心', worldTrade]].forEach(([lat, lng, name, model]) => {
        L.marker([lat, lng], { icon: icon('landmark-model', model, [32, 54], [16, 49]), zIndexOffset: -100, title: name }).bindTooltip(name, { direction: 'top', offset: [0, -40], className: 'map-tooltip' }).addTo(groups.landmarks);
      });
      map.on('zoomend moveend', updateZoom);
      map.on('dragstart', () => { document.getSelection()?.removeAllRanges(); document.body.classList.add('is-panning'); callbacks.onManualMove(); });
      map.on('dragend', () => document.body.classList.remove('is-panning'));
      map.on('zoomstart', () => stage.classList.add('map-zooming'));
      map.on('zoomend', () => stage.classList.remove('map-zooming'));
      host.addEventListener('wheel', () => callbacks.onManualMove(), { passive: true });
      host.addEventListener('dblclick', () => callbacks.onManualMove());
      host.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '='].includes(event.key)) callbacks.onManualMove(); });
      resizeObserver = new ResizeObserver(() => { requestAnimationFrame(() => { if (map) { map.invalidateSize({ animate: false, pan: false }); updateZoom(); } }); });
      resizeObserver.observe(stage);
      api.ready = true;
      callbacks.onReady();
    } catch {
      visible(false);
      clearTimeout(loadTimer);
      resizeObserver?.disconnect();
      if (map) { map.remove(); map = null; }
      api.ready = false;
      if (enabled) status('fallback', '在线底图暂不可用，示意地图可用');
    } finally { initializing = false; }
  }

  api.focus = (point, zoom = 15.5, animate = true) => {
    if (!api.ready || !point.latlng) return;
    const projected = map.project(point.latlng, zoom).subtract([leftPadding() / 2, 0]);
    map.setView(map.unproject(projected, zoom), zoom, { animate: animate && !reduced.matches, duration: .45 });
  };
  api.fitRoute = stops => {
    if (!api.ready) return;
    map.fitBounds(stops.map(point => point.latlng), { paddingTopLeft: [leftPadding() + 32, 60], paddingBottomRight: [65, 60], maxZoom: 15, animate: !reduced.matches, duration: .4 });
  };
  api.follow = point => {
    if (!api.active || !point.latlng) return;
    const pixel = map.latLngToContainerPoint(point.latlng);
    const size = map.getSize();
    const padding = leftPadding();
    if (pixel.x < padding + Math.min(70, (size.x - padding) * .2) || pixel.x > size.x - Math.min(180, (size.x - padding) * .3) || pixel.y < Math.min(105, size.y * .3) || pixel.y > size.y - Math.min(90, size.y * .25)) api.focus(point, map.getZoom());
  };
  api.zoomBy = delta => { if (api.active) { map.stop(); map.setZoom(map.getZoom() + delta, { animate: !reduced.matches }); } };
  api.position = (point, title, detail) => {
    if (!api.ready || !point.latlng) return;
    spidey.setLatLng(point.latlng);
    ring.setLatLng(point.latlng);
    const label = spidey.getElement()?.querySelector('.geo-target-label');
    if (label && label.firstElementChild.textContent !== title) label.firstElementChild.textContent = title;
    if (label && label.lastElementChild.textContent !== detail) label.lastElementChild.textContent = detail;
  };
  api.route = stops => {
    if (!api.ready) return;
    groups.route.clearLayers();
    const points = stops.map(point => point.latlng);
    L.polyline(points, { color: '#09162a', weight: 8, opacity: .8, interactive: false }).addTo(groups.route);
    routeLine = L.polyline(points, { color: '#ee6c7c', weight: 3, opacity: layerStates.heat ? .35 : .9, lineCap: 'round', lineJoin: 'round', className: 'geo-route-line', interactive: false }).addTo(groups.route);
    stops.forEach((point, index) => {
      L.marker(point.latlng, { title: `${point.time} ${point.place}`, icon: icon(`geo-route-stop${index === selectedRouteStop ? ' is-selected' : ''}`, `<span>${index + 1}</span>`, [20, 20]) }).on('click', () => callbacks.onStop(index)).addTo(groups.route);
    });
  };
  api.activeStop = index => {
    selectedRouteStop = index;
    if (!api.ready) return;
    [...host.querySelectorAll('.geo-route-stop')].forEach((element, i) => element.classList.toggle('is-selected', i === index));
  };
  api.incidents = items => {
    if (!api.ready) return;
    groups.incidents.clearLayers();
    items.forEach(item => {
      if (!item.latlng) return;
      const resolved = item.status === 'resolved';
      L.marker(item.latlng, { title: item.title, zIndexOffset: 600, icon: icon(`geo-incident ${resolved ? 'is-resolved' : ''} ${item.severity === 'high' ? 'is-urgent' : ''}`, `<span><i class="ti ti-${resolved ? 'check' : item.severity === 'high' ? 'alert-triangle' : 'bolt'}" aria-hidden="true"></i></span>`, [32, 32]) }).on('click', () => callbacks.onIncident(item.id)).addTo(groups.incidents);
    });
  };
  api.sightings = items => {
    if (!api.ready) return;
    groups.sightings.clearLayers();
    items.forEach(item => {
      L.circleMarker(item.latlng, { radius: 5, color: '#a5c4fb', weight: 1.5, fillColor: '#498bea', fillOpacity: .9, className: 'geo-sighting' }).on('click', () => callbacks.onSighting(item)).addTo(groups.sightings);
    });
    groups.heat.clearLayers();
    items.forEach(item => [350, 220, 100].forEach((radius, index) => L.circle(item.latlng, { radius, stroke: false, fillColor: '#ed526c', fillOpacity: .05 + index * .025, interactive: false }).addTo(groups.heat)));
  };
  api.layer = (name, shown) => {
    layerStates[name] = shown;
    if (!api.ready || !groups[name]) return;
    if (shown) groups[name].addTo(map); else map.removeLayer(groups[name]);
    if (shown && name === 'route') api.activeStop(selectedRouteStop);
    if (name === 'heat' && routeLine) routeLine.setStyle({ opacity: shown ? .35 : .9 });
  };
  api.useOnline = async value => {
    enabled = value;
    if (!value) { clearTimeout(loadTimer); visible(false); status('schematic', '示意地图'); return; }
    rejectedTiles = false;
    tileFingerprints.clear();
    if (!api.ready) { await init(); return; }
    status('loading', '重新连接街区底图');
    tiles.redraw();
  };
  api.init = init;
  return api;
};
