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

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var clientConnectionRef = database.ref(".info/connected");

var clientIP, clients, roomsRef, clientRef;
var player = {};

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

        }).then(() => {
            // track connected user:
            clients = database.ref(".info/connected")
                .on("value", snapshot => {

                    if (snapshot.val() && clientIP) {
                        //Adding the user's IP address to prevent multiple tabs.
                        console.log('uip: ', clientIP);

                        // var connection = connectionsRef.push({
                        //     uip: clientIP
                        // });                

                        let keyHappyIP = clientIP.replace(/\./g, '_');
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
        .then(() => connectionsRef.on("value", snapshot => $("#watchers").text(snapshot.numChildren())))
        .then(() => {
            // On rooms updated:
            roomsRef = database.ref("rooms").on("value", snapshot => console.log('rooms snapshot() ', snapshot.val()))
        }).then(() => {
            // clientRef = database.ref(`${clientIP}`);            
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
    let room = database.ref('rooms').child(roomName);
    let c = clientIP.replace(/\./g, '_');
    console.log('child: ', c);
    let p = room.child(c);
    console.log('p: ', p);
    p.update(player);
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