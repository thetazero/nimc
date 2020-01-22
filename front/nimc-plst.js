customElements.define('nimc-plst', class extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<div class='container'>
      <div class='main-title'></div>
      <div class='songs'></div>
      <input type='range' step='0.1'>
      <div class='controls'>
        <a class='circle left'>&lt;</a>
        <a class='playpause'>play</a>
        <a class='circle right'>&gt;</a>
      </div>
      <audio controls>
        <source src="horse.mp3" type="audio/mpeg">
      </audio>
    </div>
    <style>
      :host{
        display:block;
        text-align:center;
        padding:40px 0px;
      }
      .container{
        min-height:200px;
        width:60vw;
        min-width:450px;
        display:inline-block;
        word-wrap: break-word;
        background:#222;
        border-radius:7px;
      }
      .main-title{
        border-bottom:3px solid #555;
        font-size:2em;
        padding:10px 20px;
      }
      .songs{
        padding:10px 0px;
        max-height:60vh;
        overflow-y:scroll;
      }
      .songs::-webkit-scrollbar {
        display: none;
      }
      .a-song{
        font-size:1.1em;
        padding:5px 20px;
        text-align:left;
        cursor:pointer;
        color:#ccc;
      }
      .a-song .title{
        min-width:calc(450px - 130px);
        -width:calc(60vw - 130px);
        display:inline-block;
        white-space:nowrap;
        overflow:hidden;
      }
      .a-song .meta{
        font-size:0.91em;
        color:#999;
        float:right;
      }
      .a-song:hover{
        color:hsl(180,100%,90%)
      }
      .a-song.active{
        background:hsl(180, 90%, 13%);
      }
      .controls{
        padding-bottom:15px;
        padding-top:6px;
        user-select:none;
      }
      .controls a.circle{
        width:40px;
        font-size:1.2em;
        cursor:pointer;
        display:inline-block;
        background:hsl(180,100%,40%);
        border-radius:50%;
      }
      .controls a.circle:hover{
        background:hsl(180,100%,30%);
      }
      .controls a{
        height:40px;
        line-height:40px;
        cursor:pointer;
      }
      .playpause{
        margin:0px 10px;
      }
      .playpause:hover{
        color:hsl(180,100%,90%)
      }
      audio{
        display:none;
      }
      input[type="range"]{
        width:100%;
        height:13px;
        background: transparent;
        -webkit-appearance: none;
        outline:none;
        margin:0px;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
      }
      input[type=range]::-webkit-slider-thumb {
        height: 13px;
        width: 13px;
        border-radius: 50%;
        background:hsl(180,50%,40%);
        cursor: pointer;
        margin-top: -4.5px;
      }
      input[type=range]:focus::-webkit-slider-thumb {
        background:hsl(180,100%,40%);
      }
      input[type=range]::-webkit-slider-runnable-track {
        height: 3px;
        cursor: pointer;
        background: #555;
      }
    </style>`
  }
  set data(data) {
    function setup(i) {
      if (i > data.songs.length - 1) i = 0
      if (i < 0) i = data.songs.length - 1
      progress.value = 0
      elems[last].classList.remove('active')
      let oldmeta = elems[last].querySelector('.meta')
      if (oldmeta) elems[last].removeChild(oldmeta)
      elems[i].classList.add('active')
      audio.innerHTML = `<source src="${data.songs[i].url}" type="audio/mpeg">`
      last = i
    }
    function play() {
      playing = true
      playpause.innerText = 'stop'
      audio.play()
    }
    function pause() {
      playing = false
      playpause.innerText = 'play'
      audio.pause()

    }
    function processTime(time) {
      let ret = ''
      let hours = Math.floor(time / 3600)
      if (hours) ret = `${hours}:`
      let minutes = Math.floor((time - hours * 3600) / 60)
      if (audio.duration >= 3600) ret += `${minutes.toString().padStart(2, '0')}:`
      else if (audio.duration >= 60) ret += `${minutes}:`
      let seconds = Math.floor(time - hours * 3600 - minutes * 60)
      if (audio.duration >= 60) ret += `${seconds.toString().padStart(2, '0')}`
      else ret += seconds.toString().padStart(2, '0')
      return ret
    }
    let shadow = this.shadowRoot
    function updateMeta(it) {
      it = it ? it : shadow.querySelector('.meta')
      it.innerHTML = `${processTime(audio.currentTime)} / ${processTime(audio.duration)}`
    }
    let audio = this.shadowRoot.querySelector('audio')
    let playpause = this.shadowRoot.querySelector('.playpause')
    let progress = this.shadowRoot.querySelector('input[type="range"]')
    data = JSON.parse(data)
    this.shadowRoot.querySelector('.main-title').innerText = data.title
    console.log(data)
    let songs = this.shadowRoot.querySelector('.songs')

    let elems = []
    let last = 0
    let playing = false

    data.songs.forEach((e, i) => {
      let it = document.createElement('div')
      it.classList = 'a-song'
      it.innerHTML = `<span class='title'>${e.name}</span>`
      it.addEventListener('click', () => {
        if (last != i) {
          setup(i)
          audio.load()
          play()
        } else {
          if (playing) pause()
          else play()
        }
      })
      elems.push(it)
      songs.appendChild(it)
    })
    playpause.addEventListener('click', () => {
      if (!playing) play()
      else pause()
    })
    setup(0)
    audio.onended = () => {
      setup(last + 1)
      audio.load()
      play()
    }
    audio.addEventListener('timeupdate', e => {
      let value = Math.round(audio.currentTime / audio.duration * 100)
      if (isNaN(value)) progress.value = 0
      else {
        updateMeta()
        progress.value = value
      }

    })
    audio.onloadeddata = () => {
      console.log('audio loaded')
      let it = document.createElement('span')
      it.classList = 'meta'
      elems[last].appendChild(it)
      updateMeta(it)
    }
    this.shadowRoot.querySelector('.left').addEventListener('click', () => {
      setup(last - 1)
      audio.load()
      play()
    })
    this.shadowRoot.querySelector('.right').addEventListener('click', () => {
      setup(last + 1)
      audio.load()
      play()
    })
    progress.addEventListener('change', () => {
      audio.currentTime = progress.value / 100 * audio.duration
      updateMeta()
    })
  }
})