const { DataTypes } = require('sequelize');

module.exports = function( sequelize ) {
    const Snippet = sequelize.define('snippet', {
        // Model attributes are defined here
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        body: {
          type: DataTypes.TEXT
        },
        uses: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        }
      }, {
        // Other model options go here
      });

      return Snippet
};