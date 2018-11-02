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

window.onload = init;

function init() {

    let roomName = "tinytiger";

    $('<button>')
        .text('leave server')
        .appendTo($('#score'))
        .on('click', leaveRoom)

    // $('#player-hand').append($("<i class='fa fa-eye'></i>")).button();

    getMyIPAsync().then(result => {

            clientIP = result;
            console.log('client ip: ', clientIP);

            var player = {
                name: "Michael",
                ip: clientIP,
                choice: null,
            }

            clearAllRooms(); //todo: remove before prod

            addPlayerToRoom(player, roomName);
            addCPUToRoom(roomName);
            render();

        }).then(() => {
            // track connected user:
            clients = database.ref(".info/connected")
                .on("value", snapshot => {

                    if (snapshot.val() && clientIP) {

                        //Adding the user's IP address to prevent multiple tabs.
                        console.log('uip: ', clientIP);
                        var connection = connectionsRef.push({
                            uip: clientIP
                        });

                        connection.onDisconnect().remove(
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

const render = async () => {
    // Show:
    //   who is in the room.
    $('#who-is-here').append(`<li><p>Your IP: ${clientIP}</p></li>`);

    // user choice / opponent choice.

}

const addCPUToRoom = (roomName) => {
    var cpuRef = firebase.database().ref('rooms/' + roomName).push({
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

// const getMyIP = () => new Promise((resolve, reject) => {
//     $.ajax({
//         url: 'https://ipapi.co/json',
//         method: "GET"
//     }).then(data => {
//         console.log('data: ', data);
//         resolve(data.ip);
//     })
// })

var wait = ms => new Promise((r, j) => {
    setTimeout(r, ms)
})

const random = (min, max, inclusive) =>
    Promise.resolve(Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min);