
let allCities = [
  {name: "基隆市", randomColor: "", country: []},
  {name: "雲林縣", randomColor: "", country: []},
  {name: "澎湖縣", randomColor: "", country: []},
  {name: "連江縣", randomColor: "", country: []},
  {name: "彰化縣", randomColor: "", country: []},
  {name: "嘉義縣", randomColor: "", country: []},
  {name: "嘉義市", randomColor: "", country: []},
  {name: "新竹縣", randomColor: "", country: []},
  {name: "新竹市", randomColor: "", country: []},
  {name: "高雄市", randomColor: "", country: []},
  {name: "桃園市", randomColor: "", country: []},
  {name: "苗栗縣", randomColor: "", country: []},
  {name: "新北市", randomColor: "", country: []},
  {name: "台北市", randomColor: "", country: []},
  {name: "台中市", randomColor: "", country: []},
  {name: "台東縣", randomColor: "", country: []},
  {name: "台南市", randomColor: "", country: []},
  {name: "宜蘭縣", randomColor: "", country: []},
  {name: "花蓮縣", randomColor: "", country: []},
  {name: "金門縣", randomColor: "", country: []},
  {name: "南投縣", randomColor: "", country: []},
  {name: "屏東縣", randomColor: "", country: []},
]
let r
let g
let b
allCities.forEach(el=>{
  r = Math.floor(Math.random() * 255)
  g = Math.floor(Math.random() * 255)
  b = Math.floor(Math.random() * 255)
  el.randomColor = `rgba(${r},${g},${b},0.6)`
})

export default allCities