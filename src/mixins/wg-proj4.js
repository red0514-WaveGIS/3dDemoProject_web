// "proj4": "^2.7.2",
import proj4 from 'proj4'
export default {
  methods: {
    proj4SetDefsTWD97: function () {
      proj4.defs([
        [
          'EPSG:3825',
          '+title=二度分帶：TWD97 TM2 澎湖 +proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs'
        ],
        [
          'EPSG:3826',
          '+title=TWD97 TM2+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs'
        ]
      ])
    },
    proj4EPSG4326ToTWD97: function (point) {
      if(point[0] > 119) {
        return this.proj4EPSG4326ToEPSG3826(point)
      } else {
        return this.proj4EPSG4326ToEPSG3825(point)
      }
      
    },
    proj4EPSG4326ToEPSG3826: function (point) {
      let EPSG4326 = new proj4.Proj('EPSG:4326')
      let EPSG3826 = new proj4.Proj('EPSG:3826')
      return proj4(EPSG4326, EPSG3826, point)
    },
    proj4EPSG4326ToEPSG3825: function (point) {
      let EPSG4326 = new proj4.Proj('EPSG:4326')
      let EPSG3825 = new proj4.Proj('EPSG:3825')
      return proj4(EPSG4326, EPSG3825, point)
    },
  }
}