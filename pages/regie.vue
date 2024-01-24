<template>
  <div class="tablette_musicale">
    <audio loop id="backgroundAudio">
      <source :src="backgroundSound">
    </audio>
    <div class="flex">
      <button v-on:click="sendTabletteMusicaleMessage('turnSphero')" class="btn btn-primary">turnSphero</button>
      <button v-on:click="sendTabletteMusicaleMessage('tapSphero')" class="btn btn-primary">tapSphero</button>
      <button v-on:click="sendTabletteMusicaleMessage('micro')" class="btn btn-primary">micro</button>
      <button v-on:click="sendTabletteMusicaleMessage('button1')" class="btn btn-primary">button1</button>
      <button v-on:click="sendTabletteMusicaleMessage('button2')" class="btn btn-primary">button2</button>
      <button v-on:click="sendTabletteMusicaleMessage('rotocoder')" class="btn btn-primary">rotocoder</button>
    </div>
    <br>
    <div>
      <div v-for="(value, key) in checkboxes" :key="key">
        <input type="checkbox" v-model="checkboxes[key]" :id="key">
        <label :for="key">{{ key }}</label>
      </div>
      <div class="flex">
          <div>
            <input type="radio" id="chapter1" name="chapter" value="visual" v-model="selectedInteractionType">
            <label for="chapter1">Visuel</label>
          </div>
          <div>
            <input type="radio" id="chapter2" name="chapter" value="audio" v-model="selectedInteractionType">
            <label for="chapter2">Audio</label>
          </div>
        <button class="btn btn-primary" @click="generateJson">Lancer interaction</button>
        <button class="btn btn-primary" @click="allumerLeds">Allumer leds</button>
      </div>
    </div>
    <div>
      <button v-on:click="stopInteractions()" class="btn btn-primary">StopInteractions</button>
    </div>
    <br>
    <div class="flex">
      <p>{{ chapters }}</p>
      <input type="number" v-model="chapterIndex">
      <button class="btn btn-primary" @click="goToChapter()">GoToChapter</button>
      <button class="btn btn-primary" @click="startChapter()">StartChapter</button>
    </div>

    <div>
      <div class="flex" style="margin-bottom:0px">
        <input type="range" min="0" max="2.1" step="0.01" v-model="sliderValue" style="width:90%">
        <p>{{sliderValue}}</p>
      </div>
      <button class="btn btn-primary" @click="sendRoverPosition(sliderValue)">send rover position</button>
    </div>
    <br>
    <div class="flex">
      <button class="btn btn-primary" @click="reconnect_rover()">reconnect rover régie</button>
      <button class="btn btn-primary" @click="return_rover()">rover mauvais sens</button>
      <button class="btn btn-primary" @click="rover_go()">rover go</button>
      <button class="btn btn-primary" @click="rover_stop()">rover stop</button>
      <button class="btn btn-primary" @click="rover_home()">rover home</button>
      <button class="btn btn-primary" @click="rover_get_position()">rover get position</button>
      <button class="btn btn-primary" @click="rover_uturn()">rover uturn</button>
    </div>
    <br>
    <div>
      <button class="btn btn-primary" @click="reset()">reset</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      socket:null,
      checkboxes: {
        turnSphero: true,
        tapSphero: true,
        micro: true,
        button1: true,
        button2: true,
        rotocoder: true
      },
      connectionJson: {
        name: 'connection',
        value: 'regie'
      },
      sliderValue: 0,
      chapterIndex: 0,
      chapters : "",
      chapterPassed: 0,
      currentChapter: 1,
      interact: "",
      backgroundSound: "/all_sounds/backgroundMusic/1.mp3",
      checkboxesState: false
    };
  },
  async mounted() {
    // Connectez-vous au WebSocket ici
    this.socket = new WebSocket('ws://localhost:3001');
    this.reconnect_rover()
    
    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket ouvert');
      this.socket.send(JSON.stringify(this.connectionJson))
    });

    this.socket.addEventListener('message', (event) => {
      console.log('Message reçu:', event.data);
      const data = this.stringToJson(event.data)
      this.handleInfo(data)
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket fermé');
    });

    this.socket.addEventListener('error', (event) => {
      console.error('Erreur WebSocket:', event);
    });

    console.log("hey")
  },
  methods: {
    sendTabletteMusicaleMessage(id) {
      // Envoyez l'ID du bouton au serveur WebSocket
      this.socket.send(JSON.stringify({'name': 'rpi', 'idInput': id, "value": "true" }));
      if (this.interact === "audio") {
        let soundName = "p"
        if ([2, 6, 8, 13, 16, 19, 21, 24].includes(this.currentChapter)) {
          soundName = "e"
        }else if ([4, 10, 12, 15, 18, 20, 23, 26].includes(this.currentChapter)) {
          soundName = "t"
        }
        let audio = new Audio(`/all_sounds/${soundName}-sound/${soundName}-${id}.mp3`)
        audio.play()
      }
    },
    generateJson() {
      this.allumerLeds()
      const jsonData2 = {
        name: "interact",
        value: this.selectedInteractionType
      };
      this.socket.send(JSON.stringify(jsonData2));
      this.rover_stop()
      var audioT = document.getElementById("backgroundAudio")
      audioT.volume = 0.10
      this.interact = this.selectedInteractionType
      let audio = new Audio(`/all_sounds/backgroundMusic/Signal.mp3`)
      audio.play()
    },
    allumerLeds(){
      const jsonData = {
        name: "interact",
        value: JSON.parse(JSON.stringify(this.checkboxes))
      };
      this.socket.send(JSON.stringify(jsonData));
    },
    stopInteractions() {
      var audio = document.getElementById("backgroundAudio")
      audio.volume = 1
      const jsonData = {
        name: "interact",
        value: "false"
      };
      this.rover_go()
      this.socket.send(JSON.stringify(jsonData));
    },
    goToChapter() {
      let audioT = new Audio(`/all_sounds/backgroundMusic/Transition.mp3`)
      audioT.play()
      console.log(this.chapterIndex)
      console.log("in go to chapter")
      const jsonData = {
        name: "chapter",
        value: this.chapterIndex
      };
      this.socket.send(JSON.stringify(jsonData));
      this.currentChapter = this.chapterIndex
      var audio = document.getElementById("backgroundAudio")
      audio.pause()
      console.log(this.currentChapter)
      this.backgroundSound = `/all_sounds/backgroundMusic/${this.currentChapter}.mp3`
    },
    startChapter() {
      const jsonData = {
        name: "story",
        value: this.chapterIndex
      };
      this.socket.send(JSON.stringify(jsonData));
      var audio = document.getElementById("backgroundAudio")
      console.log(this.backgroundSound)
      audio.setAttribute("src", this.backgroundSound)
      audio.play()
    },
    sendRoverPosition(position) {
      const jsonData = {
        name: "rover",
        value: position
      };
      this.socket.send(JSON.stringify(jsonData));
    },
    reset(){
      const jsonData = {
        name: "startStory",
        value: "true"
      };
      this.socket.send(JSON.stringify(jsonData));
    },
    return_rover(){
      this.jsonDataRoverReturn = {
          name:"action",
          action: "return",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverReturn));
    },
    reconnect_rover(){
      this.socketRover = new WebSocket('ws://192.168.43.205:8081');

      this.socketRover.addEventListener('open', (event) => {
        console.log('WebSocket Rover ouvert');
        // this.socketRover.send(JSON.stringify(this.connectionJson))
      });

      this.socketRover.addEventListener('message', (event) => {
        console.log('Message reçu:', event.data);
        const data = this.stringToJson(event.data)
        if(data.position != null){
          this.sliderValue = data.position
          console.log(data)
          this.sendRoverPosition(data.position)
        }
        this.handleInfo(data)
      });

      this.socketRover.addEventListener('close', (event) => {
        console.log('WebSocket Rover fermé');
      });

      this.socketRover.addEventListener('error', (event) => {
        console.error('Erreur WebSocket Rover:', event);
      });
    },
    rover_go(){
      this.jsonDataRoverGo = {
          name:"action",
          action: "go",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverGo));
    },
    rover_stop(){
      this.jsonDataRoverStop = {
          name:"action",
          action: "stop",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverStop));
    },
    rover_home(){
      this.jsonDataRoverHome = {
          name:"action",
          action: "home",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverHome));
    },
    rover_get_position(){
      this.jsonDataRoverGetPosition = {
          name:"action",
          action: "getPosition",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverGetPosition));
    },
    rover_uturn(){
      this.jsonDataRoverUturn = {
          name:"action",
          action: "uturn",
        };
        this.socketRover.send(JSON.stringify(this.jsonDataRoverUturn));
    },
    bruit_porte(){
      if (this.currentChapter === 1) {
        let audioP = new Audio(`/all_sounds/backgroundMusic/start-chapter-end.wav`)
        audioP.play()
      }
    },
    toggle_checkboxes(){
      this.checkboxesState = !this.checkboxesState
      for (const [key, value] of Object.entries(this.checkboxes)) {
        this.checkboxes[key] = this.checkboxesState
      }
    },



    handleInfo(data){
      if(data.name == "chapters"){
        this.chapters = data.value
      }
    },
    stringToJson(string) {
      try {
        var jsonObj = JSON.parse(string);
        return jsonObj
      } catch (error) {
        console.error('Erreur lors de la conversion en JSON :', error.message);
        return error
      }
    }

  }
};
</script>

<style scoped>
.tablette_musicale {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 15px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #0056b3;
}

.btn:active {
  background-color: #003d82;
}

.flex > .btn {
  flex-basis: calc(50% - 10px);
}

.flex div {
  display: flex;
  align-items: center;
}

input[type="checkbox"] {
  margin-right: 10px;
}

label {
  margin: 0;
}

button {
  width: 100%;
}

@media (max-width: 600px) {
  .flex > .btn {
    flex-basis: 100%;
  }
}
</style>

