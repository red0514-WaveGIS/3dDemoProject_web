import Vue from "vue"
import { format as dateFormat } from "date-fns"
Vue.mixin({
  data: () => ({
    validRules: {
      required: value => !!value || "必輸欄位",
      emailFormat: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Invalid e-mail.'
      },
      cellPhoneNumberOfWords: value => value.length == 10 || '需為10碼',
      LongitudeRange: value => value >= 117 && value <= 123 || '已超出有效數值',
      LatitudeRange: value => value >= 21 && value <= 26 || '已超出有效數值',
    },
  }), 
  methods: {
    checkValid: function (validObject) {
      Object.keys(validObject).forEach(key => {
        validObject[key] = this.$refs[key].validate()
      })
    },
    clearValid: function (validObject) {
      Object.keys(validObject).forEach(key => {
        validObject[key] = null
        if(this.$refs[key] !== undefined) {
          this.$refs[key].resetValidation()
        }
      })
    },
    getMeterValueByStakekAndStakem: function (stakek,stakem) {
      return (stakek * 1000) + stakem
    },
    getStakeStringByMeterValue: function (meterValue) {
      return this.getStakekByRoadno(meterValue) + "K+" + this.getStakemByRoadno(meterValue)
    },
    getStakekByRoadno: function (roadno) {
      return Math.floor(roadno / 1000)
    },
    getStakemByRoadno: function (roadno) {
      return roadno % 1000
    },
    checkStakeOrder: function (start,end) {
      return start <= end
    },
    getFileName: function (fileName) {
      let res = ""
      if(fileName !== undefined && fileName != null && fileName != "") {
        if(fileName.indexOf("@@") != -1) {
          let leatFileName = fileName.substring(fileName.lastIndexOf("@@")+2)
          if(leatFileName*1>0){
            res = fileName.substring(0,fileName.indexOf("@@"))
          }else{
            res = leatFileName
          }
        } else {
          res = fileName
        }
      }
      return res
    },
    getFileUrl: function(fileName){
      let host = window.location.host
      let protocol = window.location.protocol
      let url = protocol + "//" + host + "/upload/"+ fileName
      return url
    },
    yyyyMMddHHFomatter: function(datetime) {
      return dateFormat(new Date(this.str2dateForSafari(datetime)),"yyyy-MM-dd-HH")
    },
    changYeartoDateTime: function(year){
      let vidsYear = parseInt(year.replace("年度","")) + 1911
      return [vidsYear+'-01-01 00:00:00',vidsYear+'-12-31 11:59:59']
    },
    stakeFomatter: function(stake) {
      return stake.length > 0 ? stake[0] + "K+" + stake[1] + "~" + stake[2] + "K+" + stake[3] : ""
    },
    getJsonObjectByTgosReturnJsonString: function (tgosReturnJsonString) {
      let start = tgosReturnJsonString.indexOf(`">`) + 2
      let end = tgosReturnJsonString.indexOf(`</`)
      let jsonStr = tgosReturnJsonString.substring(start,end)
      return JSON.parse(jsonStr)
    },
    compareByBuildDatetime: function (a,b) {
      if(new Date(this.str2dateForSafari(a.build_t)) < new Date(this.str2dateForSafari(b.build_t))) {
        return -1
      }
      if(new Date(this.str2dateForSafari(a.build_t)) > new Date(this.str2dateForSafari(b.build_t))) {
        return 1
      }
      return 0
    },
    compareByBuildDatetimeDesc: function (a,b) {
      if(new Date(this.str2dateForSafari(a.build_t)) < new Date(this.str2dateForSafari(b.build_t))) {
        return 1
      }
      if(new Date(this.str2dateForSafari(a.build_t)) > new Date(this.str2dateForSafari(b.build_t))) {
        return -1
      }
      return 0
    },
    compareByUpdateDatetime: function (a,b) {
      if(new Date(this.str2dateForSafari(a.update_t)) < new Date(this.str2dateForSafari(b.update_t))) {
        return -1
      }
      if(new Date(this.str2dateForSafari(a.update_t)) > new Date(this.str2dateForSafari(b.update_t))) {
        return 1
      }
      return 0
    },
    compareByUpdateDatetimeDesc: function (a,b) {
      if(new Date(this.str2dateForSafari(a.update_t)) < new Date(this.str2dateForSafari(b.update_t))) {
        return 1
      }
      if(new Date(this.str2dateForSafari(a.update_t)) > new Date(this.str2dateForSafari(b.update_t))) {
        return -1
      }
      return 0
    },
    checkEditItemOrg: function(item){
      let userEdit =  this.getUserViewEdit('edit')      
      let userOrg1 =  this.$store.state.userInfo.org1s != null &&
                      this.$store.state.userInfo.org1s.length > 0
                        ? this.$store.state.userInfo.org1s[0]
                        : "";
      let userOrg2 =  this.$store.state.userInfo.org2s != null &&
                      this.$store.state.userInfo.org2s.length > 0
                        ? this.$store.state.userInfo.org2s[0]
                        : "";
      let userOrg3 =  this.$store.state.userInfo.org3s != null &&
                      this.$store.state.userInfo.org3s.length > 0
                        ? this.$store.state.userInfo.org3s[0]
                        : "";  
     
      let itemOrg1 = item.org1s !== undefined ? item.org1s[0] : item.org_1
      let itemOrg2 = item.org2s !== undefined ? item.org2s[0] : item.org_2
      let itemOrg3 = item.org3s !== undefined ? item.org3s[0] : item.org_3
      if(userEdit === 'SELF'){       
        if(userOrg1 === itemOrg1 &&
          userOrg2 === itemOrg2 &&
          userOrg3 === itemOrg3){
          return true
        }else{
          return false
        }
      }else if(userEdit === 'UNIT'){    
          if(userOrg1 === itemOrg1 &&
            userOrg2 === itemOrg2 &&
            userOrg3 === itemOrg3 ){
            return true
          }else{
            return false
          }
      }else if(userEdit === 'UNIT_SELF'){        
        if(userOrg3 === ""){
          if(userOrg2 === itemOrg2 || userOrg2 === ""){
            return true
          }else{
            return false
          }
        }else{
          if(userOrg3 === itemOrg3){
            return true
          }else{
            return false
          }
        }        
      }else if(userEdit === "ALL"){
        return true
      }
     
    },
    getUserViewEdit: function(info){
      let rpath = this.$route.path  
      let userInfo = this.$store.state.userInfo.privileges
      let concatUserView = userInfo.map(items =>{
       let list = []
        if(items.children.length > 0){         
          items.children.forEach(datas => {           
            if(datas.children.length > 0){
              datas.children.forEach(data =>{
                if(data.children.length>0){                
                 list.push(data.children)
                }else{
                  list.push(data)
                }
              })
            }else{
              list.push(datas)
            }
          })
        }else{
          list.push(items)
        }
        return list
      })
      let flatUserViewList = [].concat(...concatUserView)
      let findUserView = flatUserViewList.find(item =>{return rpath === item.href})          
      return this.$store.state.userPagePrivileges !== undefined ? this.$store.state.userPagePrivileges[info]:findUserView[info]
    },
    delay(interval) {
      return new Promise((resolve) => {
        setTimeout(resolve, interval)
      })
    },
    str2dateForSafari: function(dateStr){
      if (typeof dateStr === "string") {
        if (dateStr.indexOf(".") > -1) {       
          dateStr = dateStr.substring(0, dateStr.indexOf("."));
        }    
        dateStr = dateStr.replace(new RegExp(/-/gm) ,"/");
        dateStr = dateStr.replace(/T/g ,' ');
        console.log(dateStr)
        return dateStr;
      }
   }
  },
})
