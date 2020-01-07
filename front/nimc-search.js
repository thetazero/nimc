customElements.define('nimc-search', class extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<input type='text'>`
    this.addEventListener('keyup', () => {
      query(shadow.querySelector('input').value)
    })
    shadow.innerHTML += `<style>
    input, :host{
      width: 150px;
      height: 30px;
    }
    input:focus{
      outline: none;
      background:#111;
    }
    input{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      font-size:16px;
      background:#222;
      border:none;
      border-radius:3px;
      color:#ccc;
      padding:0px 15px;
    }
    </style>`
  }
})