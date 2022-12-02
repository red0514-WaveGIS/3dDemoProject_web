let weather = {
  Rain: `
    uniform sampler2D colorTexture; //輸入的場景渲染照片
    varying vec2 v_textureCoordinates;

    float hash(float x) { return fract(sin(x * 133.3) * 13.13); } // 著色器

    void main(void) {

        float time = czm_frameNumber / 240.0; //改變降雨的速度
        vec2 resolution = czm_viewport.zw;

        vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
        vec3 c = vec3(.6, .7, .8);

        float a = -.4;
        float si = sin(a), co = cos(a);
        uv *= mat2(co, -si, si, co);
        uv *= length(uv + vec2(0, 4.9)) * .3 + 1.;

        float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);
        float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;
        c *= v * b; //螢幕上雨的顏色

        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), 0.2); //雨和三維場景融合 最後一個參數改變透明度
    }
  `,
  Snow:`
    uniform sampler2D colorTexture; //输入的场景渲染照片
    varying vec2 v_textureCoordinates;
    
    float snow(vec2 uv, float scale) {
        float time = czm_frameNumber / 180.0;
        float w = smoothstep(1., 0., -uv.y * (scale / 10.));
        if (w < .1)
            return 0.;
        uv += time / scale;
        uv.y += time * 2. / scale;
        uv.x += sin(uv.y + time * .5) / scale;
        uv *= scale;
        vec2 s = floor(uv), f = fract(uv), p;
        float k = 3., d;
        p = .5 + .35 * sin(11. * fract(sin((s + p + scale) * mat2(7, 3, 6, 5)) * 5.)) - f;
        d = length(p);
        k = min(d, k);
        k = smoothstep(0., k, sin(f.x + f.y) * 0.01);
        return k * w;
    }
    
    void main(void) {
        vec2 resolution = czm_viewport.zw;
        vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
        vec3 finalColor = vec3(0);
        // float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));
        float c = 0.0;
        c += snow(uv, 30.) * .0;
        c += snow(uv, 20.) * .0;
        c += snow(uv, 15.) * .0;
        c += snow(uv, 10.);
        c += snow(uv, 8.);
        c += snow(uv, 6.);
        c += snow(uv, 5.);
        finalColor = (vec3(c));                                                                      //螢幕上雪的顏色
        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor, 1), 0.2); //雪和三維場景融合 最後一個參數改變透明度
    }
  `,
  Fog: `
    uniform sampler2D colorTexture;
    varying vec2 v_textureCoordinates;
    void main() {
      vec3 finalColor = vec3(1);
      gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor, 1), 0.4);
  }`,
}


export default weather