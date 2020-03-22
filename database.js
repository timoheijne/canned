const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'canned_responses.sqlite'
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
// load models
var models = [
    'snippet'
];
    
models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/models/' + model);
});

sequelize.sync();
    
// export connection
module.exports.sequelize = sequelize;