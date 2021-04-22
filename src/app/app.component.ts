import {Component, OnInit} from '@angular/core';
import {latLng, Map, tileLayer} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-heatmap';
import 'leaflet.heat/dist/leaflet-heat';
import tracks_1 from 'testdata/a1.json';
import tracks_2 from 'testdata/a2.json';
import tracks_3 from 'testdata/a3.json';
import tracks_4 from 'testdata/a4.json';
import tracks_5 from 'testdata/a5.json';
import tracks_6 from 'testdata/a6.json';
import tracks_7 from 'testdata/a7.json';
import tracks_8 from 'testdata/a8.json';
import tracks_9 from 'testdata/a9.json';
import tracks_10 from 'testdata/a10.json';
import tracks_11 from 'testdata/a11.json';
import tracks_12 from 'testdata/a12.json';
import tracks_13 from 'testdata/a13.json';
import tracks_14 from 'testdata/a14.json';
import tracks_15 from 'testdata/a15.json';
import tracks_16 from 'testdata/a16.json';
import tracks_17 from 'testdata/a17.json';
import tracks_18 from 'testdata/a18.json';
import tracks_19 from 'testdata/a19.json';
import tracks_20 from 'testdata/a20.json';
import tracks_21 from 'testdata/a21.json';
import tracks_22 from 'testdata/a22.json';
import tracks_23 from 'testdata/a23.json';

type HeatmapOverlayConstructor = new(cfg: any) => any;
declare var HeatmapOverlay: HeatmapOverlayConstructor;

interface HmDatum {
  lat: number;
  lng: number;
  count: number;
  binID: string;
  numDevices: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  leafletOpts;
  layersControl;
  heatLayer: any;   // leaflet-heatmap
  dotHeatLayer: any;   // leaflet.heat

