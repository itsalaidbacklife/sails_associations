/**
* Thing.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	owner: {
  		model: 'human',
  		required: true
  	},

    ownerName: {
      type: 'string',
      required: true
    },
    
  	name: {
  		type: 'string',
  		required: true
  	},

  	accessories: {
  		collection: 'thing',
  		via: 'accessories'
  	}


  }
};

