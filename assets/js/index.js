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
    clientConnectionRef = db.ref(".info/connected");

var clientIP;
var player = {};
const ipRegex = /\./g;

var chatRef;

window.onload = init;

const roomName = "tinytiger";

function init() {

    getMyIPAsync().then(result => {

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

            addPlayerToRoom(player, roomName);
            addCPUToRoom(roomName);

        }).then(_ => {
            // track connected user:
            clients
                .on("value", snapshot => {

                    if (snapshot.val() && clientIP) {
                        //Adding the user's IP address to prevent multiple tabs.
                        console.log('uip: ', clientIP);

                        // var connection = connectionsRef.push({
                        //     uip: clientIP
                        // });

                        let keyHappyIP = clientIP.replace(ipRegex, '_');
                        console.log('key: ', keyHappyIP);

                        connectionsRef
                            .child(keyHappyIP)
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
        .then(_ => connectionsRef.on("value", snapshot => $("#watchers").text(snapshot.numChildren())))
        .then(_ => roomsRef.on("value", snapshot => console.log('rooms snapshot() ', snapshot.val())))
        .then(_ => {

            chatRef = db.ref("chat");

            if (chatRef) return; //return if the chatroom already exists.

            chatRef.set({
                posts: 5,
            })

            chatRef.child('posts').push({
                playerIP: clientIP,
                message: "'sup?",
            })
        })
}

$(document).on('click', "button", function () {

    if (player.hasChosen) {
        // $('#player-choice').text(`You already chose ${player.Choice}!`); //Optional
        return;
    }

    var that = this;
    player.Choice = $(that).attr("alt");

    $('#player-choice').text(`You chose ${player.Choice}`);
    player.hasChosen = true;
    console.log('player: ', player);

    updatePlayer(player);
})


const updatePlayer = (player) => {
    let room = roomsRef.child(roomName);
    let c = clientIP.replace(ipRegex, '_');
    console.log('child: ', c);
    let playerRef = room.child(c);
    console.log('player ref: ', playerRef);
    playerRef.update(player);
}

const addCPUToRoom = (roomName) => {
    var cpuRef = firebase.database().ref('rooms/' + roomName)
        // .set(
        .push({
            id: '11.011.100.101',
            name: "CPU",
            choice: null,
        });
    console.log('cpu ref: ', cpuRef);
}

const leaveRoom = () => {
    firebase.database()
        .ref("connections/")
        .child(`${clientIP}`)
        .remove();
}

const addPlayerToRoom = (user, roomName) => firebase.database().ref('rooms/' + roomName).push(user);

const clearAllRooms = async () => firebase.database().ref('rooms').remove();

const getMyIPAsync = async () => await getMyIP();

const getMyIP = () => new Promise((resolve, reject) => $.getJSON('https://ipapi.co/json', data => resolve(data.ip)))

var wait = ms => new Promise((r, j) => {
    setTimeout(r, ms)
})

const random = (min, max, inclusive) =>
    Promise.resolve(Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min);