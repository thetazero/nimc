const express = require('express')
const dTree = require('directory-tree')
const fs = require('fs').promises
const mime = require('mime')
const { process } = require('./process')
const lr = require('./livereload')

const app = express()
const port = 3543
app.use(express.static('../front'))

function cleanTree(data) {
  data.path = data.path.replace(/\/Users\/leshaseletskiy\/Documents\/nim/, '')
  // delete data.path
  delete data.size
  if (data.children) {
    data.children = data.children.filter(child => {
      return !['.swp'].includes(child.extension)
    })
    data.children.forEach(cleanTree)
  }
}

app.get('/q/', async (req, res) => {
  // console.log(req)
  try {
    let data = dTree('/Users/leshaseletskiy/Documents/nim', { extensions: /\./ })
    cleanTree(data)
    res.send(data)
  } catch (e) {
    console.log(e)
    res.send(e)
  }
})

app.get('*', async (req, res) => {
  // console.log(req.path)
  try {
    let type = req.path.split('.')
    if (type.length) type = type[1]
    else type = null
    let path = req.path.replace(/\%20/g, ' ')
    if (type == 'png' || type == 'mp3') {
      // console.log('type png')
      res.setHeader("Content-Type", mime.getType(req.url)); //Solution!
      // const data = await fs.readFile(`/Users/leshaseletskiy/Documents/nim${path}`)
      // res.send(process(data, type))
      res.sendFile(`/Users/leshaseletskiy/Documents/nim${path}`)
    } else if (type == 'md') {
      const data = await fs.readFile(`/Users/leshaseletskiy/Documents/nim${path}`, 'utf-8')
      res.send(process(data, type))
    } else {
      const data = await fs.readFile(`/Users/leshaseletskiy/Documents/nim${path}`, 'utf-8')
      res.send(process(data, type))
    }
  } catch (err) {
    console.log(err)
    res.send(err)
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))