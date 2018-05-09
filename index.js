var request = require('request')

var host = 'https://www.okb.com/api/v1'
var AV = require('leancloud-storage')
var { Query, User } = AV
const appid = 'UulJzE3T14Ifk99WnW2mxgN3-gzGzoHsz'
const appkey = 'US91gxmL6kH6MagHWOIP822v'
AV.init(appid, appkey)

function getNow() {
    request(`${host}/ticker.do?symbol=eos_usdt`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        //   console.log(body) // Show the HTML for the baidu homepage.
            // console.log(typeof body )
            // return
            var data = JSON.parse(body)
            saveLeanCloud('now', JSON.stringify(data.ticker))
            getAfter(0, data.ticker)
            getAfter(1, data.ticker)
            getAfter(2, data.ticker)
        }
    })
}
function getAfter(type, nowPrice) {
    // this_week:当周   next_week:下周   quarter:季度
    const params = {
      symbol: 'eos_usdt',
      contract_type: 'this_week',
    }
    let tabledb = 'future'
    let tablePeerdb = 'pricePeer'
    if (type === 1) {
      tabledb = 'future_week'
      tablePeerdb = 'pricePeer_week'
      params.contract_type = 'next_week'
      
    }
    if (type === 2) {
      tabledb = 'future_quarter'
      tablePeerdb = 'pricePeer_quarter'
      params.contract_type = 'quarter'
    }
    request(`${host}/future_ticker.do?symbol=eos_usdt&contract_type=${params.contract_type}`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //   console.log(body) // Show the HTML for the baidu homepage.
            var data = JSON.parse(body)
            var afterPrice = data.ticker
            var priceIndex = afterPrice.buy / nowPrice.sell
            saveLeanCloud(tabledb, JSON.stringify(afterPrice))
            saveLeanCloud(tablePeerdb, JSON.stringify({
                now: JSON.parse(JSON.stringify(nowPrice)),
                future: JSON.parse(JSON.stringify(afterPrice))
            }))
        }
    })
  }
/**
 * 保存到数据库
 * @param {*} table  表名
 * @param {*} data  数据
 */
function saveLeanCloud(table, data) {
    var tableDB = AV.Object.extend(table)
    // 新建对象
    var tableDB = new tableDB()
    // 设置名称
    tableDB.set('timer',+new Date())
    console.log(table, data);
    
    tableDB.set('data',data)
    // 设置优先级
    tableDB.save().then(function (todo) {
      console.log('objectId is ' + todo.id)
    }, function (error) {
      console.error(error)
    })

  }

// setInterval(() => {
    getNow()
// }, 1000)