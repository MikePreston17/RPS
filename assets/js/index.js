/*	Author: Michael Preston
 *	Created Date: "11-01-2018"
 */

var config = {
    apiKey: "AIzaSyBwKvd8TvlyhUUS-yU9knzCrgRnZa16wQE",
    authDomain: "rps-multiplayer-hwk7.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-hwk7.firebaseio.com",
    projectId: "rps-multiplayer-hwk7",
    storageBucket: "",
    messagingSenderId: "901030525478"
};

firebase.initializeApp(config);


var db = firebase.database();

//References:
var clients = db.ref(".info/connected"),
    roomsRef = db.ref("rooms"),
    connectionsRef = db.ref("/connections"),
    clientConnectionRef = db.ref(".info/connected"),
    chatRef = db.ref("chat");

var player = {};
var room = {}

const ipRegex = /\./g;

var nouns = ["leopard", "otter", "puma", "tiger", "snake", "mongoose", "unicorn", "pirahna"]
var adjectives = ["sparkling", "orange", "unruly", "leaping", "pink", "mangy", "tiny"]

const range = (start, end) => [...Array(1 + end - start).keys()].map(v => start + v)
const random = items => items[Math.floor(Math.random() * items.length)];
const createName = _ => random(adjectives) + random(nouns);

room.name = createName() + random(range(1, 9));
// room.name = "tinytiger";

window.onload = init;

var opponentWins, playerWins;
var opponentChoice;

// 1. Finish the remove user from room.
// 2. Determine winner.
// 3. Random Usernames
// 4. prevent username collision
// 5. 

function init() {

    var clientIP;

    $('#send').on('click', event => {
        event.preventDefault();
        send();
    });

    getMyIP().then(result => {

            clientIP = result;

            console.log('client ip: ', clientIP);

            let playerName = createName();

            player = {
                name: playerName,
                ip: clientIP,
                Choice: null,
            }

            // clearAllRooms(); //todo: remove before prod
            // clearChat(); //todo: remove before prod

            addPlayerToRoom(player, room.name);
            // addCPUToRoom(roomName);

        }).then(_ => {
            // track connected user:
            clients.on("value", snapshot => {

                if (snapshot.val() && clientIP) {
                    //Adding the user's IP address to prevent multiple tabs.

                    let formattedIP = getFormattedIP(clientIP);

                    console.table([clientIP, formattedIP]);

                    connectionsRef
                        .child(formattedIP)
                        .set({
                            ip: clientIP,
                            name: player.name
                        });

                    connectionsRef.onDisconnect().remove(
                        error => {
                            if (error) console.log('could not disconnect: ', error);
                        })
                }
            });
        })
        .then(_ => chatRef.child('posts')
            .orderByKey()
            .on('child_added',
                (chatshot) => console.log(">>> ", chatshot.val().message)))
        .then(_ =>
            chatRef.on("value", snapshot => {
                console.log('chatshot:', snapshot.val());
            }))

        .then(_ => {
            connectionsRef.on("value", snapshot => $("#watchers").text(snapshot.numChildren()))
        })
        .then(_ => {
            let currentRoom = roomsRef.child(room.name)
            currentRoom.on('value', snapshot => room.playerCount = snapshot.numChildren())
            currentRoom.on('child_added', snapshot => {

                let ip = snapshot.val();
                console.log('player entered: ', ip);

                if (room.playerCount > 1 || ip !== player.ip) {


                }
            })

        })
        .then(_ => roomsRef.on("value", snapshot => console.log('rooms snapshot() ', snapshot.val())))
}

$(document).on('click', "button", function () {

    if (player.hasChosen) {
        // $('#player-choice').text(`You already chose ${player.Choice}!`); //Optional
        return;
    }

    var that = this;
    let alt = $(that).attr("alt");

    if (!alt) return;

    player.Choice = alt;

    $('#player-choice').text(`You chose ${player.Choice}`);
    player.hasChosen = true;
    console.log('player: ', player);

    updatePlayer(player);
})

function renderNameEntryForm() {
    //<!-- TODO: only enable this once IFF the user's IP cannot be found in the database -->
    let html =
        ` 
    <div>
        <form action="" id="name-form">
        <h2 id="name-entry-header"> Enter your name here: </h2>
            <label for=""></label>
            <input id="name-input" type="text">
        </form> 
    </div>
    `;

    let div = $('div').html(html);
    div.appendTo($('#scoreboard'));

}

const speak = async (message) => {
    if (!message) return;

    console.log('message: ', message);

    chatRef.child('posts').push({
        playerIP: player.ip,
        message,
    });

    renderMessage(message);
}

const renderMessage = (message) => {

    let div = $('<div>');
    let label = $('<label>').text(`${player.name}:`).appendTo(div); //TODO: fetch the accompanying playerName from Firebase.

    label.css("font-weight", "bold");

    $('<p>').text(message).appendTo(div);
    div.appendTo($('#chat-history'))
}

const updatePlayer = (player) => {
    if (!player.Choice) return;

    let room = roomsRef.child(room);
    let c = clientIP.replace(ipRegex, '_');
    console.log('child: ', c);
    let playerRef = room.child(c);
    console.log('player ref: ', playerRef);
    console.log(player);
    playerRef.update(player);
}

const leaveRoom = () => {
    firebase.database()
        .ref("connections/")
        .child(`${clientIP}`)
        .remove();
}

const addCPUToRoom = (roomName) => {

    var room = roomsRef.child(roomName);
    let ip = getFormattedIP('11.011.100.101');

    room.child(ip)
        .set({
            ip,
            name: "CPU"
        });
}

const addPlayerToRoom = (player, roomName) => {

    //todo: check number of players in room by how many children on the room's key.
    roomsRef.child(roomName)
    // if 0 or 1 already, add.
    // if 2, find new room.

    var room = roomsRef.child(roomName);
    let keyHappyIP = player.ip.replace(ipRegex, '_');

    room.child(keyHappyIP)
        .set(player);
}

const send = async () => {
    let box = $('#chatbox');
    speak(box.val());
    box.val('');
};

const clearAllRooms = async () => roomsRef.remove();
const clearChat = async () => chatRef.child('posts').remove();
const getMyIP = async () => new Promise(resolve => $.getJSON('https://ipapi.co/json', data => resolve(data.ip)))
var wait = ms => new Promise((r, j) => setTimeout(r, ms))
const getFormattedIP = ip => ip.replace(ipRegex, '_');

const randomInt = (min, max, inclusive) => Promise.resolve(Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min);