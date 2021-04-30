import { Injectable } from '@angular/core';

type ColorSequence = string[];
type ColorSequenceTable = {[key: string]: ColorSequence};

export interface ColorRamp {
  [stop: string]: string;   // e.g. {'0.5' : 'orange'}
}
@Injectable({
  providedIn: 'root'
})
export class ColorRampService {

  sequenceTable: ColorSequenceTable = {
    Rainbow1: ['Blue', 'Lime', 'Gold', 'Orange', 'Red'],
    Rainbow2: ['Aqua', 'Blue', 'Purple', 'Magenta'],
    LSYO: ['LightGreen', 'SeaGreen', 'Yellow', 'Orange'],
    BMR: ['Blue', 'Magenta', 'Red'],
    GoldRed: ['Gold', 'Orange', 'OrangeRed', 'Red', 'DarkRed'],
    PinkRed: ['Pink', 'Red', 'DarkRed'],
    Blues: ['LightSkyBlue', 'DodgerBlue', 'RoyalBlue', 'Blue'],
    Purples: ['#b390fb', 'MediumPurple', 'DarkViolet', 'Purple']
  };
  defaultRamps: string[] = ['Rainbow1', 'Rainbow2', 'LYSO', 'BMR', 'GoldRed', 'PinkRed', 'Blues', 'Purples'];

  constructor() {
  }

  getRamps(): ColorRamp[] {
    const ramps: ColorRamp[] = [];

    for (const rampName of this.defaultRamps) {
      const seq = this.sequenceTable[rampName];
      const ramp: ColorRamp = {};

      if (seq) {
        const interval = (1 / seq.length);
        for (let i = 0; i < seq.length; i++) {
          const stop = (i === seq.length - 1) ? '1.0' : (interval * i).toFixed(2);
          ramp[stop] = seq[i];
        }
        ramps.push(ramp);
      }
    }
    return ramps;
  }
}

// ColorBrewer sequences
// OrRd: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(179,0,0)', 'rgb(127,0,0)'],
// PuBu: ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(4,90,141)', 'rgb(2,56,88)'],
// BuPu: ['rgb(247,252,253)', 'rgb(224,236,244)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(129,15,124)', 'rgb(77,0,75)'],
// Oranges: ['rgb(255,245,235)', 'rgb(254,230,206)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(166,54,3)', 'rgb(127,39,4)'],
// BuGn: ['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'],
// YlGn: ['rgb(255,255,229)', 'rgb(247,252,185)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,104,55)', 'rgb(0,69,41)'],
// Reds: ['rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'],
// RdPu: ['rgb(255,247,243)', 'rgb(253,224,221)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)', 'rgb(73,0,106)'],
// Greens: ['rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'],
// YlGnBu: ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(37,52,148)', 'rgb(8,29,88)'],
// Purples: ['rgb(252,251,253)', 'rgb(239,237,245)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(84,39,143)', 'rgb(63,0,125)'],
// GnBu: ['rgb(247,252,240)', 'rgb(224,243,219)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,104,172)', 'rgb(8,64,129)'],
// YlOrRd: ['rgb(255,255,204)', 'rgb(255,237,160)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(189,0,38)', 'rgb(128,0,38)'],
// PuRd: ['rgb(247,244,249)', 'rgb(231,225,239)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(152,0,67)', 'rgb(103,0,31)'],
// Blues: ['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)'],

// gradMulti: ColorRamp = {
//   0.0 : 'blue',
//   0.25 : 'green',
//   0.5 : 'yellow',
//   0.75 : 'orange',
//   1.0 : 'red',
// };
// gradMulti2: ColorRamp = {
//   0.0 : '#0392cf',
//   0.25 : '#7bc043',
//   0.5 : '#fdf498',
//   0.75 : '#f37736',
//   1.0 : '#ee4035',
// };
// gradYOR1: ColorRamp = {
//   0.0 : '#eed976',
//   0.4 : '#feb24c',
//   0.6 : '#fd8d3c',
//   1.0 : '#bd0026',
// };
// gradYOR2: ColorRamp = {
//   0.00 : '#ffeda0',
//   0.15 : '#fed976',
//   0.30 : '#feb24c',
//   0.45 : '#fd8d3c',
//   0.55 : '#fc4e2a',
//   0.70 : '#e31a1c',
//   0.85 : '#bd0026',
//   1.00 : '#800026',
// };
// gradYOR3: ColorRamp = {
//   0.1 : '#fed976',
//   0.2 : '#feb24c',
//   0.4 : '#fd8d3c',
//   0.6 : '#fc4e2a',
//   0.8 : '#e31a1c',
//   0.9 : '#bd0026',
//   1.0 : '#800026',
// };
// gradBP: ColorRamp = {
//   0.0 : '#b3cde3',
//   0.5 : '#8856a7',
//   1.0 : '#810f7c',
// };
// gradO: ColorRamp = {
//   0.0 : '#fdbe85',
//   0.3 : '#fd8d3c',
//   0.7 : '#e6550d',
//   1.0 : '#a63603',
// };
// gradR: ColorRamp = {
//   0.0 : '#fcae91',
//   0.3 : '#fb6a4a',
//   0.7 : '#de2d26',
//   1.0 : '#a50f15',
// };
// gradB: ColorRamp = {
//   0.0 : '#bdd7e7',
//   0.3 : '#6baed6',
//   0.7 : '#3182bd',
//   1.0 : '#08519c',
// };
// gradP: ColorRamp = {
//   0.0 : '#cbc9e2',
//   0.3 : '#9e9ac8',
//   0.7 : '#756bb1',
//   1.0 : '#54278f',
// };
// gradG: ColorRamp = {
//   0.0 : '#bae4b3',
//   0.3 : '#74c476',
//   0.7 : '#31a354',
//   1.0 : '#006d2c',
// };
