let floodedList = {
  big_egg: {
    name: "big_egg",
    areaName: '大巨蛋淹水區域',
    height: 20,
    heightest: 40,
    lowest: 20,
    areaPoint: [
      121.5579520324756,25.04493581866319,
      121.55781944944574,25.0415166137583, 
      121.56433540179435, 25.041329645403497, 
      121.56667955480331, 25.045256324457515, 
      121.56479249163466, 25.04469541048406, 
      121.56238948850107, 25.04493585452839, 
      121.55891028902674, 25.04500261794834, 
    ],
    cesiumItem: null,
    active: false,
    isPause: false,
    cameraPosition: {
      lon: 121.55931651430299,
      lat: 25.031606648776876,
      height: 800
    },
    src: "http://192.168.1.23/3dDemoProject_web/DommyImg/flooded.jpg",
  },
  memorial_hall: {
    name: "memorial_hall",
    areaName: '中正紀念堂淹水區域',
    height: 15,
    heightest: 40,
    lowest: 15,
    areaPoint: [
      121.51775259572933, 25.038465374569633, 
      121.51669942171664, 25.034813667319295, 
      121.52251213212672, 25.03226291284592, 
      121.52405138645013, 25.035639439775327,
    ],
    cesiumItem: null,
    active: false,
    isPause: false,
    cameraPosition: {
      lon: 121.52093034329343,
      lat: 25.02601413412601,
      height: 800
    },
    src: "http://192.168.1.23/3dDemoProject_web/DommyImg/flooded2.png",
  },
  maple_garden: {
    name: "maple_garden",
    areaName: '秋紅谷淹水區域',
    height: 65,
    heightest: 82,
    lowest: 65,
    areaPoint: [
      120.63907129640684, 24.168809936996578,
      120.63787271983634, 24.166927133207043,
      120.6396132829033, 24.165966733555752,
      120.64065553501386, 24.1676403237521,
    ],
    cesiumItem: null,
    active: false,
    isPause: false,
    cameraPosition: {
      lon: 120.63787271983634,
      lat: 24.126927133207043,
      height: 800
    },
    src: "http://192.168.1.23/3dDemoProject_web/DommyImg/flooded3.jpg",
  },
}


export default floodedList