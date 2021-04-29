import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
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
import {Observable, Subject, Subscription} from 'rxjs';
import {share, takeUntil} from 'rxjs/operators';
import {ColorRamp, ColorRampService} from './color-ramp.service';

type HeatmapOverlayConstructor = new(cfg: any) => any;
declare var HeatmapOverlay: HeatmapOverlayConstructor;

export interface HeatmapSettings {
  gradient: ColorRamp;
  minOpacity: number;
  maxOpacity: number;
  useLocalExtrema: boolean;
}

interface LeafletHeatmapSettings extends HeatmapSettings {
  radius: number;
  scaleRadius: boolean;
  blur: number;
  latField: string;
  lngField: string;
  valueField: string;
}

export interface OioDatum {
  count: number;
  bin: {latitude: number, longitude: number};
}

export interface HeatmapDatum {
  lat: number;
  lng: number;
  count: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
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
  combinedData: Map<string, HeatmapDatum> = new Map<string, HeatmapDatum>();
  dataMax = 0;
  hotspotOptions = ['Show local maximum', 'Show global maximum'];
  zoomLevel = 7;
  heatmapForm: FormGroup;
  get currGradient() { return this.heatmapForm.get('colors').value; }
  radii = [5, 6, 7, 10, 14, 19, 23, 32, 40, 50, 60, 70, 85, 100, 115, 132, 150, 170, 190, 300, 500, 700, 900];
  private ngUnsubscribe$: Subject<void>;

  ramps: ColorRamp[] = [];
  settings: HeatmapSettings = {gradient: {}, minOpacity: .35, maxOpacity: .65, useLocalExtrema: true};

  constructor(public fb: FormBuilder,
              private cdr: ChangeDetectorRef,
              private rampSvc: ColorRampService) {
    this.ngUnsubscribe$ = new Subject();
  }

