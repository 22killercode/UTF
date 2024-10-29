const mongoose = require('mongoose');
const { Schema } = mongoose;

const Incidents = new Schema({
    //direccion
    mensajeErrror: { type: String },
    emailReport: { type: String },
    userIncidentID:{ type: String },
    userEmailIncident: { type: String },

    date: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Incidents', Incidents)