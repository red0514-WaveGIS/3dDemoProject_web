export default {
    data: () => ({
        apiPath: "/api/8899/wragovcloud_ws",
        waterExtraApiPath: "/api/javaapi/water_extra_api",
        waterApiPath: "/api/8210/water",
      }),
    methods: {
        // 獲取泥沙濃度資料
        getWaterQualityList: function (org_id) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.apiPath + '/audix/waterquality/getWaterQualityList',{
                params: {
                    org_id: org_id,
                    display: "",
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getWaterQualityLog: function (org_id, uid, time) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.apiPath + '/audix/waterquality/getWaterQualityLog',{
                params: {
                    starttime: time[0] + ' 00:00:00',
                    endtime: time[1] + ' 23:59:59',
                    uid: uid,
                    org_id: org_id,
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getWaterSpeedList: function (org_id) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.apiPath + '/audix/getWaterSpeedList',{
                params: {
                    org_id: org_id,
                    display: "",
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        // 取得水位流速歷史資料
        getWaterSpeedLogs: function (org_id, uid, time) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.apiPath + '/audix/getWaterSpeedLog',{
                params: {
                    starttime: time[0] + ' 00:00:00',
                    endtime: time[1] + ' 23:59:59',
                    uid: uid,
                    org_id: org_id,
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        insertCctvGroup: function (cctvDataInsert) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.waterExtraApiPath + '/cctv/insertCctvGroup',cctvDataInsert)
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        deleteCctvGroup: function (cctvDataDelete) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.waterExtraApiPath + '/cctv/deleteCctvGroup',
                    `cctv_no=${cctvDataDelete.cctv_no}&group_no=${cctvDataDelete.group_no}&org_id=${cctvDataDelete.org_id}`
                )
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        insertGroup: function (cctvDataInsert) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.waterExtraApiPath + '/cctv/insertGroup',cctvDataInsert)
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        deleteGroup: function (cctvDataDelete) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.waterExtraApiPath + '/cctv/deleteGroup',cctvDataDelete)
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        // 獲取某單位水位計全部資訊
        getAllWaterLevelInfo: function (org_id) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterExtraApiPath + '/flood/getFloodListData',{
                params: {
                        org_id: org_id,
                        type: "water",
                        supplier: 10,
                        unit: 1
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        getFloodLogTime: function (org_id, st_no, time) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterExtraApiPath + '/flood/getFloodLogTime',{
                params: {
                        org_id: org_id,
                        st_no: st_no,
                        starttime: time[0] + ' 00:00:00',
                        endtime: time[1] + ' 23:59:59',
                        unit: 1
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        // 取得水位預報歷史資料
        getWaterForcastLog: function (org_id, st_no) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterExtraApiPath + '/water/getWaterForcastLog',{
                params: {
                        org_id: org_id,
                        st_no: st_no,
                    }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        // 編輯水位警戒值
        postWarnData: function (params) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.waterApiPath + '/flood/postWarnData', params)
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        // 取得淹水預測即時資料
        getFloodForecast_list: function (hour) {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterApiPath + '/flood/getFloodForecast_list',{
                params: {
                    org_id: 69,
                    hour: hour,
                    kmlok: 1,
                    flood: 1
                  }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        // 取得中央即時水位監測資料
        getWaterLevelList: function () {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterExtraApiPath + '/flood/getFloodListData',{
                params: {
                    basin: 1510,
                    org_data: 'SELF',
                    org_id: 42,
                    source: 'CENTER',
                    strata: 0,
                    type: 'water',
                    audix: 0,
                    unit: 1,
                  }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        // 取得取得沖刷粒子即時資料
        getParticle: function () {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterApiPath + '/misc/getFloatBedload',{
                params: {
                    type: 'float'
                  }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
        // 取得取得底床即時資料
        getRiverBed: function () {
            return new Promise((resolve,reject) => {
                this.$http.get(this.waterApiPath + '/misc/getFloatBedload',{
                params: {
                    type: 'bedload'
                  }
                })
                .then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            })
          },
    }     
}
