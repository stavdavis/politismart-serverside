const mongoose = require('mongoose');

// this is our schema to represent a senator
const schema = mongoose.Schema({
  name: {type: String, required: true},
  image: {type: String, required: true},//a link to an image (225x275)
  active: {type: Boolean, required: true}, // true or false
  state: {type: String, required: true},
  party: {type: String, required: true},
  impact: {type: Number, required: true}, //0-100 scale; refers to impact of uaer's donation/contribution (safe/risky senate seat) - used for sorting results
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
    image: this.image,
    active: this.active,
    state: this.state,
    party: this.party,
    impact: this.impact,
    gunControl: this.gunControl,
    proLife: this.proLife,
    gayMarriage: this.gayMarriage,
    cleanEnergy: this.cleanEnergy,
    smallGovernment: this.smallGovernment
  };
}

const Senator = mongoose.model('Senator', schema);

module.exports = Senator;
