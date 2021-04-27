import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {latLng, tileLayer} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-heatmap';
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
import {FormBuilder, FormGroup} from '@angular/forms';

type HeatmapOverlayConstructor = new(cfg: any) => any;
declare var HeatmapOverlay: HeatmapOverlayConstructor;

export interface OioDatum {
  count: number;
  bin: {latitude: number, longitude: number};
}

export interface HmDatum {
  lat: number;
  lng: number;
  count: number;
  // binID: string;
  // numDevices: number;
}

export interface HmGradient {
  [stop: string]: string;
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

  heatLayers = [this.heatLayer];
  dataArrays: any[] = [
    tracks_1, tracks_2, tracks_3, tracks_4, tracks_5, tracks_6,
    tracks_7, tracks_8, tracks_9, tracks_10, tracks_11, tracks_12,
    tracks_13, tracks_14, tracks_15, tracks_16, tracks_17, tracks_18,
    tracks_19, tracks_20, tracks_21, tracks_22, tracks_23
    ];
  leaf = L as any;
  // @ts-ignore
  combinedData: Map<string, HmDatum> = new Map<string, HmDatum>();
  // mergedData: HmDatum[] = [];
  // filteredData: HmDatum[] = [];
  a: Set<HmDatum>;
  radMin = 20;
  radMax = 60;
  radStep = 5;
  dataMax = 0;
  muteLowActivity = false;
  // muteMinimum = 5;
  highlightConvergence = false;
  // highlightFactor = 10;
  opacityLevel = 1;
  opacityLabels = ['Low', 'Medium', 'High'];
  hotspotIndex = 0;
  hotspotOptions = ['Show local maximum', 'Show global maximum'];
  zoomLevel = 0;
  heatmapForm: FormGroup;
  get currGradient() { return this.heatmapForm.get('colors').value; }

  gradMulti: HmGradient = {
    // 0.0 : 'blue',
    // 0.1 : 'green',
    // 0.2 : 'yellow',
    // 0.4 : 'orange',
    // 1.0 : 'red'
    0.0 : '#0000FF',
    0.25 : '#adff2f',
    0.5 : '#FFFF00',
    0.75 : '#feb24c',
    1.0 : '#bd0026',
  };
  gradYOR1: HmGradient = {
    0.0 : '#eed976',
    0.4 : '#feb24c',
    0.6 : '#fd8d3c',
    1.0 : '#bd0026',
  };
  gradYOR2: HmGradient = {
    0.0 : '#fed976',
    0.9 : '#fd8d3c',
    1.0 : '#e31a1c',
  };
  gradYOR3: HmGradient = {
    0.0 : '#fed976',
    0.1 : '#fd8d3c',
    1.0 : '#e31a1c',
  };
  gradYOR4: HmGradient = {
    0.0 : '#eed976',
    0.4 : '#feb24c',
    0.6 : '#fd8d3c',
    1.0 : '#bd0026',
  };
  gradBP: HmGradient = {
    0.0 : '#b3cde3',
    0.5 : '#8856a7',
    1.0 : '#810f7c',
  };
  gradO: HmGradient = {
    0.0 : '#fdbe85',
    0.3 : '#fd8d3c',
    0.7 : '#e6550d',
    1.0 : '#a63603',
  };
  gradR: HmGradient = {
    0.0 : '#fcae91',
    0.3 : '#fb6a4a',
    0.7 : '#de2d26',
    1.0 : '#a50f15',
  };
  gradB: HmGradient = {
    0.0 : '#bdd7e7',
    0.3 : '#6baed6',
    0.7 : '#3182bd',
    1.0 : '#08519c',
  };
  gradP: HmGradient = {
    0.0 : '#cbc9e2',
    0.3 : '#9e9ac8',
    0.7 : '#756bb1',
    1.0 : '#54278f',
  };
  gradG: HmGradient = {
    0.0 : '#bae4b3',
    0.3 : '#74c476',
    0.7 : '#31a354',
    1.0 : '#006d2c',
  };
  whichGradient: HmGradient = this.gradMulti;
  gradients = [this.gradMulti, this.gradYOR1, this.gradO, this.gradR, this.gradBP, this.gradB, this.gradP, this.gradG];

  // {label: 'Rainbow', gradient: this.gradMulti},
  // {label: 'Yellow-Orange-Red #1', gradient: this.gradYOR1},
  // {label: 'Oranges', gradient: this.gradO},
  // {label: 'Reds', gradient: this.gradR},
  // {label: 'Blue-Purple', gradient: this.gradBP},
  // {label: 'Blues', gradient: this.gradB},
  // {label: 'Purples', gradient: this.gradP},
  // {label: 'Greens', gradient: this.gradG},

