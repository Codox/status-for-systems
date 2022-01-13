/**
 * Incident.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey: 'id',
  tableName: 'incidents',

  attributes: {
    title: {
      type: 'string',
      required: true,
      allowNull: false,
    },
    description: {
      type: 'string',
      required: false,
      allowNull: true,
    },
  },
};
