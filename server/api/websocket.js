// websocket-server.js
const WebSocket = require('ws');

// Création d'un serveur WebSocket sur le port 3000
const wss = new WebSocket.Server({ port: 3001 });

var clientsT = []

// Écoute des connexions WebSocket
wss.on('connection', (ws) => {

  // Écoute des messages du client WebSocket
  ws.on('message', (message) => {
    console.log(`Message reçu: ${message}`);
    const data = stringToJson(message)
    if (data.name && data.name === 'connection') {
      clientsT.push(
        {
          name: data.value,
          ws: ws
        }
      )
      if (data.value === 'sphero') {
        broadcast(message)
      }
    } else if (typeof data === 'object') {
      // Diffuser le message à tous les clients connectés
      broadcast(message);
    }
    
    
  });

  // Écoute des fermetures de connexion
  ws.on('close', () => {
    console.log('Connexion WebSocket fermée')
    
    clientsT = clientsT.filter((obj) => {
      if (obj.ws === ws) {
        console.log(obj.name)
      }
      return obj.ws != ws
    })
  });
});

// Fonction pour diffuser un message à tous les clients connectés
function broadcast(message) {
  clientsT.forEach((client) => {
    // Vérifier si le client est toujours connecté avant d'envoyer le message
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  })
}

function stringToJson(string) {
  try {
    var jsonObj = JSON.parse(string);
    return jsonObj
  } catch (error) {
    console.error('Erreur lors de la conversion en JSON :', error.message);
    return error
  }
}

console.log('Serveur WebSocket en écoute sur le port 3001');
