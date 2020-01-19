class nDot extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML += `<div></div><style>
    :host div{
      width:100%;
      height:100%;
      background:#272727;
    }
    </style>`
  }
  connectedCallback() {
    if (this.innerHTML) {
      this.data = this.innerHTML
    }
  }
  set data(value) {
    // console.log(value)
    const parsedData = vis.networkDOTParser.parseDOT(value)
    const data = {
      nodes: parsedData.nodes,
      edges: parsedData.edges
    }
    data.nodes.forEach(e => {
      let { attr } = e
      for (let key in attr) {
        if (key == 'c') {
          e.color = {
            background: HSLToHex(attr.c, 94, 79),
            border: HSLToHex(attr.c, 81, 54),
            highlight: {
              background: HSLToHex(attr.c, 100, 91),
              border: HSLToHex(attr.c, 81, 54)
            }
          }
        } else {
          e[key] = attr[key]
        }
      }
      delete e.attr
    });
    console.log(data)
    const options = {
      nodes: {
        shape: 'circle'
      },
      edges: {
        arrows: {
          to: { enabled: true }
        }
      }
    }
    if (this.getAttribute('height')) {
      options.height = this.getAttribute('height')
    }
    if (this.getAttribute('width')) {
      options.width = this.getAttribute('width')
    }
    let x = new vis.Network(this.shadowRoot.querySelector('div'), data, options)
    // let x = new vis.Network(this.shadowRoot, data, options)

  }
}
customElements.define('nimc-dot', nDot)