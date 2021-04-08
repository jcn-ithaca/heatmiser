import {Component, OnInit} from '@angular/core';
import {latLng, Map, tileLayer} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-heatmap';
import 'leaflet.heat/dist/leaflet-heat';
import track1 from 'testdata/track1.json';
import track2 from 'testdata/track2.json';
import track3 from 'testdata/track3.json';

type HeatmapOverlayConstructor = new(cfg: any) => any;
declare var HeatmapOverlay: HeatmapOverlayConstructor;

interface HmDatum {
  lat: number;
  lng: number;
  count: number;
  binID: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  baseMap: L.TileLayer;
  leafletOpts;
  layersControl;
  heatLayer: any;
  heatLayers = [this.heatLayer];
  dataArrays = [track1, track2, track3];
  leaf = L as any;
  combinedData: HmDatum[] = [];
  mergedData: HmDatum[] = [];
  radMin = 20;
  radMax = 60;
  radStep = 5;
  dataMax = 0;

  gradMulti = {
    0.0 : '#0000FF',
    0.25 : '#adff2f',
    0.5 : '#FFFF00',
    0.75 : '#feb24c',
    1.0 : '#bd0026',
  };
  gradYOR1 = {
    0.0 : '#eed976',
    0.4 : '#feb24c',
    0.6 : '#fd8d3c',
    1.0 : '#bd0026',
  };
  gradYOR2 = {
    0.0 : '#fed976',
    0.9 : '#fd8d3c',
    1.0 : '#e31a1c',
  };
  gradYOR3 = {
    0.0 : '#fed976',
    0.3 : '#fd8d3c',
    1.0 : '#e31a1c',
  };
  gradBP = {
    0.0 : '#b3cde3',
    0.5 : '#8856a7',
    1.0 : '#810f7c',
  };
  gradO = {
    0.0 : '#fdbe85',
    0.3 : '#fd8d3c',
    0.7 : '#e6550d',
    1.0 : '#a63603',
  };
  gradR = {
    0.0 : '#fcae91',
    0.3 : '#fb6a4a',
    0.7 : '#de2d26',
    1.0 : '#a50f15',
  };
  gradB = {
    0.0 : '#bdd7e7',
    0.3 : '#6baed6',
    0.7 : '#3182bd',
    1.0 : '#08519c',
  };
  gradP = {
    0.0 : '#cbc9e2',
    0.3 : '#9e9ac8',
    0.7 : '#756bb1',
    1.0 : '#54278f',
  };
  gradG = {
    0.0 : '#bae4b3',
    0.3 : '#74c476',
    0.7 : '#31a354',
    1.0 : '#006d2c',
  };
  whichGradient = this.gradYOR1;
  gradients = [
    {label: 'Yellow-Orange-Red #1', gradient: this.gradYOR1},
    {label: 'Yellow-Orange-Red #2', gradient: this.gradYOR2},
    {label: 'Yellow-Orange-Red #3', gradient: this.gradYOR3},
    {label: 'Oranges', gradient: this.gradO},
    {label: 'Reds', gradient: this.gradR},
    {label: 'Blue-Purple', gradient: this.gradBP},
    {label: 'Blues', gradient: this.gradB},
    {label: 'Purples', gradient: this.gradP},
    {label: 'Greens', gradient: this.gradG},
    {label: 'Rainbow', gradient: this.gradMulti}
  ];

