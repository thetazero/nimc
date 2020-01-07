const ws = require('ws')
const fs = require('fs')
const fsp = fs.promises
const { process } = require('./process')

const sock = new ws.Server({ port: 3544 })
const path = '/Users/leshaseletskiy/Documents/nim'

let curDir = ''
sock.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    curDir = message
  })
  console.log('connection!')
})

fs.watch('/Users/leshaseletskiy/Documents/nim', {
  recursive: true,
}, (e, file) => {
  if (file.includes('4913') || file[file.length - 1] == '~' || file.slice(file.length - 4) == '.swx' || file.slice(file.length - 4) == '.swp') {
    console.log(`ignored ${e} of ${file}`)
  } else {
    console.log(e, file)
    if (e == 'rename') {
      if (curDir == `/${file}`) {
        let type = file.split('.')
        if (type.length) type = type[1]
        else type = null
        sock.clients.forEach(async ws => {
          let data = await fsp.readFile(`${path}/${file}`, 'utf-8')
          ws.send(process(data, type))
        })
      }
    }
  }
})
