//-----------------------------------------------------------------------------
// Copyright (C) 2019 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'
// ----------------------------------------------------------------------------
// ------------------------------------------------------------ IMPORTS -------

const engine = require('./trace-engine.js')

const express = require('express')
const bodyParser = require("body-parser")

var app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// ----------------------------------------------------------------------------
// ------------------------------------------------------------- DESIGN -------

/*
* DESIGN:
*   - GET: /<trace-name> --> access trace infos
*   - GET: /<trace-name>/obsels --> access trace obsels
*
*   - POST: /<trace-name> --> create a new trace
*   - POST: /<trace-name>/obsels --> create a new obsel in a trace
*
*   - DELETE: /<trace-name> --> delete a trace
*/

// ----------------------------------------------------------------------------
// ---------------------------------------------------------- INTERFACE -------

var server = null
var serverSilent = false

exports.start = async function(listeningPort, silent=false) {
  serverSilent = silent
  server = await app.listen(listeningPort)
  return server
}

exports.stop = async function() {
  return await server.close()
}

// ------------------------------------------------------------------------------
// ----------------------------------------------------------- COM_METHODS ------

function sendResponse(res, code, message, printMessage = true, useHtml = false) {
  res.status(code);
  if (useHtml)
    message = '<h1><b><u>Code: ' + code + '</u></b>: ' + message + '</h1>'
  if(printMessage && !serverSilent)
    console.log(code + ' - ' + message)
  res.send(message);
  return res
}

function sendJSON(res, code, jsonData) {
  res.setHeader('Content-Type', 'application/json')
  res.status(code)
  res.send(JSON.stringify(jsonData))
  return res
}
// ----------------------------------------------------------------------------
// ------------------------------------------------------------- ROUTES -------

// ----------------------------------------------------- GET
app.get("/:traceName", async (req, res, next) => {

  let traceName = req.params.traceName
  let infos = await engine.getTraceInfos(traceName)

  if(infos == null)
    return sendResponse(res, 404, 'Trace "'+traceName+'" not found')

  return sendJSON(res, 200, infos)

});

app.get("/:traceName/obsels", async (req, res, next) => {

  let traceName = req.params.traceName
  let obsels = await engine.getTraceObsels(traceName)

  if(obsels == null)
    return sendResponse(res, 404, 'Obsels in trace "'+traceName+'" not found')

  return sendJSON(res, 200, obsels)

});

// ----------------------------------------------------- POST
app.post("/:traceName", async (req, res, next) => {

  let traceName = req.params.traceName
  let description = req.body.description

  if(await engine.createTrace(traceName, description))
    return sendResponse(res, 200, 'Trace "'+traceName+'" created')
  return sendResponse(res, 401, 'Error while creating trace "'+traceName+'"')

});

app.post("/:traceName/obsels", async (req, res, next) => {

  let traceName = req.params.traceName
  let obsel = req.body.obsel

  if(await engine.addObsel(traceName, obsel))
    return sendResponse(res, 200, 'Obsel added to trace "'+traceName+'"')
  return sendResponse(res, 401, 'Error while creating obsel in "'+traceName+'"')

});

// ----------------------------------------------------- DELETE
app.delete("/:traceName", async (req, res, next) => {

  let traceName = req.params.traceName

  if(await engine.deleteTrace(traceName))
    return sendResponse(res, 200, 'Trace "'+traceName+'" deleted')
  return sendResponse(res, 404, 'Trace "'+traceName+'" does not exist')

});