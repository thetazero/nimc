const { md } = require('./md')

exports.process = (data, type) => {
  if (type == 'md') {
    return md(data)
  } else {
    return data
  }
}