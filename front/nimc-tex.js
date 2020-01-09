customElements.define('nimc-tex', class extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
    </style>
    <div></div>
    <link rel="stylesheet" href="lib/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">`
  }
  set data(data) {
    console.log(katex, data)
    let div = this.shadowRoot.querySelector('div')
    katex.render(data, div, {
      throwOnError: false
    })
  }
})