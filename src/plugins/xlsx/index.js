var XLSX = require("xlsx");
var XLSXS = require("xlsx-js-style");
const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $XLSX: {
      get() {
        return {
          downloadXlsx: function (options) {
            let defaults = {
              headertitle: "", //表格標題
              header: [], //標頭
              items: [], //array內容
              jsonItems: [], //json內容
              spanContent: [], //合併欄位 ex:[[1,0,1,1]] startRow,startCol,endRow,endCol 第一列第0欄 第一列第1欄合併
              fileName: "", //檔名
              itemColStyle: [] //樣式
            };
            defaults = this.setExtend(defaults, options);
            function sheet_to_workbook(
              sheet /*:Worksheet*/,
              opts
            ) /*:Workbook*/ {
              var n = opts && opts.sheet ? opts.sheet : "Sheet1";
              var sheets = {};
              sheets[n] = sheet;
              sheet["!merges"] = sheetSpan;
              return { SheetNames: [n], Sheets: sheets };
            }

            function aoa_to_workbook(
              data /*:Array<Array<any> >*/,
              opts
            ) /*:Workbook*/ {             
              return sheet_to_workbook(
                XLSX.utils.aoa_to_sheet(data, opts),
                opts
              );
            }
            let workData = [];
            let sheetSpan = [];
            let spanData = [];
            if (defaults.headertitle != "") {
              let headerTitle = defaults.header.map((items, index) =>
                index === 0 ? defaults.headertitle : null
              );
              workData.push(headerTitle);
              sheetSpan = [
                {
                  s: { r: 0, c: 0 },
                  e: { r: 0, c: defaults.header.length - 1 },
                },
              ];
            }
            if (defaults.header.length > 0) {
              workData.push(defaults.header);
            }
            if (defaults.jsonItems.length > 0) {
              defaults.jsonItems.forEach((condition) => {
                let datas = Object.keys(condition).map((key) => condition[key]);
                workData.push(datas);
              });
            }
            if (defaults.items.length > 0) {
              workData.push.apply(workData, defaults.items);
            }
            if (defaults.spanContent.length > 0) {
              spanData = defaults.spanContent.map((items) =>
                this.setSpanContent(items[0], items[1], items[2], items[3])
              );
            }
            sheetSpan.push.apply(sheetSpan, spanData);
            var wb = aoa_to_workbook(workData);
            let isHeader = defaults.header.length > 0
            if (defaults.itemColStyle.length > 0) {
              wb = this.setWorkDataStyle(wb,isHeader,defaults.itemColStyle)
            }
            XLSXS.writeFile(wb, defaults.fileName + ".xlsx"); // save to xlsx
          },
          setSpanContent: function (startRow, startCol, endRow, endCol) {
            return {
              s: { r: startRow, c: startCol },
              e: { r: endRow, c: endCol },
            };
          },
          setExtend: function (defaults, options) {
            let extended = {};
            let prop;
            for (prop in defaults) {
              if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
              }
            }
            for (prop in options) {
              if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
              }
            }
            return extended;
          },
          tableToWorkbook: function (tableDom) {
            return XLSX.utils.table_to_book(tableDom, { raw: true });
          },
          workbookToFile: function (wb, fileName) {
            XLSX.writeFile(wb, fileName)
          },
          setWorkDataStyle: function(workbook,isHeader,itemColStyle){
            workbook["SheetNames"].forEach(item =>{
              let sheetsList = workbook.Sheets[item]
              let colIndex = 0
              for(let dataCol in sheetsList){
                let colStyle = {
                  font:{ sz: 12 },
                  alignment: { vertical: 'center', horizontal: 'left'},
                  fill: { fgColor: { rgb: itemColStyle[colIndex] ?? 'ffffff' } },
                  border: {
                    top:{
                      style: 'thin', color: {rgb:'a9a9a9'}
                    },
                    bottom:{
                      style: 'thin', color: {rgb:'a9a9a9'}
                    },
                    left:{
                      style: 'thin', color: {rgb:'a9a9a9'}
                    },
                    right:{
                      style: 'thin', color: {rgb:'a9a9a9'}
                    }
                  }
                }
                if(dataCol !== '!merges' && dataCol !== '!ref'){
                  if(dataCol === 'A1' && isHeader){
                    colStyle.font['sz'] = 15
                    colStyle.font['bold'] = true
                    colStyle.alignment['horizontal'] = 'center'
                  }
                  workbook.Sheets[item][dataCol]['s'] = colStyle
                }
                colIndex++
              }
            })  
            return workbook   
          },
          readCsv: function (filename, opts) {
            console.log(opts)
            return new Promise((resolve, reject) => {
              console.log(reject)
              // const data = await (
              //   await fetch(filename, {
              //     headers: {
              //       "content-type": "text/csv;charset=UTF-8",
              //     },
              //   })
              // ).blob();
              
              fetch(filename, {
                headers: {
                  "content-type": "text/csv;charset=UTF-8",
                },
              }).then(res => {
                if(res.ok) {
                  return res.blob()
                }
                throw new Error('沒有資料')
              }).then(res => {
                const reader = new FileReader();
                reader.readAsText(res, 'utf-8');
                
                reader.addEventListener("load", () => {
                  const rows = reader.result.split(/\r?\n/);
                  const dataTable = [];
                  rows.forEach(row => {
                    let dataTableRowCell = {}
                    if(filename.indexOf("bridge") > -1) {
                      const rowArray = row.split(',')
                      let bridge = rowArray[0]
                      let org = rowArray[3] + ' ' + rowArray[4]
                      dataTableRowCell = {
                        bridge,
                        org
                      }
                    } else if (filename.indexOf("road") > -1){
                      const [road, org] = row.split(',')
                      dataTableRowCell = {
                        road,
                        org
                      }
                    } else if (filename.indexOf("slope") > -1){
                      const [slope, org] = row.split(',')
                      dataTableRowCell = {
                        slope,
                        org
                      }
                    } else {
                      return "new Type of File"
                    }

                    dataTable.push(dataTableRowCell)
                  })
                  resolve(dataTable)
                }, false);
              }).catch(err => {
                console.log(err)
                resolve([])
              })
            })

          },
          sheet_add_aoa: function(worksheet, aoa, opts) {
            XLSX.utils.sheet_add_aoa(worksheet, aoa, opts);
          },
          decoded_range: function(worksheetRange) {
            return XLSX.utils.decode_range(worksheetRange);
          },
          encode_cell: function(cellAddress) {
            return XLSX.utils.encode_cell(cellAddress);
          },
          book_new: function() {
            return XLSX.utils.book_new();
          },
          aoa_to_sheet: function(aoa) {
            return XLSX.utils.aoa_to_sheet(aoa)
          },
          book_append_sheet: function(workbook, worksheet, sheet_name) {
            return XLSX.utils.book_append_sheet(workbook, worksheet, sheet_name);
          }
        };
      },
    },
  });
};

export default {
  install,
};
