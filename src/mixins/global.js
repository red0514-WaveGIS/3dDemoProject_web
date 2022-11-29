import Vue from 'vue'
import Moveable from "moveable"
import { format as dateFormat, } from "date-fns"

Vue.mixin({
  methods: {
    switchHtmltoKml: function (url) {
      return new Promise((resolve, reject) => {
        this.$http
          .get(url)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    createUUID: function () {
      let d = Date.now()
      if(typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now() //use high-precision timer if available
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = (d + Math.random() * 16) % 16 | 0
          d = Math.floor(d / 16)
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    },
    copyJsonObject: function (jsonObject) {
      return JSON.parse(JSON.stringify(jsonObject))
    },
    getFormDataByJson: function (json) {
      let res = new FormData()
      Object.entries(json).forEach((key,value) => {
        res.append(key,value)
      })
      return res
    },
    excludeExistedValueFromArr: function (arr) {
      return arr.filter(function(element, index, arr){return arr.indexOf(element) === index})
    },
    handlerPromiseData: function (promise) {
      if(promise) {
        return promise.data
      } else {
        return []
      }
    },
    handleNumberString: function (value) {
      return value.replace(/\D/g,'')
    },
    handleNumberToPositiveInteger: function (value) {
      if(typeof value === 'number') {
        return Math.abs(Math.round(value))
      } else if(typeof value === 'string') {
        let tempValue = value.replace(/\D/g,'')
        if(tempValue.length > 0) {
          tempValue = parseInt(tempValue)
          return Math.abs(Math.round(tempValue))
        } else {
          return 0
        }
      } else {
        return 0
      }
    },
    handleDecimalPlaces: function (value,decimalPlaces) {
      if(typeof value === 'number') {
        return Math.round(value * Math.pow(10,decimalPlaces)) / Math.pow(10,decimalPlaces)
      } else if(typeof value === 'string') {
        // 清除數字 小數點 負號以外的字元
        let tempValue = value.replace(/[^\-\d.]/g,'')
        // 只保留第一個小數點及第一個負號
        tempValue = tempValue.replace(/\.{2,}/g, '.').replace(/-{2,}/g, '-')
        // 將.或-.轉換成0.或-0.
        tempValue = tempValue.replace(/^\./g, '0.').replace(/^-\./, '-0.')
        let regStr = '^(\\-)*(\\d+)\\.(\\d{' + decimalPlaces + '}).*$'
        let reg = new RegExp(regStr)
        if(decimalPlaces > 0) {
          tempValue = tempValue.replace(reg, '$1$2.$3')
        } else {
          tempValue = tempValue.replace(reg, '$1$2')
        }
        return tempValue
      } else {
        return 0
      }
    },
    compareById: function (a,b) {
      if(a.id < b.id) {
        return -1
      }
      if(a.id > b.id) {
        return 1
      }
      return 0
    },
    compareByDatetime: function (a,b) {
      if(new Date(a.datatime) < new Date(b.datatime)) {
        return -1
      }
      if(new Date(a.datatime) > new Date(b.datatime)) {
        return 1
      }
      return 0
    },
    compareByDatetimeDesc: function (a,b) {
      if(new Date(a.datatime) < new Date(b.datatime)) {
        return 1
      }
      if(new Date(a.datatime) > new Date(b.datatime)) {
        return -1
      }
      return 0
    },
    compareByRanking: function (a,b) {
      if(a.ranking < b.ranking) {
        return -1
      }
      if(a.ranking > b.ranking) {
        return 1
      }
      return 0
    },
    handleDownloadFile: function (fileName,fileData) {
      let url = window.URL.createObjectURL(new Blob([fileData]))
      let link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    getLastDaysCompo: function (day) {
      let currentTime = ""
      let date = new Date()
      date.setDate(date.getDate() - day)
      currentTime = dateFormat(
        date,
        "yyyy-MM-dd"
        // "yyyy-MM-dd HH:mm:ss"
      )
      return currentTime
    },
    getCurrentTimeCompo: function () {
      let currentTime = ""
      currentTime = dateFormat(
        new Date(),
        "yyyy-MM-dd"
        // "yyyy-MM-dd HH:mm:ss"
      )
      return currentTime
    },
    getCurrentTimeSecondCompo: function () {
      let currentTime = ""
      currentTime = dateFormat(
        new Date(),
        // "yyyy-MM-dd"
        "yyyy-MM-dd HH:mm:ss"
      )
      return currentTime
    },
  },
  directives: {
    generalDrag: {
      bind: function (el,binding) {
        let moveable = new Moveable(document.body,{
          target: el,
          draggable: binding.value === undefined ? true : binding.value,
          throttleDrag: 0,
          startDragRotate: 0,
          throttleDragRotate: 0,
          zoom: 0,
          origin: true,
          padding: {"left":0,"top":0,"right":0,"bottom":0},
        })
        let frame = {
          translate: [0,0],
        }
        moveable.on("dragStart", e => {
          e.set(frame.translate)
        }).on("drag", ({ target, beforeTranslate }) => {
          target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`
        }).on("dragEnd", ({ lastEvent }) => {
          if (lastEvent) {
            frame.translate = lastEvent.beforeTranslate
          }
        })
        el.__moveable__ = moveable
      },
      update: function (el,binding) {
        if(binding.value !== undefined) {
          el.__moveable__.draggable = binding.value
        }
      },
      unbind: function (el) {
        el.__moveable__.destroy()
      },
    }
  }
})