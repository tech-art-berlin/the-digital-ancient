#version 410

uniform vec2      resolution;
uniform float     frameRate;
uniform int       frame;

uniform sampler2D tex0;
uniform sampler2D tex1;

const float       centralDispersionRate =     .04; // we need it, otherwise visual is trapped
const float       rainbowCycleSpeed =         .001; // for interactive shader it should be based on time
const vec2        averageColorPerChannel =    vec2(.5, .5); // used for transposition red, green channel
const vec2        colorTranspositionSpread =  vec2(30.5, 8.5);
const float       effectBeginSeconds         =  32;
const float       effectEndSeconds           =  50;

out vec3 color;

// --- Spectral Zucconi --------------------------------------------
// By Alan Zucconi
// Based on GPU Gems: https://developer.nvidia.com/sites/all/modules/custom/gpugems/books/GPUGems/gpugems_ch08.html
// But with values optimised to match as close as possible the visible spectrum
// Fits this: https://commons.wikimedia.org/wiki/File:Linear_visible_spectrum.svg
// With weighter MSE (RGB weights: 0.3, 0.59, 0.11)

float saturate(float x) {
  return min(1.0, max(0.0,x));
}

vec3 saturate (vec3 x) {
  return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
}

vec3 bump3y (vec3 x, vec3 yoffset) {
  vec3 y = vec3(1.,1.,1.) - x * x;
  y = saturate(y-yoffset);
  return y;
}

const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);

const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);

// Based on GPU Gems
// Optimised by Alan Zucconi
vec3 spectral_zucconi6(float x) {
  return
    bump3y(c1 * (x - x1), y1) +
    bump3y(c2 * (x - x2), y2) ;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 cartCoord = (2 * gl_FragCoord.xy - resolution) / min(resolution.x, resolution.y);
  float dist = length(cartCoord);
  float range = clamp(1 - dist, 0, 1);
  vec2 prevCoord = (
    gl_FragCoord.xy
    - (2 * gl_FragCoord.xy - resolution) * centralDispersionRate
  ) / resolution;
  vec2 transpositon;
  if (frame >= (effectBeginSeconds * frameRate) && frame < (effectEndSeconds * frameRate)) {
    transpositon = (texture(tex0, prevCoord).gr - averageColorPerChannel) * colorTranspositionSpread;
    transpositon *= range;
  } else {
    transpositon = vec2(0);
  }
  vec3 videoColor = texture(tex1, vec2(uv.x, 1 - uv.y)).rgb;
  if (frame >= (effectBeginSeconds * frameRate) && frame < (effectEndSeconds * frameRate)) {
    vec3 rainbow = spectral_zucconi6(mod(frame * rainbowCycleSpeed, 1));
    videoColor += rainbow * .3 * range;
    color = color * .9 + videoColor * 0.1;
  } else {
    color = videoColor;
  }
  color = clamp(color, 0, 1);
}
