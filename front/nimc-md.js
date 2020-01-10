(() => {
  customElements.define('nimc-md', class extends HTMLElement {
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
      </style>
      <div></div>`
    }
    set data(value) {
      console.log(value)
      this.shadowRoot.querySelector('div').innerHTML = `${value}`
    }
  })
})()