
let httpPort = 80;
let streamerPort = 8888;
let WebSocket = require('ws');

let players = new Map(); // playerId <-> player, where player is either a web-browser or a native webrtc player

let clientConfig = {type: 'config', peerConnectionOptions: {}};
function socketAdapter(){
   ///ue4 -> this
    let streamerServer = new WebSocket.Server({port: streamerPort, backlog: 1});
    let streamer; // WebSocket connected to Streamer
    streamerServer.on('connection', function (ws, req) {
        console.log(`Streamer connected: ${req.connection.remoteAddress}`);

        ws.on('message', function onStreamerMessage(msg) {
            console.log(`<- Streamer: ${msg}`);

            try {
                msg = JSON.parse(msg);
            } catch (err) {
                console.error(`cannot parse Streamer message: ${msg}\nError: ${err}`);
                streamer.close(1008, 'Cannot parse');
                return;
            }

            if (msg.type === 'ping') {
                streamer.send(JSON.stringify({type: "pong", time: msg.time}));
                return;
            }

            let playerId = msg.playerId;
            delete msg.playerId; // no need to send it to the player
            let player = players.get(playerId);
            if (!player) {
                console.log(`dropped message ${msg.type} as the player ${playerId} is not found`);
                return;
            }

            if (msg.type === 'answer') {
                player.ws.send(JSON.stringify(msg));
            } else if (msg.type === 'iceCandidate') {
                player.ws.send(JSON.stringify(msg));
            } else if (msg.type === 'disconnectPlayer') {
                player.ws.close(1011 /* internal error */, msg.reason);
            } else {
                console.error(`unsupported Streamer message type: ${msg.type}`);
                streamer.close(1008, 'Unsupported message type');
            }
        });

        function onStreamerDisconnected() {
            disconnectAllPlayers();
        }

        ws.on('close', function (code, reason) {
            console.error(`streamer disconnected: ${code} - ${reason}`);
            onStreamerDisconnected();
        });

        ws.on('error', function (error) {
            console.error(`streamer connection error: ${error}`);
            ws.close(1006 /* abnormal closure */, error);
            onStreamerDisconnected();
        });

        streamer = ws;

        streamer.send(JSON.stringify(clientConfig));
    });
 //-------------this->----------------------------------
    let nextPlayerId = 100;
    let playerServer = new WebSocket.Server({port:httpPort});
    console.log(`WebSocket listening to Players connections on :${httpPort}`)
    playerServer.on('connection', function (ws, req) {
        // Reject connection if streamer is not connected
        if (!streamer || streamer.readyState !== 1 /* OPEN */) {
            ws.close(1013 /* Try again later */, 'Streamer is not connected');
            return;
        }

        let playerId = ++nextPlayerId;
        console.log(`player ${playerId} (${req.connection.remoteAddress}) connected`);
        players.set(playerId, {ws: ws, id: playerId});

        function sendPlayersCount() {
            let playerCountMsg = JSON.stringify({type: 'playerCount', count: players.size});
            for (let p of players.values()) {
                p.ws.send(playerCountMsg);
            }
        }

        ws.on('message', function (msg) {
            console.log(`<- player ${playerId}: ${msg}`);
            try {
                msg = JSON.parse(msg);
            } catch (err) {
                console.error(`Cannot parse player ${playerId} message: ${err}`);
                ws.close(1008, 'Cannot parse');
                return;
            }

            if (msg.type === 'offer') {
                console.log(`<- player ${playerId}: offer`);
                msg.playerId = playerId;
                streamer.send(JSON.stringify(msg));
            } else if (msg.type === 'iceCandidate') {
                console.log(`<- player ${playerId}: iceCandidate`);
                msg.playerId = playerId;
                streamer.send(JSON.stringify(msg));
            } else if (msg.type === 'stats') {
                console.log(`<- player ${playerId}: stats\n${msg.data}`);
            } else if (msg.type === 'kick') {
                let playersCopy = new Map(players);
                for (let p of playersCopy.values()) {
                    if (p.id !== playerId) {
                        console.log(`kicking player ${p.id}`)
                        p.ws.close(4000, 'kicked');
                    }
                }
            } else {
                console.error(`<- player ${playerId}: unsupported message type: ${msg.type}`);
                ws.close(1008, 'Unsupported message type');
                return;
            }
        });

        function onPlayerDisconnected() {
            players.delete(playerId);
            streamer.send(JSON.stringify({type: 'playerDisconnected', playerId: playerId}));
            sendPlayersCount();
        }

        ws.on('close', function (code, reason) {
            console.log(`player ${playerId} connection closed: ${code} - ${reason}`);
            onPlayerDisconnected();
        });

        ws.on('error', function (error) {
            console.error(`player ${playerId} connection error: ${error}`);
            ws.close(1006 /* abnormal closure */, error);
            onPlayerDisconnected();
        });

        ws.send(JSON.stringify(clientConfig));

        sendPlayersCount();
    });
}



function disconnectAllPlayers(code, reason) {
    let clone = new Map(players);
    for (let player of clone.values()) {
        player.ws.close(code, reason);
    }
}
export default socketAdapter;