const mongoose = require('mongoose');

// this is our schema to represent an appointment
const schema = mongoose.Schema({
  patientName: {type: String, required: true},
  patientId: {type: String, required: true},
  date: {type: Date, required: true},
  reason: {type: String, required: true},
  summary: {type: String}
});

//Manipulating the representation of the returned API data:
schema.methods.apiRepr = function() {
  return {
    id: this._id,
    patientName: this.patientName,
    patientId: this.patientId,
    date: this.date,
    reason: this.reason,
    summary: this.summary
  };
}

const Appointment = mongoose.model('Appointment', schema);

module.exports = Appointment;
