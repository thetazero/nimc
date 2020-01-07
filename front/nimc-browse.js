customElements.define('nimc-browse', class extends HTMLElement {
  constructor() {
    super()
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
    :host{
      overflow-x:hidden;
      width:180px;
      display:inline-block;
    }
    div{
      white-space:nowrap;
    }
    a{
      color:#ccc !important;
      text-decoration:none !important;
    }
    a:hover{
      text-decoration:underline !important;
      color:hsl(200,100%,70%) !important;
      cursor:pointer;
    }
    span{
      font-size:10px;
    }
    <style>`
    this._container = document.createElement('div')
    shadow.appendChild(this._container)
  }
  set data(data) {
    this._container.innerHTML = ''
    this._container.appendChild(this._render(data, -1))
  }
  _render(data, debth) {
    let div = document.createElement('div')
    if (debth > -1) {
      div.innerHTML = `<span>${'-'.repeat(debth)}</span><a href='#${data.path}'>${data.name}</a>`
    }
    // console.log(div.innerText, data)
    if (data.children) {
      data.children.forEach(child => {
        let elem = this._render(child, debth + 1)
        div.appendChild(elem)
      })
    }
    return div
  }
  set query(value) { }
})