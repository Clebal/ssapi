module.exports = (app) => {
  const News = require('../models/news.js')

  app.get('/news/:num', (req, res) => {
    News.all(req.params.num, req, res)
  })

}
