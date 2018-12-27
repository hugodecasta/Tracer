//-----------------------------------------------------------------------------
// Copyright (C) 2018 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'

const colors = require('colors')
const engine = require('./trace-engine.js')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

var testMap = {}

async function beforeMethod() {
  await engine.clearAllTraces()
}

async function afterMethod() {
  await engine.clearAllTraces()
}

// -------------------------------------------------------------------------------
// -------------------------------------- TESTS DEFINITION -----------------------

// ----------------------------------------
testMap['ENGINE'] = {}

testMap['ENGINE']['trace exists'] = async function() {

  await engine.clearAllTraces()

  return ! await engine.traceExists('myTrace1')
}

testMap['ENGINE']['create trace'] = async function() {

  await engine.clearAllTraces()
  let passed = true

  passed &= ! await engine.traceExists('myTrace1')
  passed &= await engine.createTrace('myTrace1')
  passed &= await engine.traceExists('myTrace1')

  return passed
}

testMap['ENGINE']['delete trace'] = async function() {

  await engine.clearAllTraces()
  let passed = true

  passed &= ! await engine.traceExists('myTrace1')
  passed &= await engine.createTrace('myTrace1')
  passed &= await engine.traceExists('myTrace1')
  passed &= await engine.deleteTrace('myTrace1')
  passed &= ! await engine.traceExists('myTrace1')

  return passed
}

testMap['ENGINE']['add obsels'] = async function() {

  await engine.clearAllTraces()
  let passed = true

  await engine.createTrace('myTrace1')

  passed &= (await engine.getTraceObsels('myTrace1')).length == 0

  await engine.addObsel('myTrace1',{'name':'im an obsel 1'})
  passed &= (await engine.getTraceObsels('myTrace1')).length == 1

  await engine.addObsel('myTrace1',{'name':'im an obsel 2'})
  passed &= (await engine.getTraceObsels('myTrace1')).length == 2
  passed &= (await engine.getTraceObsels('myTrace1'))[1].name == 'im an obsel 2'

  return passed
}

// -------------------------------------------------------------------------------
// ---------------------------------------------------------------
// -------------------------------------------------- MAIN -------

// ---------------------------------------------------------------
async function unitTest(testName, testObj, preindent) {
  try {
    let passed = await testObj()
    let passedStr = passed?'PASSED'.green:'FAILED'.red
    console.log(preindent,'--',testName,':',passedStr)
    return passed?[1,0]:[0,1]
  }
  catch(error) {
    console.log(preindent,'--',testName,':','ERROR'.red)
    console.log('  ',('ERROR: '+error).red)
    return [0,1]
  }
}
async function multiTest(testName, testObj, preindent) {
  let newindent = preindent+'/'+testName
  let score = [0,0]
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    let subScore = await test(subTestName, subTestObj, newindent)
    score[0] += subScore[0]
    score[1] += subScore[1]
  }
  return score
}
async function test(testName, testObj, preindent) {
  preindent = preindent==undefined?'':preindent
  if(typeof(testObj) == typeof({}))
    return await multiTest(testName, testObj, preindent)
  else
    return await unitTest(testName, testObj, preindent)
}
// ------------------

async function initTests(testMap) {
  try {
    await beforeMethod()
  }
  catch(error) {
    console.log(('Error in the "before method": '+error).red)
    return null
  }
  let score = await test('Main tests',testMap)
  try {
    await afterMethod()
  }
  catch(error) {
    console.log(('Error in the "after method": '+error).red)
    return null
  }
  return score
}

function sortMap(testObj,testArgs) {
  if(testArgs.length == 0)
    return testObj
  let newTestObject = {}
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    if(testArgs.indexOf(subTestName)>-1) {
      newTestObject[subTestName] = subTestObj
    }
    else if(typeof(subTestObj) == typeof({})) {
      let newSubObject = sortMap(subTestObj,testArgs)
      if(Object.keys(newSubObject).length > 0)
        newTestObject[subTestName] = newSubObject
    }
  }
  return newTestObject
}

let testArgs = process.argv
testArgs.splice(0,2)
initTests(sortMap(testMap,testArgs)).then(function(fullScore) {

  if(fullScore == null) {
    console.log('\nError one test set'.red)
    return
  }

  let testPassedStr = fullScore[1]>0?
    (fullScore[0]==0?'FAILED'.red:'FAILED'.yellow):
    'PASSED'.green
  console.log('\nFull test:',testPassedStr)
  console.log('\nPASSED:',fullScore[0],'\nFAILED:',fullScore[1])

})