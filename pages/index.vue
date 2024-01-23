<!-- pages/websocket.vue -->
<template>
  <div>
    <div class="imgDiv">
     <img :src="imgSrc" alt="Discover Nuxt 3" id="backgroundImg" :style="`left:-${time}vw`"/>
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
    <div id="visual" :style="`opacity: ${visualOpacity}`"></div>
    <div id="audio" :style="`opacity: ${audioOpacity}`"></div>
    <div v-if="interaction && visualOpacity === 1">
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
      chapter: 3,
      imgSrc: "/images/chapters/2.png",
      interaction: true,
      storyStarted: false,
      connectionJson: {
        name: 'connection',
        value: 'projector'
      },
      time: 0,
      maxTime: 100,
      visualOpacity: 1,
      audioOpacity: 0,
      visualInteract: [{
          id: 1,
          class: `visualI chapter2`,
          video: `/images/chapters/chapter-${2}/${1}.webm`,
          style: `margin-top: 5px;margin-left: 8px`
        }],
      instumentUsed: {},
      leftP: 0,
      animWidth: 100,
      animAuto: [],
      animAutoTime: [],
      chapter4Visu: 0,
      socket : null
    }
  },
  watch: {
    time: {
      handler(value) {
        if (value < this.maxTime && !this.interaction && this.storyStarted) {
          if(this.animAutoTime.includes(value)) {
            console.log("##############################################################")
            var anim = document.getElementById(value)
            anim.style.opacity = 1
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
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
          this.time ++
        } else { 
          if (typeof data.value === "object") {
            this.instumentUsed = data.value
          }
          this.interaction = true
          if (data.value === 'audio') {
            this.audioOpacity = 1
          }
          if (data.value === 'visual') {
            this.visualOpacity = 1
            this.visualInteract = []
            if (this.chapter === 4) {
              this.chapter4Visu += 1
              this.chapter = this.chapter4Visu === 2 ? 45 : 4
            }
            if (this.chapter === 3) {
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
        this.addVisualIntend(data.idInput)
      }
      if (data.name === 'chapter') {
        this.storyStarted = false
        this.time = 0
        this.chapter = data.value
        this.imgSrc = `/images/chapters/${this.chapter}.png`
        this.animAuto = []
        this.animAutoTime = []
        var dataInt = parseInt(data.value)
        if (dataInt === 2 || dataInt === 6 || dataInt === 8) {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/end.webm`, time:80, class: "emp"}]
          this.animAutoTime = [80]
        }
        if (dataInt === 4) {
          this.chapter4Visu = 0
        }
        if (dataInt === 3) {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/lulu.webm`, time:55, class: "lulu1" }, {image: `/images/chapters/chapter-${this.chapter}/lulu2.png`, time:85, class: "lulu", style:true }]
          this.animAutoTime = [55, 85]
        }
        if (dataInt === 7) {
          this.animAuto = [{image: `/images/chapters/chapter-${this.chapter}/requin1.png`, time:35, class: "requin1", style:true }, {image: `/images/chapters/chapter-${this.chapter}/requin2.png`, time:35.5, class: "requin2", style:true }, {image: `/images/chapters/chapter-${this.chapter}/requin3.png`, time:36, class: "requin3", style:true }]
          this.animAutoTime = [35, 35.5, 36 ]
        }
      }
      if (data.name === 'rover') {
        this.leftP = (parseFloat(data.value) / 2.1) * 1920
        console.log(this.leftP)
      }
      if (data.name === 'connection') {
        this.time = 0
        this.storyStarted = 0
        this.chapter = 1
        this.imgSrc = `/images/chapters/${this.chapter}.png`
        this.interaction = false
        this.visualOpacity = 0
        this.audioOpacity = 0
        this.visualInteract = []
        this.instumentUsed = {}
        this.leftP = 0
      }
    },
    addToTravelling() {
      this.timer = 1
    },
    addVisualIntend(idInput) {
      if (this.instumentUsed.hasOwnProperty(idInput)) {
        let videoId = 1
        if (["turnSphero"].includes(idInput)) {
          videoId = 2
        }
        this.visualInteract.push({
          id: this.visualInteract.length + 1,
          class: `visualI chapter${this.chapter} type${videoId}-${this.chapter}`,
          video: `/images/chapters/chapter-${this.chapter}/${videoId}.webm`,
          style: this.getRandomTopLeft()
        })
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
        }, 1000)
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

#visual {
  position: relative;
  width: 50px;
  height: 50px;
  background-color: blue;
  transition: all 0.5s linear;
  z-index:1;
}

#audio {
  position: relative;
  width: 50px;
  height: 50px;
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

video {
  position: absolute;
  width: 75%;
  left: -50%;
  transition: all 1s;
}

.emp {
  left: 35%;
  bottom: 0;
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

.requin1 {
  position: absolute;
  top:25%;
  margin-left: 35vw;
  transition: left 0.5s;
}

.requin2 {
  position: absolute;
  top:25%;
  margin-left: 53vw;
  transition: left 0.5s;
}

.requin3 {
  position: absolute;
  top:25%;
  margin-left: 65vw;
  transition: left 0.5s;
}

.vAnim {
  transition: all 1s;
}

.lulu1 {
  top:0;
  left: 35%;
  width: 60%;
}
</style>
