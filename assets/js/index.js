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

var clientIP;
var player = {};

const ipRegex = /\./g;
const roomName = "tinytiger";

window.onload = init;

function init() {

    $('#send').on('click', event => {
        event.preventDefault();
        send();
    });

    getMyIP().then(result => {

            clientIP = result;
            // player.clientIP = result;

            console.log('client ip: ', clientIP);

            // var 
            player = {
                name: "Michael",
                ip: clientIP,
                Choice: null,
            }

            clearAllRooms(); //todo: remove before prod
            clearChat(); //todo: remove before prod

            addPlayerToRoom(player, roomName);
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
        .then(_ => connectionsRef.on("value", snapshot => $("#watchers").text(snapshot.numChildren())))
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

const speak = async (message) => {
    if (!message) return;

    console.log('message: ', message);

    chatRef.child('posts').push({
        playerIP: clientIP,
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

    let room = roomsRef.child(roomName);
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
    var room = roomsRef.child(roomName);
    let keyHappyIP = clientIP.replace(ipRegex, '_');

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
const random = (min, max, inclusive) => Promise.resolve(Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min);