'use strict';

require('dotenv-safe').load();
const http = require('http');
const express = require('express');
const {urlencoded} = require('body-parser');
const twilio = require('twilio');
const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;
require('dotenv-safe').load();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

let app = express();
app.use(express.static(__dirname + '/public'));
app.use(urlencoded({extended: false}));

// Generate a Twilio Client capability token
app.get('/token', (request, response) => {
  const capability = new ClientCapability({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: process.env.TWILIO_TWIML_APP_SID})
  );
  const token = capability.toJwt();
  response.send({
    token: token,
  });
});

// Create TwiML for outbound calls
app.post('https://c276-59-95-128-194.in.ngrok.io/voice', (request, response) => {
  let voiceResponse = new VoiceResponse();
  voiceResponse.dial({
    callerId: process.env.TWILIO_NUMBER
  }, request.body.number);
  response.type('text/xml');
  response.send(voiceResponse.toString());  
});

app.post('/something',(req,res)=>{
  console.log(req);
  res.send("done").status(200);
})

app.use((error, req, res, next) => {
  res.status(500)
  res.send('Server Error')
  console.error(error.stack)
  next(error)
})

let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express Server listening on *:${port}`);
});

module.exports = app;