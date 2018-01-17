const mongoose = require('mongoose');

// this is our schema to represent a senator
const schema = mongoose.Schema({
  name: {type: String, required: true},
  active: {type: Boolean, required: true}, // true or false
  state: {type: String, required: true},
  party: {type: String, required: true},
  effectiveness: {type: Number, required: true}, //0-100 scale; will be used at a later stage
  //All the following fields have scales of 0 to 100; 50=neutral/unknown; 100=fully pro; 0=fully anti
  gunControl: {type: Number, required: true},  
  proLife: {type: Number, required: true},
  gayMarriage: {type: Number, required: true},
  cleanEnergy: {type: Number, required: true},
  smallGovernment: {type: Number, required: true}
});

//Manipulating the representation of the returned API data:
schema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.name,
    active: this.active,
    state: this.state,
    party: this.party,
    effectiveness: this.effectiveness,
    gunControl: this.gunControl,
    proLife: this.proLife,
    gayMarriage: this.gayMarriage,
    cleanEnergy: this.cleanEnergy,
    smallGovernment: this.smallGovernment
  };
}

const Senator = mongoose.model('Senator', schema);

module.exports = Senator;
