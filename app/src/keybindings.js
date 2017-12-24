// keybindings and command propmpt options

const config = require('../settings/config.js')

const searchAttribute = require('./core/searchAttribute.js')
const showMetamodel = require('./core/showMetamodel.js')
const deleteRestoreConcepts = require('./core/deleteRestoreConcepts.js')

const printMsgHTML = require('./helpers/printMsgHTML.js')
const save = require('./helpers/save.js')
const theme = require('./helpers/theme.js')
const watcher = require('./helpers/watcher.js')

const buttonHelpers = require('./buttonHelpers.js')

module.exports = function (
  cy,
  selectedNode,
  selectedEdge,
  srcNode,
  trgNode,
  phase,
  graphNodes
) {
  // help menu for macOs
  const helpMenuMacOS = `• focus on console: ⌘L
• add Edge: ⌘E
• delete element: ⌘⌫
• restore node: ⌘Z
• save as: ⇧⌘S
• view phase metamodel: <b>metamodel</b>
• change color theme: <b>toggle</b>
• clear sidebar: <b>clear</b>
• model validation: <b>validate</b>
• search for attribures: <b>keyword</b>`

  // help menu for Linux and Windows
  const helpMenu = `• focus on console: ctrl+L
• add Edge: ctrl+E
• delete element: ctrl+backspace
• restore node: ctrl+Z
• save as: shift+ctrl+S
• view phase metamodel: <b>metamodel</b>
• change color theme: <b>toggle</b>
• clear sidebar: <b>clear</b>
• model validation: <b>validate</b>
• search for attribures: <b>keyword</b>`

  // adds the url of ASTo docs
  const docsURLBtn = `click to view <button id='url-button' class='menu-btn' style='color: var(--main-tx-color); background-color: var(--main-bg-color); width: 45px; height: 25px;'>docs</button>`

  const cmdID = document.getElementById('cmd-id')
  const labelId = document.getElementById('input-label-id')
  // indicate focus on the console by making the > blue
  cmdID.addEventListener('focus', e => {
    labelId.style.color = config.blue
  })
  // indicate loss of focus on the console by making the > default color
  cmdID.addEventListener('blur', () => {
    labelId.style.color = config.text
  })

  // removes the focus from the console when tapping on the graph container
  cy.on('tap', selection => cmdID.blur())

  // console commands
  const commands = () => {
    const input = document.getElementById('cmd-id').value
    document.getElementById('cmd-id').value = ''

    // declare input of console commmands
    switch (input) {
      case 'help':
        // checks the platform to display the corrent help menu
        process.platform === 'darwin'
          ? printMsgHTML(helpMenuMacOS)
          : printMsgHTML(helpMenu)

        printMsgHTML(docsURLBtn)
        // opens the wiki page with the default browser
        document.getElementById('url-button').addEventListener('click', () => {
          require('electron').shell.openExternal(config.docsURL)
        })
        break
      case 'validate':
        buttonHelpers.validateHelper(cy, phase)
        break
      case 'metamodel':
        showMetamodel(phase)
        break
      case 'toggle':
        if (config.colorTheme === 'dark') {
          theme.setThemeGraph(cy, 'light')
          config.colorTheme = 'light'
        } else {
          theme.setThemeGraph(cy, 'dark')
          config.colorTheme = 'dark'
        }
        break
      case 'clear':
        document.getElementById('message-area-id').textContent = ''
        break
      case '':
        break
      default:
        searchAttribute(cy, input)
    }
  }

  // declare keydown listeners
  document.addEventListener('keydown', event => {
    let metaKey = ''
    // checks the platform to assign the correct meta key
    process.platform === 'darwin'
      ? (metaKey = event.metaKey)
      : (metaKey = event.ctrlKey)

    // focus on the app console
    if (metaKey === true && event.code === 'KeyL') {
      cmdID.focus()
    }
    // add an edge specific to each phase
    if (metaKey === true && event.code === 'KeyE') {
      // checks for undefined selections
      if (Object.keys(srcNode.out).length !== 0) {
        buttonHelpers.addEdge(cy, srcNode.out, trgNode.out, phase)
        cy.edges().addClass('label-edges')
      }
    }
    // delete nodes or edges with meta + Backspace
    if (metaKey === true && event.code === 'Backspace') {
      deleteRestoreConcepts.deleteConcept(
        cy,
        selectedNode.out,
        selectedEdge.out
      )

      watcher.nodes(graphNodes, cy)
    }
    // restore nodes with meta + z
    if (metaKey === true && event.code === 'KeyZ') {
      deleteRestoreConcepts.restoreNode(cy)

      watcher.nodes(graphNodes, cy)
    }
    // save graph on meta + s
    if (event.shiftKey === true && metaKey === true && event.code === 'KeyS') {
      save(cy)
    }
    // listens for the ENTER key when focus is on the console
    if (document.activeElement === cmdID && event.code === 'Enter') {
      commands()
    }
    // developer mode message when a user wants to reload the app, meta + r
    if (metaKey === true && event.code === 'KeyR') {
      printMsgHTML(
        '<strong>Window reload</strong> is disabled in default mode.'
      )
      printMsgHTML('Start the app in <strong>develper mode</strong> it.')
      printMsgHTML('<strong>npm run dev</strong>')
    }
  })
}
