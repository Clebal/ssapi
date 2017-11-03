module.exports.query = (query, req, res = '') => {
  req.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if(res != ''){
        res.send(rows);
      }
    });
  });
};

module.exports.queryAsync = (query, req) => {
  return new Promise((resolve, reject) => {
    req.getConnection(function (err, connection) {
      connection.query(query, (err, rows, fields) => {
        resolve(rows);
        reject(err);
      });
    });
  });
};
