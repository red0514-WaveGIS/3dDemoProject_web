// import { Point } from 'ol/geom'
import { Style, Stroke, Fill, Icon, Text } from "ol/style"
export default {
  red: new Style({
    fill: new Fill({
      color: "rgba(203,67,53,0.2)",
    }),
    stroke: new Stroke({
      color: "rgba(203,67,53,1)",
      width: 1.25,
    }),
  }),
  default: new Style({
    fill: new Fill({
      color: "rgba(51,153,204,0.2)",
    }),
    stroke: new Stroke({
      color: "rgba(51,153,204,1)",
      width: 1.25,
    }),
  }),
  waterVolume: function(feature) {
    let item = feature.getProperties().featureRemark
    let style = new Style({
      text: new Text({
        text: `${item.st_name}`,
        font: '16px sans-serif',
        offsetY: 10,
        fill: new Fill({
          color: 'rgb(255,255,255)'
        }),
        backgroundFill: new Fill({
          color: 'rgb(255,152,0)',
        }),
        padding: [3,5,3,5],
        textAlign: 'left',
        overflow: true
      }),
      image: new Icon({
        anchor: [0.5, 1],
        size: [30, 30],
        opacity: 0.7,
        src: require("@/assets/gis/speed_normal.png"),
      }),
    })
    return style
  },
}
