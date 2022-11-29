// "ol": "^6.5.0",
import 'ol/ol.css'
import { Map, View, Feature } from 'ol'
import { Tile, Vector as LayerVector, Image as ImageLayer } from 'ol/layer'
import { XYZ, Vector as SourceVector, OSM, ImageStatic as Static } from 'ol/source'
import Overlay from 'ol/Overlay'
import { transform as Transform, Projection } from 'ol/proj'
import { Point, Circle as GeomCircle, LineString } from 'ol/geom'
import CustomStyles from '@/plugins/wg-ol-plugin/custom-styles.js'
import { Draw, Modify, DragRotateAndZoom, defaults as defaultInteractions,} from 'ol/interaction'
import { createBox } from 'ol/interaction/Draw'
import { FullScreen } from 'ol/control'
import { getCenter } from 'ol/extent'
import { GeoJSON, KML } from 'ol/format'
export default {
  data: () => ({
    maps: {},
    layers: {},
    overlays: {},
    interactions: {},
    customStyles: CustomStyles,
    baseSources: {
      standardRoadMap: { cName: "Google標準地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      somehowAlteredRoadMap: { cName: "Google標準地圖2", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      hybrid: { cName: "Google衛星地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      satelliteOnly: { cName: "Google純衛星地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      terrain: { cName: "Google等高線地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      terrainOnly: { cName: "Google純等高線地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      roadsOnly: { cName: "Google道路地圖", source: new XYZ({ url: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}", crossOrigin: "anonymous" }) },
      osm: { cName: "OpenStreetMap開放街圖地圖", source: new OSM() },
      TGOSMAP_W: { cName: "TGOS電子地圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=TGOSMAP_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      NLSCMAP_W: { cName: "通用版電子地圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=NLSCMAP_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      F2IMAGE_W: { cName: "福衛二號影像", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=F2IMAGE_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      ROADMAP_W: { cName: "福衛二號混合圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=ROADMAP_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      HILLSHADEMIX_W: { cName: "地形暈渲混合圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=HILLSHADEMIX_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      HILLSHADE_W: { cName: "地形暈渲圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=HILLSHADE_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
      MOTCMAP_W: { cName: "路網數值圖", source: new XYZ({ url: "https://gis.sinica.edu.tw/tgos/file-exists.php?img=MOTCMAP_W-png-{z}-{x}-{y}", crossOrigin: "anonymous" }) },
    },
  }),
  methods: {
    // map
    initMap: function (targetId,center,zoom,baseSourceId) {
      let tempZoom = 13
      if(zoom !== undefined && zoom != null && zoom != "" && zoom != 0) {
        tempZoom = zoom
      }
      let tempBaseSourceId = this.mapRadio
      if(baseSourceId !== undefined && baseSourceId != null && baseSourceId != "" && this.baseSources[baseSourceId] !== undefined) {
        tempBaseSourceId = baseSourceId
      }
      this.layers[targetId] = {
        baseLayer: new Tile({
          name: "baseLayer",
          source: this.baseSources[tempBaseSourceId].source
        })
      }
      this.maps[targetId] = new Map({
        target: targetId,
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers: [
          this.layers[targetId]["baseLayer"]
        ],
        view: new View({
          center: center,
          zoom: tempZoom
        })
      })
    },
    initImageMap: function (targetId,url,maxZoom,doFunc) {
      let currentThis = this
      let img = new Image()
      img.onload = function () {
        let dom = document.getElementById(targetId)
        let imgWidth = this.width
        let imgHeight = this.height
        let domWidth = dom.clientWidth
        let domHeight = dom.clientHeight
        let extent = [0,0,imgWidth,imgHeight]
        let viewExtent = currentThis.getImageViewExtentByImgWidthAndImgHeightAndDomWidthAndDomHeight(imgWidth,imgHeight,domWidth,domHeight)
        let projection = new Projection({
          code: "xkcd-image",
          units: "pixels",
          extent: extent,
        })
        currentThis.layers[targetId] = {
          baseImageLayer: new ImageLayer({
            name: "baseImageLayer",
            source: new Static({
              url: url,
              projection: projection,
              imageExtent: extent,
            })
          })
        }
        currentThis.maps[targetId] = new Map({
          target: targetId,
          layers: [
            currentThis.layers[targetId]["baseImageLayer"]
          ],
          view: new View({
            projection: projection,
            center: getCenter(extent),
            extent: viewExtent,
            zoom: 1,
            maxZoom: maxZoom,
          })
        })
        doFunc()
      }
      img.src = url
    },
    reloadMap: function (targetId) {
      if (this.maps[targetId] !== undefined) {
        this.maps[targetId].updateSize()
      }
      if (this.overlays[targetId] !== undefined) {
        Object.values(this.overlays[targetId]).forEach( overlay => {
          if(overlay.overlayObj !== undefined) {
            overlay.overlayObj.setPosition(undefined)
          }
        })
      }
    },
    reloadImageMap: function (targetId,url) {
      if(this.maps[targetId] !== undefined) {
        let currentThis = this
        let img = new Image()
        img.onload = function () {
          let dom = document.getElementById(targetId)
          let imgWidth = this.width
          let imgHeight = this.height
          let domWidth = dom.clientWidth
          let domHeight = dom.clientHeight
          let viewExtent = currentThis.getImageViewExtentByImgWidthAndImgHeightAndDomWidthAndDomHeight(imgWidth,imgHeight,domWidth,domHeight)
          currentThis.setViewExtent(targetId,viewExtent)
          currentThis.maps[targetId].updateSize()
          if(currentThis.overlays[targetId] !== undefined) {
            Object.values(currentThis.overlays[targetId]).forEach( overlay => {
              if(overlay.overlayObj !== undefined) {
                overlay.overlayObj.setPosition(undefined)
              }
            })
          }
        }
        img.src = url
      }
    },
    checkMapIsExist: function (targetId) {
      if(this.maps[targetId] !== undefined && this.maps[targetId] != null){
        return true
      } else {
        return false
      }
    },
    // control
    setFullScreenControl: function (targetId) {
      this.maps[targetId].addControl(new FullScreen({
        source: 'wrapMap'
      }))
    },
    // view
    getViewByMapId: function (targetId) {
      return this.maps[targetId].getView()
    },
    getViewCenter: function (targetId) {
      return this.maps[targetId].getView().getCenter()
    },
    setViewCenter: function (targetId,center) {
      let currentZoomNum = this.maps[targetId].getView().getZoom()
      this.maps[targetId].getView().fit(new Point(center),{ maxZoom: currentZoomNum, duration: 300 })
    },
    setViewCenterViewZoom: function (targetId,center,room) {
      this.maps[targetId].getView().fit(new Point(center),{ maxZoom: room, duration: 300 })
    },
    setCenterBySource: function (targetId,source) {
      let tempSize = this.maps[targetId].getSize()
      tempSize = [tempSize[0] * 0.4, tempSize[1] * 0.1]
      this.maps[targetId].getView().fit(source.getExtent(),{ size: tempSize, duration: 1000 })
    },
    setViewZoom: function (targetId,zoomNum) {
      this.maps[targetId].getView().setZoom(zoomNum)
    },
    setViewExtent: function (targetId,viewExtent) {
      if(this.maps[targetId] !== undefined) {
        let oldView = this.maps[targetId].getView()
        this.maps[targetId].setView(
          new View({
            projection: oldView.getProjection(),
            center: oldView.getCenter(),
            extent: viewExtent,
            zoom: 1,
            maxZoom: oldView.getMaxZoom(),
          })
        )
      }
    },
    setViewMaxZoom: function (targetId,zoomNum) {
      this.maps[targetId].getView().setMaxZoom(zoomNum)
    },
    getUnit: function (targetId) {
      return this.maps[targetId].getView().getProjection().getUnits()
    },
    // layer
    initVectorLayer: function (targetId,layerName,source) {
      this.layers[targetId][layerName] = new LayerVector({
        name: layerName,
        source: source,
        style: this.customStyleFunction
      })
      this.setLayerByLayerName(targetId,layerName)
    },
    setLayerByLayerName: function (targetId,layerName) {
      this.maps[targetId].addLayer(this.layers[targetId][layerName])
    },
    setImageLayerByLayerName: function (targetId,layerName,url,point,zoom) {
      let img = new Image()
      img.src = url
      let currentThis = this
      img.onload = function () {
        if(currentThis.layers[targetId][layerName] !== undefined) {
          let source = new Static({
            url: url,
            imageExtent: [
              point[0] - img.width * zoom,
              point[1] - img.height * zoom,
              point[0] + img.width * zoom,
              point[1] + img.height * zoom
            ],
          })
          currentThis.layers[targetId][layerName].setSource(source)
        }else {
          currentThis.layers[targetId][layerName] = new ImageLayer({
            name: layerName,
            source: new Static({
              url: url,
              imageExtent: [
                point[0] - img.width * zoom,
                point[1] - img.height * zoom,
                point[0] + img.width * zoom,
                point[1] + img.height * zoom
              ],
            })
          })
          currentThis.setLayerByLayerName(targetId,layerName)
        }
      }
    },
    getAllLayer: function (targetId) {
      return this.maps[targetId].getLayers()
    },
    getLayerByLayerName: function (targetId,layerName) {
      return this.layers[targetId][layerName]
    },
    setLayerVisibleByLayerName: function (targetId,layerName,visible) {
      if(this.layers[targetId][layerName] != undefined) {
        this.layers[targetId][layerName].setVisible(visible)
      }
    },
    checkLayerIsExist: function (targetId,layerName) {
      if(this.layers[targetId] !== undefined && this.layers[targetId] != null && this.layers[targetId][layerName] !== undefined && this.layers[targetId][layerName] !== null){
        return true
      } else {
        return false
      }
    },
    setLayerZindexByLayerName: function (targetId,layerName,zindex) {
      this.layers[targetId][layerName].setZIndex(zindex)
    },
    removeLayerByLayerName: function (targetId,layerName) {
      this.maps[targetId].removeLayer(this.layers[targetId][layerName])
    },
    // overlay
    getOverlayByOverlayName: function (targetId,overlayName) {
      return this.overlays[targetId][overlayName].overlayObj
    },
    setOverlayMap: function (targetId,overlayName,elementId) {
      if(!this.overlays[targetId]) {
        this.overlays[targetId] = {}
      }
      this.overlays[targetId][overlayName] = {
        elementId: elementId,
        overlayObj: new Overlay({
          id: elementId,
          element: document.getElementById(elementId),
          positioning: 'bottom-center',
          stopEvent: true,
          offset: [0, -10],
        })
      }
      this.maps[targetId].addOverlay(this.overlays[targetId][overlayName].overlayObj)
    },
    getOverlayPosition: function (targetId,overlayName) {
      if(this.overlays[targetId] !== undefined && this.overlays[targetId][overlayName] !== undefined) {
        return this.getOverlayByOverlayName(targetId,overlayName).getPosition()
      } else {
        return null
      }
    },
    setOverlayPositioning: function (targetId,overlayName,positioning) {
      this.getOverlayByOverlayName(targetId,overlayName).setPositioning(positioning)
    },
    setOverlayOffset: function (targetId,overlayName,offset) {
      this.getOverlayByOverlayName(targetId,overlayName).setOffset(offset)
    },
    setOverlayPosition: function (targetId,overlayName,position) {
      this.getOverlayByOverlayName(targetId,overlayName).setPosition(position)
    },
    removeOverlayByOverlayName: function (targetId,overlayName) {
      this.maps[targetId].removeOverlay(overlayName)
    },
    // source
    initVectorSource: function () {
      return new SourceVector()
    },
    getBaseSourceByBaseSourceId: function (baseSourceId) {
      return this.baseSources[baseSourceId]
    },
    getSourceByLayerName: function (targetId,layerName) {
      return this.layers[targetId][layerName].getSource()
    },
    setBaseSourceByBaseSourceId: function (targetId,baseSourceId) {
      let tempBaseSource = this.getBaseSourceByBaseSourceId(baseSourceId)
      if(tempBaseSource !== undefined && tempBaseSource != null && tempBaseSource.source !== undefined) {
        this.layers[targetId]["baseLayer"].setSource(tempBaseSource.source)
      } else {
        console.warn("no base source")
      }
    },
    setBaseImageSourceByUrl: function (targetId,url,maxZoom) {
      let currentThis = this
      let img = new Image()
      img.onload = function () {
        let dom = document.getElementById(targetId)
        let imgWidth = this.width
        let imgHeight = this.height
        let domWidth = dom.clientWidth
        let domHeight = dom.clientHeight
        let extent = [0,0,imgWidth,imgHeight]
        let viewExtent = currentThis.getImageViewExtentByImgWidthAndImgHeightAndDomWidthAndDomHeight(imgWidth,imgHeight,domWidth,domHeight)
        let projection = new Projection({
          code: "xkcd-image",
          units: "pixels",
          extent: extent,
        })
        currentThis.layers[targetId]["baseImageLayer"].setSource(
          new Static({
            url: url,
            projection: projection,
            imageExtent: extent,
          })
        )
        currentThis.maps[targetId].setView(new View({
          projection: projection,
          center: getCenter(extent),
          extent: viewExtent,
          zoom: 1,
          maxZoom: maxZoom,
        }))
      }
      img.src = url
    },
    // networklinks
    getNetworkLinksByKml: function (kmlString) {
      return new KML().readNetworkLinks(kmlString.trim())
    },
    // feature
    getFeaturesByGeoJsonObject: function (geoJsonObject) {
      return new GeoJSON().readFeatures(geoJsonObject,{dataProjection: "EPSG:4326", featureProjection: "EPSG:3857"})
    },
    getFeaturesByKml: function (kmlString) {
      return new KML().readFeatures(kmlString.trim(),{dataProjection: "EPSG:4326", featureProjection: "EPSG:3857"})
    },
    getOriginalFeaturesByKml: function (kmlString) {
      return new KML().readFeatures(kmlString.trim())
    },
    // export Kml
    getKml: function (targetId,LayerName,fileName) {
      let kml = new KML().writeFeatures(this.getAllFeatureByLayerName(targetId,LayerName), {featureProjection: this.maps[targetId].getView().getProjection()})
      this.handleDownloadFile(fileName,kml)
    },
    getKmlByFeatures: function (targetId,features,fileName) {
      let kml = new KML().writeFeatures(features, {featureProjection: this.maps[targetId].getView().getProjection()})
      this.handleDownloadFile(fileName,kml)
    },
    getGeoJsonObjectByLayerName: function (targetId,LayerName) {
      return new GeoJSON().writeFeatures(this.getAllFeatureByLayerName(targetId,LayerName),{dataProjection: "EPSG:4326", featureProjection: "EPSG:3857"})
    },
    clearAllFeatureByLayerName: function (targetId,LayerName) {
      let tempL = this.getLayerByLayerName(targetId,LayerName)
      if(tempL !== undefined) {
        tempL.getSource().clear()
      }
    },
    getAllFeatureByLayerName: function (targetId,LayerName) {
      return this.getSourceByLayerName(targetId,LayerName).getFeatures()
    },
    clearFeatureStyle: function (feature) {
      feature.setStyle(null)
    },
    setFeatureAttr: function (feature,attrObj) {
      feature.setProperties(attrObj)
    },
    setFeatureGeom: function (targetId,feature,layerName) {
      feature.getGeometry().set('altitudeMode', 'clampToGround')
      if(layerName !== undefined && layerName != null && layerName != "") {
        if(this.layers[targetId][layerName] !== undefined) {
          this.layers[targetId][layerName].getSource().addFeature(feature)
        } else {
          this.layers[targetId][layerName] = new LayerVector({
            layerName: layerName,
            source: new SourceVector({
              features: [feature]
            }),
            style: this.customStyleFunction
          })
          this.maps[targetId].addLayer(this.layers[targetId][layerName])
        }
      } else {
        if(this.layers[targetId]["defaultLayer"] !== undefined) {
          this.layers[targetId]["defaultLayer"].getSource().addFeature(feature)
        } else {
          this.layers[targetId]["defaultLayer"] = new LayerVector({
            name: "defaultLayer",
            source: new SourceVector({
              features: [feature]
            }),
            style: this.customStyleFunction
          })
          this.maps[targetId].addLayer(this.layers[targetId]["defaultLayer"])
        }
      }
    },
    setCircleFeature: function (targetId,circleCenter,circleRadius,styleRemark,layerName,featureRemark) {
      let circleFeature = new Feature({
        geometry: new GeomCircle(circleCenter,circleRadius),
        styleRemark: styleRemark,
        featureRemark: featureRemark,
        layerName: layerName
      })
      this.setFeatureGeom(targetId,circleFeature,layerName)
    },
    setPointFeature: function(targetId,pointCenter,styleRemark,layerName,featureRemark) {
      let pointFeature = new Feature({
        geometry: new Point(pointCenter),
        styleRemark: styleRemark,
        featureRemark: featureRemark,
        layerName: layerName,
      })
      this.setFeatureGeom(targetId,pointFeature,layerName)
    },
    setLineFeature: function(targetId,points,styleRemark,layerName,featureRemark) {
      let lineFeature = new Feature({
        geometry: new LineString(points),
        styleRemark: styleRemark,
        featureRemark: featureRemark,
        layerName: layerName
      })
      this.setFeatureGeom(targetId,lineFeature,layerName)
    },
    setCustomStyleFeature: function (feature, styleRemark) {
      feature.set("styleRemark", styleRemark)
      feature.setStyle(null)
      this.customStyleFunction(feature)
    },
    // style
    customStyleFunction: function (feature,resolution) {
      let resStyle = this.customStyles["default"]
      let tempSR = feature.getProperties().styleRemark
      if(tempSR !== undefined) {
        resStyle = this.customStyles[tempSR]
      }
      if(resStyle !== undefined) {
        if(typeof resStyle == "function") {
          if(Array.isArray(resStyle(feature,resolution))) {
            return resStyle(feature,resolution)
          } else {
            return resStyle(feature,resolution)
          }
        } else {
          return [resStyle]
        }
      } else {
        return [this.customStyles["default"]]
      }
    },
    // interaction
    setInteractionMap: function (targetId,layerName,funObj,interactionType) {
      let tempSource = null
      if(layerName !== undefined && layerName != null && layerName != "") {
        if(this.layers[targetId][layerName] !== undefined) {
          tempSource = this.layers[targetId][layerName].getSource()
        } else {
          tempSource = new SourceVector({wrapX: false})
          this.layers[targetId][layerName] = new LayerVector({
            name: layerName,
            source: tempSource,
          })
          this.maps[targetId].addLayer(this.layers[targetId][layerName])
        }
      } else {
        if(this.layers[targetId]["defaultLayer"] !== undefined) {
          tempSource = this.layers[targetId]["defaultLayer"].getSource()
        } else {
          tempSource = new SourceVector({wrapX: false})
          this.layers[targetId]["defaultLayer"] = new LayerVector({
            name: "defaultLayer",
            source: tempSource,
          })
          this.maps[targetId].addLayer(this.layers[targetId]["defaultLayer"])
        }
      }
      let draw = undefined
      if (interactionType == "Box") {
        draw = new Draw({
          source: tempSource,
          type: "Circle",
          geometryFunction: createBox(),
        })
      } else {
        draw = new Draw({
          source: tempSource,
          type: interactionType,
        })
      }
      draw.on("drawend",function (e) {
        if(funObj !== undefined && funObj.setCenterFun !== undefined) {
          funObj.setCenterFun(e.feature.getGeometry().getCenter())
        }
        if(funObj !== undefined && funObj.setRadiusFun !== undefined) {
          funObj.setRadiusFun(e.feature.getGeometry().getRadius())
        }
        if(funObj !== undefined && funObj.doAfterFun !== undefined) {
          funObj.doAfterFun(e.feature)
        }
      })
      if(this.interactions[targetId] === undefined) {
        this.interactions[targetId] = {}
      }
      this.interactions[targetId][interactionType] = draw
      this.maps[targetId].addInteraction(draw)
    },
    setModifyInteraction: function (targetId,layerName) {
      let tempSource = this.getSourceByLayerName(targetId,layerName)
      let modify = new Modify({source:tempSource})
      if(this.interactions[targetId] === undefined) {
        this.interactions[targetId] = {}
      }
      this.interactions[targetId]["Modify"] = modify
      this.maps[targetId].addInteraction(modify)
    },
    clearAllInteraction: function (targetId) {
      let tempMap = this.maps[targetId]
      if (this.interactions[targetId] !== undefined && this.interactions[targetId] != null) {
        Object.values(this.interactions[targetId]).forEach( interaction => {
          tempMap.removeInteraction(interaction)
        })
      }
      this.interactions[targetId] = {}
    },
    // event
    setMapChangeEvent: function (targetId,doFunc) {
      this.maps[targetId].on("change",doFunc)
    },
    setMapMoveEndEvent: function (targetId,doFunc) {
      this.maps[targetId].on("moveend",doFunc)
    },
    setMapPointerMoveEvent: function (targetId,doFunc) {
      this.maps[targetId].on('pointermove',doFunc)
    },
    setMapClickEvent: function (targetId,doFunc) {
      this.maps[targetId].on('click',doFunc)
    },
    setMapSingleClickEvent: function (targetId,doFunc) {
      this.maps[targetId].on('singleclick',doFunc)
    },
    setViewChangeEvent: function (targetId,doFunc) {
      this.getViewByMapId(targetId).on("change",doFunc)
    },
    setFeatureClickEvent: function(targetId,overlayName,doFunc) {
      let currentThis = this
      this.maps[targetId].on('click', function(evt){
        let feature = currentThis.maps[targetId].forEachFeatureAtPixel(evt.pixel, function(feature){
          return feature
        })
        let tempOverlay = currentThis.overlays[targetId][overlayName]
        if(feature){
          let coordinates = feature.getGeometry().getCoordinates()
          if (doFunc.hasFeature !== undefined) {
            doFunc.hasFeature(tempOverlay.elementId, feature)
          }
          switch(feature.getGeometry().getType()) {
            case "Point":
              break
            case "Circle":
              coordinates = feature.getGeometry().getCenter()
              break
            default:
              evt.coordinate.push(0)
              coordinates = evt.coordinate
              break
          }
          tempOverlay.overlayObj.setPosition(coordinates)
        } else {
          if (doFunc.noFeature !== undefined) {
            doFunc.noFeature(tempOverlay.elementId)
          }
          tempOverlay.overlayObj.setPosition(undefined)
        }
      })
    },
    setFeatureClickDeleteEvent: function (targetId) {
      let currentThis = this
      this.maps[targetId].on('click', function(evt){
        let feature = currentThis.maps[targetId].forEachFeatureAtPixel(evt.pixel, function(feature){
          return feature
        })
        if(feature){
          console.log(evt)
          console.log(feature)
        }
      })
    },
    setModifyInteractionModifyEndEvent: function (targetId,doFunc) {
      this.interactions[targetId]["Modify"].on('modifyend',doFunc)
    },
    // transform
    EPSG4326ToEPSG3857: function (point) {
      return Transform(point, 'EPSG:4326', 'EPSG:3857')
    },
    EPSG4326ToTWD97: function (point) {
      if(point[0] > 119) {
        return this.EPSG4326ToEPSG3826(point)
      } else {
        return this.EPSG4326ToEPSG3825(point)
      }
    },
    EPSG4326ToEPSG3826: function (point) {
      let tr_lng = point[0]
      let tr_lat = point[1]
      // 臺灣本島
      let DEG_RAD = 0.01745329251994329572
      let central = 121
      let TWD97_A = 6378137.0
      let TWD97_ECC = 0.00669438002290
      let TWD97_ECC2 = 0.00673949677556
      let TWD97_TM2 = 0.9999
      let offset = 250000

      let x0 = tr_lng * DEG_RAD
      let y0 = tr_lat * DEG_RAD
      let x1 = central * DEG_RAD
      let y1 = 0
      let m0 = this.mercator(y1, TWD97_A, TWD97_ECC)
      let m1 = this.mercator(y0, TWD97_A, TWD97_ECC)
      let n = TWD97_A / Math.sqrt(1 - TWD97_ECC * Math.pow(Math.sin(y0), 2.0))
      let t = Math.pow(Math.tan(y0), 2.0)
      let c = TWD97_ECC2 * Math.pow(Math.cos(y0), 2.0)
      let A = (x0 - x1) * Math.cos(y0)
      let X_LNG = TWD97_TM2 * n * (A + (1.0 - t + c) * A * A * A / 6.0 + (5.0 - 18.0 * t + t * t + 72.0 * c - 58.0 * TWD97_ECC2) * Math.pow(A, 5.0) / 120.0) + offset
      let Y_LAT = TWD97_TM2 * (m1 - m0 + n * Math.tan(y0) * (A * A / 2.0 + (5.0 - t + 9.0 * c + 4 * c * c) * Math.pow(A, 4.0) / 24.0 + (61.0 - 58.0 * t + t * t + 600.0 * c - 330.0 * TWD97_ECC2) * Math.pow(A, 6.0) / 720.0))
      return [X_LNG,Y_LAT]
    },
    EPSG4326ToEPSG3825: function (point) {
      let tr_lng = point[0]
      let tr_lat = point[1]
      // 澎湖金門馬祖
      let DEG_RAD = 0.01745329251994329572
      let central = 119
      let TWD97_A = 6378137.0
      let TWD97_ECC = 0.00669438002290
      let TWD97_ECC2 = 0.00673949677556
      let TWD97_TM2 = 0.9999
      let offset = 250000

      let x0 = tr_lng * DEG_RAD
      let y0 = tr_lat * DEG_RAD
      let x1 = central * DEG_RAD
      let y1 = 0
      let m0 = this.mercator(y1, TWD97_A, TWD97_ECC)
      let m1 = this.mercator(y0, TWD97_A, TWD97_ECC)
      let n = TWD97_A / Math.sqrt(1 - TWD97_ECC * Math.pow(Math.sin(y0), 2.0))
      let t = Math.pow(Math.tan(y0), 2.0)
      let c = TWD97_ECC2 * Math.pow(Math.cos(y0), 2.0)
      let A = (x0 - x1) * Math.cos(y0)
      let X_LNG = TWD97_TM2 * n * (A + (1.0 - t + c) * A * A * A / 6.0 + (5.0 - 18.0 * t + t * t + 72.0 * c - 58.0 * TWD97_ECC2) * Math.pow(A, 5.0) / 120.0) + offset
      let Y_LAT = TWD97_TM2 * (m1 - m0 + n * Math.tan(y0) * (A * A / 2.0 + (5.0 - t + 9.0 * c + 4 * c * c) * Math.pow(A, 4.0) / 24.0 + (61.0 - 58.0 * t + t * t + 600.0 * c - 330.0 * TWD97_ECC2) * Math.pow(A, 6.0) / 720.0))
      return [X_LNG,Y_LAT]
    },
    EPSG3857ToEPSG4326: function (point) {
      return Transform(point, 'EPSG:3857', 'EPSG:4326')
    },
    mercator: function (y, a, ecc) {
      // 橫麥卡托(Transverse Mercator)
      if (y == 0.0) {
        return 0.0
      } else {
        return a * ((1.0 - ecc / 4.0 - 3.0 * ecc * ecc / 64.0 - 5.0 * ecc * ecc * ecc / 256.0) * y - (3.0 * ecc / 8.0 + 3.0 * ecc * ecc / 32.0 + 45.0 * ecc * ecc * ecc / 1024.0) * Math.sin(2.0 * y) + (15.0 * ecc * ecc / 256.0 + 45.0 * ecc * ecc * ecc / 1024.0) * Math.sin(4.0 * y) - (35.0 * ecc * ecc * ecc / 3072.0) * Math.sin(6.0 * y))
      }
    },
    // check
    checkPopupPositioning: function (x,y,x1,y1,x2,y2) {
      let resX = "right"
      let resY = "top"
      if(Math.abs(x1 - x) < Math.abs(x2 - x)) {
        resX = "left"
      }
      if(Math.abs(y1 - y) < Math.abs(y2 - y)) {
        resY = "bottom"
      }
      return resY + "-" + resX
    },
    // extent
    getImageViewExtentByImgWidthAndImgHeightAndDomWidthAndDomHeight: function (imgWidth,imgHeight,domWidth,domHeight) {
      let resWidth = imgHeight * (domWidth/domHeight)
      let resHeight = imgWidth * (domHeight/domWidth)
      if (resWidth > imgWidth) {
        let wMargin = (resWidth - imgWidth) / 2
        return [0-wMargin,0,imgWidth+wMargin,imgHeight]
      } else if (resHeight > imgHeight) {
        let hMargin = (resHeight - imgHeight) / 2
        return [0,0-hMargin,imgWidth,imgHeight+hMargin]
      } else {
        return [0,0,imgWidth,imgHeight]
      }
    },
    // export image
    getPixelByMapIdAndCoordinate: function (targetId,coordinate) {
      return this.maps[targetId].getPixelFromCoordinate(coordinate)
    },
    getImage: function (targetId,fileName,sourceX,sourceY,sourceWidth,sourceHeight) {
      let customSize = sourceX !== undefined && sourceY !== undefined && sourceWidth !== undefined && sourceHeight !== undefined
      let currentThis = this
      this.maps[targetId].once("rendercomplete", function () {
        let mapCanvas = document.createElement("canvas")
        if (customSize) {
          mapCanvas.width = sourceWidth
          mapCanvas.height = sourceHeight
        } else {
          let size = currentThis.maps[targetId].getSize()
          mapCanvas.width = size[0]
          mapCanvas.height = size[1]
        }
        let mapContext = mapCanvas.getContext("2d")
        Array.prototype.forEach.call(
          document.querySelectorAll("#" + targetId + " .ol-layer canvas"),
          function (canvas) {
            if (canvas.width > 0) {
              let opacity = canvas.parentNode.style.opacity
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity)
              let transform = canvas.style.transform
              let matrix = transform.match(/^matrix\(([^(]*)\)$/)[1].split(",").map(Number)
              CanvasRenderingContext2D.prototype.setTransform.apply(mapContext,matrix)
              if (customSize) {
                mapContext.drawImage(canvas,sourceX,sourceY,sourceWidth,sourceHeight,0,0,sourceWidth,sourceHeight)
              } else {
                mapContext.drawImage(canvas,0,0)
              }
            }
          }
        )
        currentThis.handleDownloadImage(fileName,mapCanvas.toDataURL())
      })
      this.maps[targetId].renderSync()
    }
  }
}