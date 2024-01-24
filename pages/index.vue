<!-- pages/websocket.vue -->
<template>
  <div>
    <div class="imgDiv">
     <img src="/images/mask.png" id="mask"> 
     <img :src="imgSrc" alt="Discover Nuxt 3" id="backgroundImg" :style="chapter !== 0 ? `left:-${time}vw` : ''"/>
     <div :style="`opacity: ${transitionOpacity}`">
      <video class="transition" muted>
        <source src="/images/TRANSITION.webm" type="video/mp4">
      </video>
     </div>
     <div style="width:3840px">
      <div v-if="animAuto.length !== 0">
        <div v-for="anim in animAuto" :key="anim.time" :id="anim.time" class="vAnim">
          <img v-if="anim.image" :src="anim.image" :class="anim.class" :style="anim.style ? `left:-${time - anim.time}vw` : ''">
          <video v-if="anim.video" :class="anim.class" autoplay muted loop :style="anim.style ? `left:-${time - anim.time}vw` : ''">
              <source :src="anim.video" type="video/mp4">
          </video>
        </div>
      </div>
    </div>
    </div>
    <div id="visual" :style="`opacity: ${visualOpacity}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/OEIL.webm" type="video/mp4">
      </video>
    </div>
    <div id="audio" :style="`opacity: ${audioOpacity}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/OREILLE.webm" type="video/mp4">
      </video>
    </div>
    <div id="demo" :style="`opacity: ${allDemo['turnSphero']}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/turnSphero.webm" type="video/mp4">
      </video>
    </div>
    <div id="demo" :style="`opacity: ${allDemo['tapSphero']}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/tapSphero.webm" type="video/mp4">
      </video>
    </div>
    <div id="demo" :style="`opacity: ${allDemo['micro']}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/micro.webm" type="video/mp4">
      </video>
    </div>
    <div id="demo" :style="`opacity: ${allDemo['button1']}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/button1.webm" type="video/mp4">
      </video>
    </div>
    <div id="demo" :style="`opacity: ${allDemo['button2']}`">
      <video class="interactSignal" autoplay muted loop>
        <source src="/images/button2.webm" type="video/mp4">
      </video>
    </div>
    <div v-if="interaction && visual">
      <template v-for="i in visualInteract" :key="i.id">
        <div :style="i.style" :class="i.class" :id="i.id">
          <video :style="`width:${animWidth}%`" autoplay muted loop >
            <source :src="i.video" type="video/mp4">
          </video>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chapter: 0,
      imgSrc: "/images/chapters/0.png",
      interaction: false,
      storyStarted: false,
      connectionJson: {
        name: 'connection',
        value: 'projector'
      },
      time: 0,
      maxTime: 100,
      visualOpacity: 0,
      audioOpacity: 0,
      visualInteract: [],
      instumentUsed: {},
      leftP: 0,
      animWidth: 100,
      animAuto: [],
      animAutoTime: [],
      chapterVisu: 0,
      socket : null,
      visual: false,
      transitionOpacity: 0,
      demo:false,
      demoVid: "/images/turnSphero.webm",
      demoInstru: "",
      allDemo: {
        turnSphero: 0,
        tapSphero: 0,
        micro: 0,
        button1: 0,
        button2: 0
      }
    }
  },
  watch: {
    time: {
      handler(value) {
        if (value < this.maxTime && !this.interaction && this.storyStarted) {
          if(this.animAutoTime.includes(value)) {
            var anim = document.getElementById(value)
            anim.style.opacity = 1
          }
          setTimeout(() => {
            if (this.chapter === 1 || this.chapter === 5) {
              this.time += 0.5
            } else {
              this.time += 0.25
            }
          }, 250)
        }
      },
      immediate: true
    }
  },
  async mounted() {
    // Connectez-vous au WebSocket ici
    this.socket = new WebSocket('ws://localhost:3001'); // Remplacez l'URL par celle de votre serveur WebSocket
    
    this.socket.addEventListener('open', (event) => {
      this.socket.send(JSON.stringify(this.connectionJson))
    });

    this.socket.addEventListener('message', (event) => {
      const data = this.stringToJson(event.data)
      this.handleInfo(data)
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket fermé');
    });

    this.socket.addEventListener('error', (event) => {
      console.error('Erreur WebSocket:', event);
    })
  },
  methods: {
    stringToJson(string) {
      try {
        var jsonObj = JSON.parse(string);
        return jsonObj
      } catch (error) {
        console.error('Erreur lors de la conversion en JSON :', error.message);
        return error
      }
    },
    handleInfo(data) {
      if (data.name === 'interact' && !data.hasOwnProperty("idInput")) {
        if (data.value === 'false') {
          this.interaction = false
          this.audioOpacity = 0
          this.visualOpacity = 0
          this.visualInteract = []
          this.visual = false
          this.time ++
          this.allDemo = {
            turnSphero: 0,
            tapSphero: 0,
            micro: 0,
            button1: 0,
            button2: 0
          }
        } else { 
          if (this.chapter === 0) {
            console.log(this.instumentUsed)
            var used = Object.keys(this.instumentUsed).find(
              key => this.instumentUsed[key] === true || this.instumentUsed[key] === "true"
            )
            this.allDemo[used] = 1
            if (data.value === "visual") {
              console.log("huhuhuh")
              this.visual = true
              this.visualInteract = []
            }
          }
          if (typeof data.value === "object") {
            this.instumentUsed = data.value
          }
          this.interaction = true
          if (data.value === 'audio' && this.chapter !== 0) {
            this.audioOpacity = 1
          }
          if (data.value === 'visual' && this.chapter !== 0) {
            this.visualOpacity = 1
            this.visual = true
            this.visualInteract = []
            if ([4, 10, 12, 15, 18, 20, 23, 26].includes(this.chapter)) {
              this.chapterVisu += 1
              this.chapter = this.chapterVisu === 2 ? parseInt(`${this.chapter}5`) : this.chapter
            }
            if ([3, 22, 25].includes(this.chapter)) {
              this.animAuto = this.animAuto.slice(-1)
              this.animAutoTime = this.animAutoTime.slice(-1)
            }
          }
        }
      }
      if (data.name === 'story') {
        this.chapter = parseInt(data.value)
        this.imgSrc = `/images/chapters/${this.chapter}.png`
        this.storyStarted = data.value
        this.time = 1
      }
      if (data.name === "rpi" && data.hasOwnProperty("idInput")) {
        if (this.interaction) {
          this.visualOpacity = 0
          this.audioOpacity = 0
          this.allDemo = {
            turnSphero: 0,
            tapSphero: 0,
            micro: 0,
            button1: 0,
            button2: 0
          }
        }
        this.addVisualIntend(data.idInput)
      }
      if (data.name === 'chapter') {
        var transition = document.getElementsByClassName("transition")[0]
        transition.currentTime = 0
        this.transitionOpacity = 1
        transition.play()
        setTimeout(() => {
            this.time = 0
            this.imgSrc = `/images/chapters/${this.chapter}.png`
            console.log("hey")
        }, 3000)
        setTimeout(() => {
            this.transitionOpacity = 0
        }, 7000)
        this.storyStarted = false
        this.animAuto = []
        this.animAutoTime = []
        var dataInt = parseInt(data.value)
        this.chapter = dataInt
        if ([2, 6, 8, 13, 16, 19, 21, 24].includes(dataInt)) {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/end.webm`, time:60, class: "emp"}]
          this.animAutoTime = [60]
        }
        if ([4, 10, 12, 15, 18, 20, 23, 26].includes(dataInt)) {
          this.chapterVisu = 0
        }
        if ([3, 22].includes(dataInt)) {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/lulu.webm`, time:45, class: "lulu1" }, {image: `/images/chapters/chapter-${this.chapter}/lulu2.png`, time:65, class: "lulu", style:true }]
          this.animAutoTime = [45, 65]
        }
        if ([7, 17].includes(dataInt)) {
          this.animAuto = [{image: `/images/chapters/chapter-${this.chapter}/animal1.png`, time:25, class: "animal1", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal2.png`, time:25.5, class: "animal2", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal3.png`, time:26, class: "animal3", style:true }]
          this.animAutoTime = [25, 25.5, 26]
        }
        if ([11].includes(dataInt)) {
          this.animAuto = [{image: `/images/chapters/chapter-${this.chapter}/animal1.png`, time:25, class: "animal1-b", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal2.png`, time:25.5, class: "animal2-b", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal3.png`, time:26, class: "animal3-b", style:true }]
          this.animAutoTime = [25, 25.5, 26]
        }
        if ([14].includes(dataInt)) {
          this.animAuto = [{image: `/images/chapters/chapter-${this.chapter}/animal1.png`, time:25, class: "animal1-again", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal2.png`, time:25.5, class: "animal2-again", style:true }]
          this.animAutoTime = [25, 25.5]
        }
        if ([9].includes(dataInt)) {
          this.animAuto = [{image: `/images/chapters/chapter-${this.chapter}/animal1.png`, time:25, class: "animal1-only", style:true }]
          this.animAutoTime = [25]
        }
        if (dataInt === 25) {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/lulu.webm`, time:45, class: "lulu1" }, {image: `/images/chapters/chapter-${this.chapter}/animal1.png`, time:65, class: "animal1-b-s", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal2.png`, time:65.5, class: "animal2-b-s", style:true }, {image: `/images/chapters/chapter-${this.chapter}/animal3.png`, time:66, class: "animal3-b-s", style:true }]
          this.animAutoTime = [45, 65, 65.5, 66]
        }
      }
      if (data.name === 'rover') {
        this.leftP = (parseFloat(data.value) / 2.1) * 1920
        console.log(this.leftP)
      }
      if (data.name === 'startStory') {
        this.time = 0
        this.storyStarted = 0
        this.chapter = 0
        this.imgSrc = `/images/chapters/${this.chapter}.png`
        this.interaction = false
        this.visualOpacity = 0
        this.audioOpacity = 0
        this.visualInteract = []
        this.instumentUsed = {}
        this.leftP = 0
        this.allDemo = {
          turnSphero: 0,
          tapSphero: 0,
          micro: 0,
          button1: 0,
          button2: 0
        }
      }
    },
    addToTravelling() {
      this.timer = 1
    },
    addVisualIntend(idInput) {
      if (this.instumentUsed.hasOwnProperty(idInput)) {
        let videoId = 1
        if (["turnSphero", "button1", "rotocoder"].includes(idInput)) {
          videoId = 2
        }
        let randomTopLeft = this.getRandomTopLeft()
        if (this.chapter === 0) {
          randomTopLeft = "`margin-top: 114px;margin-left: 1000px`"
        }
        this.visualInteract.push({
          id: this.visualInteract.length + 1,
          class: `visualI chapter${this.chapter} type${videoId}-${this.chapter}`,
          video: `/images/chapters/chapter-${this.chapter}/${videoId}.webm`,
          style: randomTopLeft
        })
        console.log(randomTopLeft)
        this.anim()
      }
    },
    anim() {
      let allVisu = document.getElementsByClassName("visualI")
      let lastVisu = allVisu[allVisu.length - 1]
      if (lastVisu !== undefined) {
        lastVisu.style.opacity = 1
        setTimeout(() => {
            lastVisu.style.opacity = 0
        }, 2000)
      }
    },

    getRandomTopLeft() {
      let top = Math.floor(Math.random() * 200)
      let left = Math.floor(Math.random() * 200) + this.leftP
      return `margin-top: ${top}px;margin-left: ${left}px`
    }
  }
};
</script>

<style>
body{
  overflow: hidden;
}
</style>

<style scoped>
#backgroundImg {
  height: 100vh;
  position: fixed;
  top: 0;
  transition: all 0.25s linear;
  z-index: 0;
}

#mask {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
}

#visual {
  position: relative;
  background-color: blue;
  transition: all 0.5s linear;
  z-index:1;
}

#audio {
  position: relative;
  background-color: green;
  transition: all 0.5s linear;
  z-index: 1;
}

.visualI {
  position:absolute;
  top: 10%;
  z-index: 2;
  width: 100%;
  height: 100%;
  transition: all 2s;
  opacity: 0;
}

.chapter0 {
  width: 40vw;
  left:50%;
  top:27%;
}

.interactSignal {
  width: 100vw;
  left: 0;
  height: 100vh;
  top: 0;
}

.transition {
  width: 100vw;
  left: 0;
  height: 100vh;
  top: 0;
  z-index: 3;
}

video {
  position: absolute;
  width: 75%;
  left: -50%;
  transition: all 1s;
}

.emp {
  left: 35%;
  bottom: 0;
  transition: all 1s;
}

.lue {
  top: -55%;
}

.chapter4 {
  top: -35%;
}

.type2-4 {
  width: 60%;
}

.chapter13 {
  width: 20vw;
  top: 45%;
}

.chapter45 {
  top: -5%;
}

.vAnim {
  opacity: 0;
}

.chapter3 {
  top: 0;
}

.lulu {
  position: absolute;
  top:25%;
  left: 35%;
  margin-left: 60vw;
  transition: left 0.5s;
}

.animal1 {
  position: absolute;
  top:25%;
  margin-left: 35vw;
  transition: left 0.5s;
}

.animal2 {
  position: absolute;
  top:25%;
  margin-left: 53vw;
  transition: left 0.5s;
}

.animal3 {
  position: absolute;
  top:25%;
  margin-left: 65vw;
  transition: left 0.5s;
}

.animal1-b {
  position: absolute;
  top:70%;
  margin-left: 35vw;
  transition: left 0.5s;
}

.animal2-b {
  position: absolute;
  top:70%;
  margin-left: 53vw;
  transition: left 0.5s;
}

.animal3-b {
  position: absolute;
  top:70%;
  margin-left: 65vw;
  transition: left 0.5s;
}

.animal1-b-s {
  position: absolute;
  top:70%;
  margin-left: 35vw;
  transition: left 0.5s;
  width: 30vw;
}

.animal2-b-s {
  position: absolute;
  top:70%;
  margin-left: 53vw;
  transition: left 0.5s;
  width:30vw;
}

.animal3-b-s {
  position: absolute;
  top:70%;
  margin-left: 65vw;
  transition: left 0.5s;
  width: 30vw;
}

.vAnim {
  transition: all 1s;
}

.lulu1 {
  top:0;
  left: 35%;
  width: 60%;
}

.animal1-again {
  position: absolute;
  top:25%;
  margin-left: 35vw;
  transition: left 0.5s;
  width: 20vw;
}

.animal2-again {
  position: absolute;
  top:45%;
  margin-left: 53vw;
  transition: left 0.5s;
  width: 30vw;
}

.animal1-only {
  position: absolute;
  top:55%;
  margin-left: 35vw;
  transition: left 0.5s;
  width: 20vw;
}
</style>