  ngOnInit() {
    this.ramps = this.rampSvc.getRamps();
    this.settings.gradient = this.ramps[0];
    this.initFormModel();

    // TODO separate subs per control
    this.heatmapForm.valueChanges
      .pipe(takeUntil(this.unsubscribed()))
      .subscribe(val => {
      this.settings.gradient = val.colors;
      this.settings.minOpacity = val.minOpacity;
      this.settings.maxOpacity = val.maxOpacity;
      this.settings.useLocalExtrema = (val.hotspot === 0);
      this.applySettingsToHeatmapLayer(this.settings);
    });

    this.initializeLeaflet();
    this.combineData();
    this.addLeafletHeatmap(this.settings);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  unsubscribed(): Observable<void> {
    return this.ngUnsubscribe$.asObservable()
        .pipe(share());
  }

  initFormModel() {
    // todo init from settings
    this.heatmapForm = this.fb.group({
      colors: [this.ramps[0]],
      minOpacity: ['0.4'],
      maxOpacity: ['0.6'],
      hotspot: [0]
    });
  }

  private initializeLeaflet(): void {
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
  }

  setOpacityLevel(level: number) {
    if (level === 0) {
      this.heatmapForm.patchValue({minOpacity: .25, maxOpacity: .45});
    }
    if (level === 1) {
      this.heatmapForm.patchValue({minOpacity: .35, maxOpacity: .65});
    }
    if (level === 2) {
      this.heatmapForm.patchValue({minOpacity: .5, maxOpacity: .75});
    }
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

  restoreDefaults() {
    this.settings.gradient = this.ramps ? this.ramps[0] : {};
    this.settings.minOpacity = 0.35;
    this.settings.maxOpacity = 0.65;
    this.settings.useLocalExtrema = true;
    this.applySettingsToHeatmapLayer(this.settings);
  }


  // Update leaflet-heatmap layer
  private applySettingsToHeatmapLayer(settings: HeatmapSettings): void {
    if (this.heatLayer) {
      const lhmSettings = this.getLeafletHeatmapSettings(settings);
      // Force redraw; See (https://github.com/pa7/heatmap.js/issues/290)
      this.heatLayer.cfg.useLocalExtrema = settings.useLocalExtrema;  // this is used at the plugin level
      this.heatLayer.cfg.radius = lhmSettings.radius;
      this.heatLayer._heatmap.configure(lhmSettings);
      this.heatLayer._reset();
    }
  }

  getLeafletHeatmapSettings(settings: HeatmapSettings): LeafletHeatmapSettings {
    const lhmSettings: LeafletHeatmapSettings = {
      gradient: {0.0: 'yellow', 0.5: 'orange', 1.0: 'red'},
      radius: this.radii[this.zoomLevel],
      minOpacity: .4,
      maxOpacity: .6,
      blur: .85,
      scaleRadius: false,
      useLocalExtrema: true,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count'
    };
    Object.assign(lhmSettings, settings);
    return lhmSettings;
  }

  addLeafletHeatmap(settings: HeatmapSettings): void {
    const lhmSettings = this.getLeafletHeatmapSettings(settings);
    this.heatLayer = new HeatmapOverlay(lhmSettings);
    const combinedArr = Array.from(this.combinedData.values());
    const layerData = {min: 0, max: this.dataMax, data: combinedArr};
    this.heatLayer.setData(layerData);
    this.layersControl.overlays[`LH Heatmap`] = this.heatLayer;
    this.heatLayers = [this.heatLayer];
  }

  addHeatMapData(locMap: Map<string, HeatmapDatum>, oioData: OioDatum[]) {
    for (const d of oioData) {
      const id = `${d.bin.latitude.toFixed(3)}:${d.bin.longitude.toFixed(3)}`;
      const hmDatum: HeatmapDatum = {lat: d.bin.latitude, lng: d.bin.longitude, count: d.count};

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
    setTimeout(() => this.applySettingsToHeatmapLayer(this.settings), 200);
  }

  onZoomEnd(map: any, ev: any) {
    this.zoomLevel = map.getZoom(); // We need this to calculate radius
    this.applySettingsToHeatmapLayer(this.settings);
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

// toggleScaling() {
//   if (this.lhConfig.scaleRadius) {
//     this.lhConfig.radius =  0.25;
//     this.radMin = .05;
//     this.radMax = 1;
//     this.radStep = .05;
//   } else {
//     this.lhConfig.radius = 30;
//     this.radMin = 20;
//     this.radMax = 60;
//     this.radStep = 5;
//   }
//   this.applySettingsToHeatmapLayer();
// }

// gradYOR2: HmGradient = {
//   0.0 : '#fed976',
//   0.9 : '#fd8d3c',
//   1.0 : '#e31a1c',
// };
// gradYOR3: HmGradient = {
//   0.0 : '#fed976',
//   0.1 : '#fd8d3c',
//   1.0 : '#e31a1c',
// };
// gradYOR4: HmGradient = {
//   0.0 : '#eed976',
//   0.4 : '#feb24c',
//   0.6 : '#fd8d3c',
//   1.0 : '#bd0026',
// };

// hotspotChanged() {
//   this.lhConfig.useLocalExtrema = (this.hotspotIndex === 0);
//   this.settingsChanged();
// }

// opacityChanged() {
//   if (this.opacityLevel === 0) {
//     this.lhConfig.minOpacity = .25;
//     this.lhConfig.maxOpacity = .45;
//   }
//   if (this.opacityLevel === 1) {
//     this.lhConfig.minOpacity = .35;
//     this.lhConfig.maxOpacity = .6;
//   }
//   if (this.opacityLevel === 2) {
//     this.lhConfig.minOpacity = .4;
//     this.lhConfig.maxOpacity = .75;
//   }
//   this.applySettingsToHeatmapLayer();
// }

// {label: 'Rainbow', gradient: this.gradMulti},
// {label: 'Yellow-Orange-Red #1', gradient: this.gradYOR1},
// {label: 'Oranges', gradient: this.gradO},
// {label: 'Reds', gradient: this.gradR},
// {label: 'Blue-Purple', gradient: this.gradBP},
// {label: 'Blues', gradient: this.gradB},
// {label: 'Purples', gradient: this.gradP},
// {label: 'Greens', gradient: this.gradG},
