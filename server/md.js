const markit = require('markdown-it')({
  html: true,
})

// markit.use(require('markdown-it-wiki-toc'))

exports.md = value => {
  return markit.render(value)
}