  lhConfig = {
    gradient: this.gradMulti,
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

  constructor(private cdr: ChangeDetectorRef, public fb: FormBuilder) {
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

  initFormModel() {
    this.heatmapForm = this.fb.group({
      colors: [this.gradMulti],
      minOpacity: ['0.4'],
      maxOpacity: ['0.6']
    });
  }

  ngOnInit() {
    this.initFormModel();

    this.heatmapForm.valueChanges.subscribe(val => {
      console.log(`>>> Gradient is now ${JSON.stringify(val.colors)}`);
      this.whichGradient = val.colors;
      this.lhConfig.minOpacity = val.minOpacity;
      this.lhConfig.maxOpacity = val.maxOpacity;
      this.settingsChanged();
    });

    const baseMap1 = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
    });
    const baseMap2 = tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      detectRetina: true,
      attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
    });
    const baseMap3 = tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    const baseMap4 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const baseMap5 = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });
    const baseMap6 = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      // apikey: '<your apikey>',
      maxZoom: 22
    });

    this.layersControl = {
      baseLayers: {
        'Wikimedia Map' : baseMap1,
        'Stadia Map' : baseMap2,
        'OpenTopo Map' : baseMap3,
        'CyclOSM Map' : baseMap4,
        'StadiaDark Map' : baseMap5,
        'ThunderForest OpenCycle' : baseMap6
      },
      overlays: {}
    };

    // Set the initial set of displayed layers (we could also use the leafletLayers input binding for this)
    this.leafletOpts = {
      layers: [baseMap1, baseMap2],
      zoom: 7,
      center: latLng([40, -75])
    };

    this.zoomLevel = 7;
    this.setDefaultConfig(1);
    this.combineData();
    this.addLeafletHeatmap();
  }

  updateDataMax(): void {
    this.dataMax = 0;
    const whichData = this.combinedData;  // allow boosted cells to exceed dataMax?

    if (whichData) {
      // @ts-ignore
      for (const d of whichData.values()) {
        if (d.count > this.dataMax) {
          this.dataMax = d.count;
        }
      }
    }
  }

  setDefaultConfig(n: number): void {
    switch (n) {
      case 1:
        this.whichGradient = this.gradMulti;
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
      const startTime = performance.now();
      // Hack to redraw heatmap (https://github.com/pa7/heatmap.js/issues/290)
      this.heatLayer._heatmap.configure(this.lhConfig);
      this.heatLayer._reset();
      const endTime = performance.now();
      console.log(`>>> Heatmap rendering took: ${Math.round(endTime - startTime)} ms;`);
    }
  }

  addLeafletHeatmap(): void {
    this.heatLayer = new HeatmapOverlay(this.lhConfig);
    const combinedArr = Array.from(this.combinedData.values());
    const layerData = {min: 0, max: this.dataMax, data: combinedArr};
    this.heatLayer.setData(layerData);
    this.layersControl.overlays[`LH Heatmap`] = this.heatLayer;
    this.heatLayers = [this.heatLayer];
  }

  addHeatMapData(locMap: Map<string, HmDatum>, oioData: OioDatum[]) {
    for (const d of oioData) {
      const id = `${d.bin.latitude.toFixed(3)}:${d.bin.longitude.toFixed(3)}`;
      const hmDatum: HmDatum = {lat: d.bin.latitude, lng: d.bin.longitude, count: d.count};

      if (locMap.has[id]) {
        const val = locMap.get(id);
        val.count += hmDatum.count;
        locMap.set(id, val);
      } else {
        locMap.set(id, hmDatum);
      }
    }
  }

  combineData(): void {
    this.combinedData.clear();
    const startTime = performance.now();
    let totalPts = 0;

    for (const arr of this.dataArrays) {
      this.addHeatMapData(this.combinedData, arr);
      totalPts += arr.length;
    }
    const endTime = performance.now();

    console.log(`>>> Total locations: ${totalPts};`);
    console.log(`>>> Combined locations: ${this.combinedData.size};`);
    console.log(`>>> Combining took: ${Math.round(endTime - startTime)} ms;`);
    this.updateDataMax();
    console.log(`>>> Maximum count: ${this.dataMax};`);
  }

  onMapReady(map: any) {
    console.log('>>> Map is ready');
    map.on('zoomend', ev => this.onZoomEnd(map, ev) );
    (map as any)._onResize();
    setTimeout(() => this.settingsChanged(), 200);
  }

  onZoomEnd(map: any, ev: any) {
    this.zoomLevel = map.getZoom();
    console.log(`>>> Zoom is now: ${this.zoomLevel};`);
    const zoomFactor = (this.zoomLevel * 11) / 17;
    this.lhConfig.radius = Math.round((zoomFactor * zoomFactor) + 5);
    this.settingsChanged();
    this.cdr.detectChanges();
  }

}


// resetDataAndSettings() {
//   this.addLeafletHeatmap();
//   this.settingsChanged();
// }

// refilterData() {
//   this.combineData();
//   this.filteredData = JSON.parse(JSON.stringify(this.mergedData));
//   let boosted = 0;
//
//   if (this.muteLowActivity) {
//     this.filteredData = this.filteredData.filter(d => d.count >= this.muteMinimum);
//     console.log(`>>> Muted bins: ${this.filteredData.length};`);
//   }
//
//   if (this.highlightConvergence) {
//     for (const bd of this.filteredData) {
//       if (bd.numDevices > 1) {
//         bd.count = bd.count * (bd.numDevices * this.highlightFactor);
//         boosted++;
//         if (bd.numDevices === 3) {
//           console.log(`>>> Found triple cell at : ${bd.lat} : ${bd.lng} with boosted count = ${bd.count};`);
//         }
//       }
//     }
//   }
//   const doubles = this.filteredData.filter(d => d.numDevices === 2);
//   const triples = this.filteredData.filter(d => d.numDevices === 3);
//   console.log(`>>> Double cells: ${doubles.length};`);
//   console.log(`>>> Triple cells: ${triples.length};`);
//   console.log(`>>> Boosted ${boosted} multi-device cells;`);
//
//   this.updateDataMax();
//   const layerData = {min: 0, max: this.dataMax, data: this.filteredData};
//   console.log(`>>> Setting data with dataMax of ${this.dataMax};`);
//   this.heatLayer.setData(layerData);
// }

// tslint:disable-next-line:max-line-length
// const locations: HmDatum[] = arr.map(d => ({lat: d.bin.latitude, lng: d.bin.longitude, count: d.count, binID: `${d.bin.latitude}:${d.bin.longitude}`}));
