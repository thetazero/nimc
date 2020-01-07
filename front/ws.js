const url = 'ws://localhost:3544'

const connection = new WebSocket(url)

connection.onopen = () => {
  connection.send(path)
}

connection.onerror = err => {
  console.log(`WebSocket Error ${err}`)
}

connection.onmessage = e => {
  let type = path.split('.')
  if (type.length) type = type[1]
  else type = null
  render(e.data, type)
}