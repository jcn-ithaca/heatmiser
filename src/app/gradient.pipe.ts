import {Pipe, PipeTransform} from '@angular/core';
import {ColorRamp} from './color-ramp.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Pipe({
  name: 'gradientCSS'
})
export class GradientPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }
  // Get a string specifying given gradient in css
  transform(g: ColorRamp): SafeStyle {
    const colorEntries = Object.entries(g);
    // sort color stops by the key (0.1, 0.2, etc)
    colorEntries.sort((a, b) => a[0].localeCompare(b[0]));
    const colorStops: string[] = [];

    for (const e of colorEntries) {
      const percent = Math.round(Number(e[0]) * 100);
      colorStops.push(` ${e[1]} ${percent}%`);
    }
    const css = `linear-gradient(90deg,${colorStops.join(',')})`;
    console.log(`Generating CSS: ${css}`);
    return this.sanitizer.bypassSecurityTrustStyle(css);
  }

}