  lhConfig = {
    gradient: this.gradYOR1,
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    radius: 30,
    minOpacity: .4,
    maxOpacity: .6,
    blur: .85,
    // scales the radius based on map zoom
    scaleRadius: false,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtrema true)
    useLocalExtrema: true,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
  };

  constructor() {
  }

  ngOnInit() {
    const baseMap1 = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
    });
    const baseMap2 = tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      detectRetina: true,
      attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
    });

    this.layersControl = {
      baseLayers: {
        'Wikimedia Map' : baseMap1,
        'Stadia Map': baseMap2
      },
      overlays: {}
    };

    // Set the initial set of displayed layers (we could also use the leafletLayers input binding for this)
    this.leafletOpts = {
      layers: [baseMap1, baseMap2],
      zoom: 7,
      center: latLng([40, -75])
    };

    // Find overall maximum count value (our JSON data is sorted by count)
    for (const arr of this.dataArrays) {
      if (arr[0].count > this.dataMax) {
        this.dataMax = arr[0].count;
      }
    }

    this.setDefaultConfig(1);
    this.addAllHeatmaps();
  }

  setDefaultConfig(n: number) {
    switch (n) {
      case 1:
        this.whichGradient = this.gradYOR1;
        this.lhConfig.useLocalExtrema = true;
        this.lhConfig.scaleRadius = false;
        this.lhConfig.radius = 30;
        this.lhConfig.minOpacity = .35;
        this.lhConfig.maxOpacity = .65;
        break;
      case 2:
        break;
    }
  }

  applySettings(n: number) {
    this.setDefaultConfig(n);
    this.settingsChanged();
  }

  toggleScaling() {
    if (this.lhConfig.scaleRadius) {
      this.lhConfig.radius =  0.25;
      this.radMin = .05;
      this.radMax = 1;
      this.radStep = .05;
    } else {
      this.lhConfig.radius = 30;
      this.radMin = 20;
      this.radMax = 60;
      this.radStep = 5;
    }
    this.settingsChanged();
  }

  settingsChanged() {
    this.lhConfig.gradient = this.whichGradient;
    // Hack to redraw heatmap (https://github.com/pa7/heatmap.js/issues/290)
    this.heatLayer._heatmap.configure(this.lhConfig);
    this.heatLayer._reset();
  }

  dataBoundsChanged() {
    const layerData = {min: 0, max: this.dataMax, data: this.mergedData};
    this.heatLayer.setData(layerData);
    this.settingsChanged();
  }

  addDotHeat(): void {
    const opts1 = {
      radius: 30,
      minOpacity: .35,
      max: 35000,
      gradient: this.gradO
    };

    const latLngArr = this.mergedData.map(d => ({lat: d.lat, lng: d.lng, alt: d.count}));
    const layer = this.leaf.heatLayer(latLngArr, opts1);
    this.layersControl.overlays[`Dot Heat`] = layer;
  }

  // addWebGlHeatmap(): void {
  //   const opts = {
  //     size: 30,
  //     units: 'px',
  //     alphaRange: 0.5, // ??
  //     max: 35000,
  //     autoresize: true
  //   };
  //   const wglData = this.mergedData.map(d => ( [d.lat, d.lng, d.count] ));
  //   const layer = new this.leaf.WebGLHeatMap(opts);
  //   layer.setData(wglData);
  //   this.layersControl.overlays[`WebGL Heatmap`] = layer;
  // }

  addLeafletHeatmap(): void {
    this.heatLayer = new HeatmapOverlay(this.lhConfig);
    const layerData = {min: 0, max: this.dataMax, data: this.mergedData};
    this.heatLayer.setData(layerData);
    this.layersControl.overlays[`LH Heatmap`] = this.heatLayer;
    this.heatLayers = [this.heatLayer];
  }

  combineData(): void {
    for (const arr of this.dataArrays) {
      const latLngArr: HmDatum[] = arr.map(d => ({lat: d.bin.latitude, lng: d.bin.longitude, count: d.count, binID: `${d.bin.latitude}:${d.bin.longitude}`}));
      this.combinedData = this.combinedData.concat(latLngArr);
    }
    // Sort data so points with same bin (grid cell) are guaranteed to be adjacent in the combined array
    this.combinedData.sort((a, b) => a.binID.localeCompare(b.binID) );
    console.log(`>>> Combined bins: ${this.combinedData.length };`);

    // Merge points in same bin
    while (this.combinedData.length > 0) {
      if (this.mergedData.length) {
        const m = this.mergedData[0];
        const c = this.combinedData[0];
        if (c.lat === m.lat && c.lng === m.lng) {  // same bin
          m.count += c.count;
          this.combinedData.shift();
        } else {
          this.mergedData.unshift(this.combinedData.shift());
        }
      } else {
        this.mergedData.unshift(this.combinedData.shift());
      }
    }
    console.log(`>>> Merged bins: ${this.mergedData.length};`);
  }

  addAllHeatmaps() {
    this.combineData();
    this.addLeafletHeatmap();
    this.addDotHeat();
    // this.addWebGlHeatmap();
  }

  onMapReady(map: Map) {
    (map as any)._onResize();
    setTimeout(() => this.settingsChanged(), 200);
    // map.fitBounds([
    //   [39, -76],
    //   [41, -74]
    // ]);
  }

}
