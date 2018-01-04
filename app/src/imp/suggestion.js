// displays security suggestion depending on information found in the model
const printMsgTxt = require('../helpers/printMsgTxt.js')

// contains the attribute/connection patterns and the suggestions
const list = {
  s0: {
    concept: 'device',
    layer: 'perception',
    suggestion: 'devices in the perception layer require physical security.'
  },
  s1: {
    concept: 'network connection',
    description: 'wireless',
    suggestion:
      'wireless connections are subject to information disclosure attacks. Use encrypted protocols.'
  },
  s2: {
    concept: 'device',
    update: 'false',
    suggestion: 'treat devices that cannot be updated as compromised.'
  },
  s3: {
    concept: 'application',
    update: 'false',
    suggestion: 'treat applications that cannot be updated as compromised.'
  }
}

module.exports = function suggestion (cy) {
  // fade out all the nodes
  cy.elements().addClass('faded')

  // arrays to store the insecure node of each suggestion
  let s0nodes = []
  let s1nodes = []
  let s2nodes = []
  let s3nodes = []

  // compares the suggestion data with the ones on the graph
  // @node: node instance in the graph
  // @concept: node concept in the suggestion array
  // @graphAttribute: attribute in the graph that will be compared
  // @attribute: attribute in the suggestion array
  // @nodeArray: array that will store the insecure nodes
  const compare = (node, concept, graphAttribute, attribute, nodeArray) => {
    // compare the graph nodes will the suggestions
    if (node.data().asto.concept === concept && graphAttribute === attribute) {
      // apply css rules in the graph
      node.removeClass('faded')
      node.addClass('attention')

      // push ID of the insecure ndoes in the array
      nodeArray.push(node.data().id)
    }
  }

  cy.nodes().map(node => {
    let nodeData = node.data().asto

    // s0 suggestion
    compare(node, list.s0.concept, nodeData.layer, list.s0.layer, s0nodes)
    // s1 suggestion
    compare(
      node,
      list.s1.concept,
      nodeData.description,
      list.s1.description,
      s1nodes
    )
    // s2 suggestion
    compare(node, list.s2.concept, nodeData.update, list.s2.update, s2nodes)
    // s3 suggestion
    compare(node, list.s3.concept, nodeData.update, list.s3.update, s3nodes)
  })

  // display the suggestions
  // s0 suggestion
  if (s0nodes.length !== 0) printMsgTxt(`${s0nodes}: ${list.s0.suggestion}`)
  // s1 suggestion
  if (s1nodes.length !== 0) printMsgTxt(`${s1nodes}: ${list.s1.suggestion}`)
  // s2 suggestion
  if (s2nodes.length !== 0) printMsgTxt(`${s2nodes}: ${list.s2.suggestion}`)
  // s3 suggestion
  if (s3nodes.length !== 0) printMsgTxt(`${s3nodes}: ${list.s3.suggestion}`)
}