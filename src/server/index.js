// You can extend Vue Storefront server routes by binding to the Express.js (expressApp) in here
module.exports.registerUserServerRoutes = (expressApp) => {
  require('./example/generator')(expressApp)
}

// Use can use dynamic config by using this function below:
// (Needs to return a Promise)
// module.exports.configProvider = (req) => {
//   const axios = require('axios')
//   return new Promise((resolve, reject) => axios.get('myapi.com/config', {
//     params: {
//       domain: req.headers.host
//     }
//   }).then(res => {
//     resolve(res.data)
//   }).catch(error => reject(error)))
// }
module.exports.configProvider = (req) => {
  const axios = require('axios')
  return new Promise((resolve, reject) => axios.get('https://api.myff.store/config', {
    params: {
      fqdn: req.headers.host
    }
  }).then(res => {
    console.log('Success ->', res)
    resolve(res.data)
  }).catch(error => {
    console.log('Error ->', error)
    reject(error)
  }))
}
