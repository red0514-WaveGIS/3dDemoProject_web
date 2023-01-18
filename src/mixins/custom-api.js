export default {
    data: () => ({
        floodedApiPath: "/api/floodedMap",
        waterExtraApiPath: "/api/javaapi/water_extra_api",
      }),
    methods: {
        getFloodedImage: function (lat, lon) {
            return new Promise((resolve,reject) => {
                this.$http.post(this.floodedApiPath + '/ClimateGAN',
                    {lat: lat, lng: lon,},
                    // { headers: { 'Content-Type': 'application/json' } }
                ).then((res) => {
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
                        type: "flood",
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