  heatLayers = [this.heatLayer];
  dataArrays = [
    tracks_1, tracks_2, tracks_3, tracks_4, tracks_5, tracks_6,
    tracks_7, tracks_8, tracks_9, tracks_10, tracks_11, tracks_12,
    tracks_13, tracks_14, tracks_15, tracks_16, tracks_17, tracks_18,
    tracks_19, tracks_20, tracks_21, tracks_22, tracks_23
    ];
  leaf = L as any;
  combinedData: HmDatum[] = [];
  mergedData: HmDatum[] = [];
  filteredData: HmDatum[] = [];
  radMin = 20;
  radMax = 60;
  radStep = 5;
  dataMax = 0;
  muteLowActivity = false;
  muteMinimum = 5;
  highlightConvergence = false;
  highlightFactor = 10;
  opacityLevel = 1;
  opacityLabels = ['Low', 'Medium', 'High'];
  hotspotIndex = 0;
  hotspotOptions = ['Based on local maximum', 'Based on global maximum'];

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
    0.1 : '#fd8d3c',
    1.0 : '#e31a1c',
  };
  gradYOR4 = {
    0.0 : '#eed976',
    0.4 : '#feb24c',
    0.6 : '#fd8d3c',
    1.0 : '#bd0026',
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
    {label: 'Yellow-Orange-Red #4', gradient: this.gradYOR4},
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
    radius: 35,
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

  hotspotChanged() {
    this.lhConfig.useLocalExtrema = (this.hotspotIndex === 0);
    this.settingsChanged();
  }

  opacityChanged() {
    if (this.opacityLevel === 0) {
      this.lhConfig.minOpacity = .25;
      this.lhConfig.maxOpacity = .45;
    }
    if (this.opacityLevel === 1) {
      this.lhConfig.minOpacity = .35;
      this.lhConfig.maxOpacity = .6;
    }
    if (this.opacityLevel === 2) {
      this.lhConfig.minOpacity = .4;
      this.lhConfig.maxOpacity = .75;
    }
    this.settingsChanged();
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
    // for (const arr of this.dataArrays) {
    //   if (arr[0].count > this.dataMax) {
    //     this.dataMax = arr[0].count;
    //   }
    // }

    this.setDefaultConfig(1);
    this.addAllHeatmaps();
  }

  updateDataMax(): void {
    this.dataMax = 0;
    // const whichData = this.filteredData ? this.filteredData : this.mergedData;
    const whichData = this.mergedData;  // allow boosted cells to exceed dataMax?

    if (whichData) {
      for (const d of whichData) {
        if (d.count > this.dataMax) {
          this.dataMax = d.count;
        }
      }
    }
  }

  setDefaultConfig(n: number): void {
    switch (n) {
      case 1:
        this.whichGradient = this.gradYOR1;
        this.lhConfig.useLocalExtrema = true;
        this.lhConfig.scaleRadius = false;
        this.lhConfig.radius = 35;
        this.lhConfig.minOpacity = .35;
        this.lhConfig.maxOpacity = .65;
        this.muteLowActivity = false;
        this.highlightConvergence = false;
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

  // Update leaflet-heatmap layer
  settingsChanged() {
    this.lhConfig.gradient = this.whichGradient;

    if (this.heatLayer) {
      // Hack to redraw heatmap (https://github.com/pa7/heatmap.js/issues/290)
      this.heatLayer._heatmap.configure(this.lhConfig);
      this.heatLayer._reset();
    }

    // Update leaflet.heat layer
    // if (this.dotHeatLayer) {
    //   const opts = {
    //     radius: this.lhConfig.radius,
    //     minOpacity: this.lhConfig.minOpacity,
    //     max: this.dataMax,
    //     gradient: this.whichGradient
    //   };
    //   this.dotHeatLayer.setOptions(opts);
    // }
  }

  resetDataAndSettings() {
    this.addLeafletHeatmap();
    this.settingsChanged();
  }

  addDotHeat(): void {
    const opts1 = {
      radius: 35,
      minOpacity: .4,
      max: 38000,
      gradient: this.gradYOR1
    };
    const latLngArr = this.mergedData.map(d => ({lat: d.lat, lng: d.lng, alt: d.count}));
    this.dotHeatLayer = this.leaf.heatLayer(latLngArr, opts1);
    this.layersControl.overlays[`Dot Heat`] = this.dotHeatLayer;
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

  refilterData() {
    this.combineData();
    this.filteredData = JSON.parse(JSON.stringify(this.mergedData));
    let boosted = 0;

    if (this.muteLowActivity) {
      this.filteredData = this.filteredData.filter(d => d.count >= this.muteMinimum);
      console.log(`>>> Muted bins: ${this.filteredData.length};`);
    }

    if (this.highlightConvergence) {
      for (const bd of this.filteredData) {
        if (bd.numDevices > 1) {
          bd.count = bd.count * (bd.numDevices * this.highlightFactor);
          boosted++;
          if (bd.numDevices === 3) {
            console.log(`>>> Found triple cell at : ${bd.lat} : ${bd.lng} with boosted count = ${bd.count};`);
          }
        }
      }
    }
    const doubles = this.filteredData.filter(d => d.numDevices === 2);
    const triples = this.filteredData.filter(d => d.numDevices === 3);
    console.log(`>>> Double cells: ${doubles.length};`);
    console.log(`>>> Triple cells: ${triples.length};`);
    console.log(`>>> Boosted ${boosted} multi-device cells;`);

    this.updateDataMax();
    const layerData = {min: 0, max: this.dataMax, data: this.filteredData};
    console.log(`>>> Setting data with dataMax of ${this.dataMax};`);
    this.heatLayer.setData(layerData);
  }

  combineData(): void {
    this.combinedData = [];
    this.mergedData = [];
    this.filteredData = [];

    for (const arr of this.dataArrays) {
      // tslint:disable-next-line:max-line-length
      const latLngArr: HmDatum[] = arr.map(d => ({lat: d.bin.latitude, lng: d.bin.longitude, count: d.count, binID: `${d.bin.latitude}:${d.bin.longitude}`, numDevices: 1}));
      // tslint:disable-next-line:max-line-length
      // const latLngArr: HmDatum[] = arr.map(d => ({lat: d.track.location.latitude, lng: d.track.location.longitude, count: 1, binID: `${d.track.location.latitude}:${d.track.location.longitude}`, numDevices: 1}));
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
          // m.numDevices++;
          this.combinedData.shift();
        } else {
          this.mergedData.unshift(this.combinedData.shift());
        }
      } else {
        this.mergedData.unshift(this.combinedData.shift());
      }
    }
    console.log(`>>> Merged bins: ${this.mergedData.length};`);
    this.updateDataMax();
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
