<!-- pages/websocket.vue -->
<template>
  <div>
    <div class="imgDiv">
     <img :src="imgSrc" alt="Discover Nuxt 3" id="backgroundImg" :style="`left:-${time}vw`"/>
     <div style="width:3840px">
      <div v-if="animAuto.length !== 0">
        <div v-for="anim in animAuto" :key="anim.time" :id="anim.time" class="vAnim">
          <video :class="anim.class" autoplay muted loop :style="anim.style ? `left:-${time - anim.time}vw` : ''">
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
        <div :style="`left:${leftP}%`" :class="i.class" :id="i.id">
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
      imgSrc: "/images/chapters/3.png",
      interaction: true,
      storyStarted: false,
      connectionJson: {
        name: 'connection',
        value: 'projector'
      },
      time: 0,
      maxTime: 75,
      visualOpacity: 1,
      audioOpacity: 0,
      visualInteract: [{
          id: 1,
          class: `visualI chapter3`,
          video: `/images/chapters/chapter-${3}/${1}.webm`
        }],
      instumentUsed: {},
      leftP: 0,
      animWidth: 75,
      animAuto: [],
      animAutoTime: [],
      chapter4Visu: 0
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
            this.time += 0.25
          }, 250)
        }
      },
      immediate: true
    }
  },
  async mounted() {
    // Connectez-vous au WebSocket ici
    const socket = new WebSocket('ws://localhost:3001'); // Remplacez l'URL par celle de votre serveur WebSocket
    
    socket.addEventListener('open', (event) => {
      console.log('WebSocket ouvert');
      socket.send(JSON.stringify(this.connectionJson))
    });

    socket.addEventListener('message', (event) => {
      console.log('Message reçu:', event.data);
      const data = this.stringToJson(event.data)
      this.handleInfo(data)
    });

    socket.addEventListener('close', (event) => {
      console.log('WebSocket fermé');
    });

    socket.addEventListener('error', (event) => {
      console.error('Erreur WebSocket:', event);
    })
    console.log("hey")
  },
  methods: {
    stringToJson(string) {
      try {
        var jsonObj = JSON.parse(string);
        console.log(jsonObj)
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
            if (this.chapter == 4) {
              this.chapter4Visu += 1
              this.chapter = this.chapter4Visu === 2 ? 45 : 4
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
        if (data.value === "2") {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/end.webm`, time:65, class: "emp"}]
          this.animAutoTime = [65]
        }
        if (data.value === "4") {
          this.chapter4Visu = 0
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/lueeur.webm`, time:55, class: "lue" , style:`left:-${this.time}vw`}]
          this.animAutoTime = [55]
        }
        if (data.value === "3") {
          this.animAuto = [{video: `/images/chapters/chapter-${this.chapter}/lulu.webm`, time:65, class: "lulu" }]
          this.animAutoTime = [65]
        }
      }
      if (data.name === 'rover') {
        this.leftP = (parseInt(data.value) / 2.0) * 100
      }
      if (data.name === 'connection') {
        console.log('connection')
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
          class: `visualI chapter${this.chapter}`,
          video: `/images/chapters/chapter-${this.chapter}/${videoId}.webm`,
        })
        this.anim()
      }
    },
    anim() {
      let allVisu = document.getElementsByClassName("visualI")
      let lastVisu = allVisu[allVisu.length - 1]
      console.log(allVisu, lastVisu)
      lastVisu.style.opacity = 1
      setTimeout(() => {
          lastVisu.style.opacity = 0
      }, 3000)
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
  z-index: 2;
  width: 100%;
  height: 100%;
  transition: all 2s;
  opacity: 0;
}

video {
  position: absolute;
  width: 75%;
}

.turnSphero {
  background-color: aquamarine;
}

.tapSphero {
  background-color: cornflowerblue;
}
.button1 {
  background-color: violet;
}

.button2 {
  background-color: cadetblue;
}

.rotocoder {
  background-color: crimson;
}

.micro {
  background-color: gold;
}

.emp {
  right: -10%;
  bottom: 0;
  opacity: 0;
}

.lue {
  top: -55%;
}

.chapter4 {
  top: -25%;
}

.chapter45 {
  top: -25%;
}

.vAnim {
  opacity: 0;
}

.chapter3 {
  top: 0;
}

.lulu {
  top:0;
}
</style>
