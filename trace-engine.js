//-----------------------------------------------------------------------------
// Copyright (C) 2019 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'

// ----------------------------------------------------------------------------
// ------------------------------------------------------------ IMPORTS -------

const fs = require('fs-promise')

// ----------------------------------------------------------------------------
// ------------------------------------------------------------- DESIGN -------

/*
*
* Trace representation:
*   - name: string
*   - description: string
*   - lastUpdate: timestamp
*
*/

// ----------------------------------------------------------------------------
// ---------------------------------------------------------- INTERFACE -------

// -----------------------------------------------------
exports.traceExists = async function(traceName) {
  return await traceExists(traceName)
}

exports.getTraceInfos = async function(traceName) {
  if(! await traceExists(traceName))
    return null
  return await retrieveInfos(traceName)
}

exports.getTraceObsels = async function(traceName) {
  if(! await traceExists(traceName))
    return null
  return await retrieveObsels(traceName)
}

// -----------------------------------------------------
exports.createTrace = async function(traceName, description) {
  if(await traceExists(traceName))
    return false
  await createTrace(traceName, description)
  return true
}

exports.addObsel = async function(traceName, obsel) {
  if(! await traceExists(traceName))
    return false
  await addObsel(traceName, obsel)
  return true
}

// -----------------------------------------------------
exports.deleteTrace = async function(traceName) {
  if(! await traceExists(traceName))
    return false
  await deleteTrace(traceName)
  return true
}

exports.clearAllTraces = async function() {
  let traces = await retrieveAllTraceName()
  for(let trace of traces)
    await deleteTrace(trace)
  return true
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------- INTERNAL -------

// --------------------------------
async function traceExists(traceName) {
  let infoFile = await traceInfoFile(traceName)
  return await fs.exists(infoFile)
}

// --------------------------------
async function createTrace(traceName, description) {
  let infos = {
    name: traceName,
    description: description,
    lastUpdate: await getNowTime()
  }
  await saveInfos(traceName, infos)
  await saveObsels(traceName, [])
}

async function addObsel(traceName, obsel) {
  let obsels = await retrieveObsels(traceName)
  obsels.push(obsel)
  await saveObsels(traceName, obsels)
  let infos = await retrieveInfos(traceName)
  infos.lastUpdate = await getNowTime()
  await saveInfos(traceName, infos)
}

// --------------------------------
async function deleteTrace(traceName) {
  let infoFile = await traceInfoFile(traceName)
  let obselFile = await traceObselFile(traceName)
  await fs.unlink(infoFile)
  await fs.unlink(obselFile)
}

// ----------------------------------------------------- DIR

// --------------------------------
async function retrieveInfos(traceName) {
  let infoFile = await traceInfoFile(traceName)
  let infos = JSON.parse(await fs.readFile(infoFile))
  return infos
}

async function saveInfos(traceName, infos) {
  let infoFile = await traceInfoFile(traceName)
  await fs.writeFile(infoFile, JSON.stringify(infos))
}

// --------------------------------
async function retrieveObsels(traceName) {
  let obselFile = await traceObselFile(traceName)
  let obsels = JSON.parse(await fs.readFile(obselFile))
  return obsels
}

async function saveObsels(traceName, obsels) {
  let obselFile = await traceObselFile(traceName)
  await fs.writeFile(obselFile, JSON.stringify(obsels))
}

// --------------------------------
async function retrieveAllTraceName() {
  let dir = await traceDirectory()
  let allFiles = await fs.readdir(dir)
  let traces = []
  for(let file of allFiles) {
    if(file.indexOf('_infos.json')>-1) {
      let trueName = file.replace('_infos.json','')
      traces.push(trueName)
    }
  }
  return traces
}

async function traceInfoFile(traceName) {
  return (await traceDirectory()) + traceName + '_infos.json'
}

async function traceObselFile(traceName) {
  return (await traceDirectory()) + traceName + '_obsels.json'
}

async function traceDirectory() {
  let dir = './traces/'
  if(! await fs.exists(dir))
    await fs.mkdir(dir)
  return dir
}

// ----------------------------------------------------- UTILS
async function getNowTime() {
  return Math.floor(Date.now() / 1000)
}