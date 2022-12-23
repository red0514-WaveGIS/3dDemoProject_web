export default {
    data: () => ({
        floodedApiPath: "/api/floodedMap"
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
    }     
}
