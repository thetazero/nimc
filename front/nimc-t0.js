(() => {
  customElements.define('nimc-t0', class extends HTMLElement {
    constructor() {
      super()
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>
      :host{
        font-weight:200;
        line-height:125%;
      }
      a:link,a:visited {
        color: hsl(200, 100%, 80%);
      }
      table {
        border-collapse: collapse;
        color:#ccc;
      }
      th{
        color:#fff;
      }
      table, th, td{
        border:1px solid #999;
      }
      th,td {
        padding:5px 15px;
      }
      .dot-container{
        border:1px solid #555;
        text-align:center;
        display:inline-block;
        margin:0px;
      }
      nimc-tex.inline{
        // font-size:0.826446281em;
      }
      </style>
      <div></div>`
    }
    set data(value) {
      console.log(value)
      this.shadowRoot.querySelector('div').innerHTML = `${markdown(value)}`
    }
  })
  function markdown(value) {
    let tokens = tokenize(value)
    return render(ast(tokens)) + "<br><br><hr><br>" + tokens.map(e => {
      return e.toString()
    }).join(', ')
  }
  function render(ast) {
    let string = ''
    ast.children.forEach(e => {
      string += e.open()
      string += render(e)
      string += e.close()
    })
    return string
  }
  function ast(tokens) {
    let root = {
      children: []
    }
    let path = []
    let h_started = false
    let started = {

    }
    for (let i = 0; i < tokens.length; i++) {
      let { type, value } = tokens[i]
      if (h_started && type == 'newline') {
        path = []
        h_started = false
      } else if (type == 'newline') {
        if (tokens[i + 1] && tokens[i + 1].type == 'newline') {
          let p = new Node('paragraph', '')
          path = [p]
          root.children.push(p)
        } else {
          if (path.length) {
            path[path.length - 1].children.push(new Node('text', ' '))
          }
        }
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(type)) {
        h_started = true
        let it = new Node(type)
        root.children.push(it)
        path = [it]
      } else if (['text', 'katex', 'linebreak', 'tabspace'].includes(type)) {
        let it = new Node(type, value)
        if (path.length) {
          path[path.length - 1].children.push(it)
        } else {
          let p = new Node('paragraph', '')
          p.children.push(it)
          path = [p]
          root.children.push(p)
        }
      } else if (['bold', 'italic'].includes(type)) {
        if (started[type]) {
          started[type] = false
          path.pop()
        } else {
          started[type] = true
          let it = new Node(type, '')
          path[path.length - 1].children.push(it)
          path.push(it)
        }
      } else if (type == 'code') {
        let it = new Node(type, value)
        path[path.length - 1].children.push(it)
      } else if (type == 'bgroup') {
        if (tokens[i + 1].type = 'pgroup') {
          let it = new Node('link', {
            name: value,
            url: tokens[i + 1].value
          })
          path[path.length - 1].children.push(it)
          i++
        }
      } else if (type == 'image') {
        if (tokens[i + 1].type = 'bgroup') {
          if (tokens[i + 2].type = 'pgroup') {
            let it = new Node('image', {
              alt: tokens[i + 1].value,
              src: tokens[i + 2].value
            })
            if (path.length) path[path.length - 1].children.push(it)
            else root.children.push(it)
            i += 2
          }
        }
      } else if (type == 'list') {
        if (!(path.length && path[0].type == 'list-container')) {
          let container = new Node('list-container')
          path = [container]
          root.children.push(container)
        }
        let it = new Node('list')
        path[0].children.push(it)
        path[1] = it
        path = path.slice(0, 2)
      } else if (type == 'code-block' || type == 'katex-block') {
        let it = new Node(type, value)
        path = []
        root.children.push(it)
      } else if (type == 'dot') {
        let it = new Node('dot', value)
        path = []
        root.children.push(it)
      }
    }
    return root
  }
  function tokenize(value) {
    if (value[value.length - 1] != '\n') value += '\n'
    let tokens = []
    let stackstart = 0
    let blockstarted = false
    for (let i = 0; i < value.length; i++) {
      if (value[i] == '#') {//#
        if (value[i + 1] == ' ') {
          tokens.push(new Token('h1'))
          stackstart = i + 2
        } else if (value.slice(i + 1, i + 3) == '# ') {
          tokens.push(new Token('h2'))
          i = i + 1
          stackstart = i + 2
        }
      } else if (value[i] == '*') {//*
        tokens.push(new Token('text', value.slice(stackstart, i)))
        if (value[i + 1] != '*') {
          tokens.push(new Token('italic'))
          stackstart = i + 1
        } else {
          tokens.push(new Token('bold'))
          stackstart = i + 2
          i++
        }
      } else if (value[i] == '$') {
        if (value[i + 1] == '$') {
          for (let j = i + 2; j < value.length; j++) {
            if (value.slice(j, j + 2) == '$$') {
              if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
              tokens.push(new Token('katex-block', value.slice(i + 2, j)))
              console.log(value.slice(i, j))
              stackstart = j + 2
              i = j + 1
              break
            }
          }
        } else {
          for (let j = i + 1; j < value.length; j++) {
            if (['\n'].includes(value[j])) break
            if (value[j] == '$') {
              if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
              tokens.push(new Token('katex', value.slice(i + 1, j)))
              console.log(value.slice(i, j))
              stackstart = j + 1
              i = j
              break
            }
          }
        }
      } else if (value[i] == '\n') {//newline
        if (stackstart != i) {
          tokens.push(new Token('text', value.slice(stackstart, i)))
        }
        tokens.push(new Token('newline'))
        stackstart = i + 1
      } else if (value[i] == '[') {//[]
        for (let j = i; j < value.length; j++) {
          if (['\n'].includes(value[j])) break
          if (value[j] == ']') {
            if (value[j + 1] != '(') break
            if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
            tokens.push(new Token('bgroup', value.slice(i + 1, j)))
            stackstart = j + 1
            i = j
            break
          }
        }
      } else if (value[i] == '(') {
        if (value[i - 1] == ']') {
          if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
          for (let j = i; j < value.length; j++) {
            if (['\n'].includes(value[j])) break
            if (value[j] == ')') {
              tokens.push(new Token('pgroup', value.slice(i + 1, j)))
              stackstart = j + 1
              i = j
              break
            }
          }
        }
      } else if (value.slice(i, i + 2) == '![') {
        if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
        tokens.push(new Token('image'))
        stackstart = i + 1
      } else if (value.slice(i - 1, i + 2) == '\n- ') {
        if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
        tokens.push(new Token('list'))
        stackstart = i + 2
        i++
      } else if (value.slice(i - 1, i + 1) == '\n:') {
        tokens.push(new Token('linebreak'))
        stackstart = i + 1
        if (value[i + 1] == ':') {
          let j = i + 1;
          while (value[j] == ':') {
            j++
          }
          stackstart = j
          tokens.push(new Token('tabspace', j - i - 1))
        }
      } else if (value[i] == '`') {
        if (value.slice(i, i + 3) == '```') {
          for (let j = i + 1; j < value.length; j++) {
            if (value.slice(j, j + 3) == '```') {
              if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
              tokens.push(new Token('code-block', value.slice(i + 3, j)))
              stackstart = j + 4
              i = j + 3
              break
            }
          }
        }
        for (let j = i + 1; j < value.length; j++) {
          if (['\n'].includes(value[j])) break
          if (value[j] == '`') {
            if (stackstart != i) tokens.push(new Token('text', value.slice(stackstart, i)))
            tokens.push(new Token('code', value.slice(i + 1, j)))
            stackstart = j + 1
            i = j
            break
          }
        }
      } else if (value[i] == '{') {
        let custom_type = false
        for (let j = i; j >= 0; j--) {
          if (['\n', ' '].includes(value[j])) {
            custom_type = value.slice(j + 1, i)
            break
          }
        }
        let types = ['dot']
        if (!types.includes(custom_type)) continue
        for (let j = i + 1; j < value.length; j++) {
          if (value[j] == '}') {
            if (stackstart < i - 3) tokens.push(new Token('text', value.slice(stackstart, i - 3)))
            tokens.push(new Token(custom_type, value.slice(i + 1, j)))
            stackstart = j + 1
            i = j
            break
          }
        }
      }
    }
    return tokens
  }
  function Node(type, value) {
    this.type = type
    this.value = value
    this.children = []
    this.open = function () {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(this.type)) {
        return `<${this.type}>`
      } else if (this.type == 'text') {
        return this.value
      } else if (this.type == 'paragraph') return '<p>'
      else if (this.type == 'bold') return '<b>'
      else if (this.type == 'italic') return '<i>'
      else if (this.type == 'code') return `<code>${this.value}`
      else if (this.type == 'link') return `<a href='${this.value.url}'>${this.value.name}`
      else if (this.type == 'image') return `<img src='${this.value.src}' alt='${this.value.alt}'>`
      else if (this.type == 'list-container') return `<ul>`
      else if (this.type == 'list') return `<li>`
      else if (this.type == 'code-block') return `<p><pre>${this.value}`
      else if (this.type == 'dot') return `<p class='dot-container'><nimc-dot height=400px width=400px>bigraph{${this.value}}`
      else if (this.type == 'katex') return `<nimc-tex class='inline'>${this.value}`
      else if (this.type == 'katex-block') return `<p><nimc-tex>${this.value}`
      else if (this.type == 'linebreak') return `<br/>`
      else if (this.type == 'tabspace') return '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(this.value)
      return `?${this.type}?`
    }
    this.close = function () {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(this.type)) {
        return `</${this.type}>`
      } else if (this.type == 'text') {
        return ''
      } else if (this.type == 'paragraph') return '</p>'
      else if (this.type == 'bold') return '</b>'
      else if (this.type == 'italic') return '</i>'
      else if (this.type == 'code') return `</code>`
      else if (this.type == 'link') return '</a>'
      else if (['image', 'linebreak', 'tabspace'].includes(this.type)) return ``
      else if (this.type == 'list-container') return `</ul>`
      else if (this.type == 'list') return `</li>`
      else if (this.type == 'code-block') return `</p></pre>`
      else if (this.type == 'dot') return `</nimc-dot></p>`
      else if (this.type == 'katex') return `</nimc-tex>`
      else if (this.type == 'katex-block') return `</p></nimc-tex>`
      return `?${this.type}?`
    }
  }
  function Token(type, value) {
    this.type = type
    this.value = value ? value : ''
    this.toString = function () {
      if (this.type == 'text') {
        return this.value = `"${this.value}"`
      } else if (this.type == 'h1') {
        return `[h1]`
      } else if (this.type == 'h2') {
        return `[h2]`
      } else if (this.type == 'bold') {
        return `<b>[bold]</b>`
      } else if (this.type == 'italic') {
        return `<i>[italic]</i>`
      } else if (this.type == 'newline') {
        return `\\n`
      } else if (this.type == 'bgroup') {
        return `:[${this.value}]:`
      } else if (this.type == 'pgroup') {
        return `:(${this.value}):`
      } else if (this.type == 'image') {
        return `&lt;image&gt;`
      } else if (this.type == 'list') {
        return `-`
      } else if (this.type == 'code') {
        return `\`${this.value}\``
      } else {
        return `[${this.type}]:${this.value}`
      }
    }
  }
})()