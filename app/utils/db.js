const mongoose = require("mongoose");
const config = require("../../config.js");

function connect(onOk = () => {}, onError = () => {}) {
  mongoose.Promise = global.Promise;

  let options = {
    // mongoose 5.x 不支持useMongoClient
    // useMongoClient: true
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
  };

  if (config.db.user) {
    options.user = config.db.user;
    options.pass = config.db.pass;
  }

  let connectString = `mongodb://${config.db.servername}:${config.db.port}/${config.db.database}`;
  if (config.db.authSource) {
    connectString = connectString + `?authSource=${config.db.authSource}`;
  }

  console.log(connectString);

  let db = mongoose.connect(connectString, options);

  db.then(
    function() {
      console.log("mongodb load success...");
      onOk(db);
    },
    function(err) {
      onError(err);
      console.error(`[db error]:`, err);
    }
  );

  return db;
}

module.exports = {
  connect: connect
};
