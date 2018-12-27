//-----------------------------------------------------------------------------
// Copyright (C) 2018 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'

const colors = require('colors')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

var testMap = {}

async function beforeMethod() {
}

async function afterMethod() {
}

// -------------------------------------------------------------------------------
// -------------------------------------- TESTS DEFINITION -----------------------

// ----------------------------------------
testMap['Tester'] = {}
testMap['Tester']['method 1'] = function() {
  return new Promise((ok,rej) => {
    setTimeout(function() {
      ok(true)
    },Math.random()*500)
  })
}
testMap['Tester']['method 2'] = function() {
  return new Promise((ok,rej) => {
    setTimeout(function() {
      rej('Y a une erreur')
    },Math.random()*500)
  })
}
testMap['Tester']['method 2.2'] = function() {
  return false
}

// ----------------------------------------
testMap['Tester2'] = {}
testMap['Tester2']['method 3'] = function() {
  return new Promise((ok,rej) => {
    setTimeout(function() {
      ok(true)
    },Math.random()*2000)
  })
}
testMap['Tester2']['method 4'] = function() {

  throw 'Error zeofhreigfiezhforuite'
  return true

}
testMap['Tester2']['method 5'] = function() {

  return true

}
testMap['Tester2']['method 4'] = function() {

  let a = 5
  a += b
  return true

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