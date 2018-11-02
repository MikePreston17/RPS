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
var dbRef = database.ref();
var connectionsRef = database.ref("/connections");
var clientIP;


window.onload = init;

function init() {

    let roomName = "tinytiger";

    getMyIPAsync().then(result => {
        clientIP = result;
        console.log('client ip: ', clientIP);
        var player = {
            name: "Michael",
            ip: clientIP,
        }

        clearAllRooms();

        addPlayerToRoom(player, roomName);
        addCPUToRoom(roomName);
        render();
    })

}

//test
// connectionsRef.push(clientIP);

const render = () => {
    // Show:
    //   who is in the room.
    $('#who-is-here')
        .append(`<li><p>Your IP: ${clientIP}</p></li>`);

    //   whose turn it is.
    database.ref("turnPlayer").on("value", snap => {
        console.log('turn player: ', snap);
    });

    //   user choice / opponent choice.
    
}


var clients = database.ref(".info/connected")
    .on("value", function (snap) {
        if (snap.val() && clientIP) {
            // Add user to the connections list.
            //TODO: add the user's IP address to prevent multiple tabs.
            // console.log('uip: ', clientIP);
            var con = connectionsRef.push({
                uip: clientIP //todo: figure out why this sometimes gets undefined / ensure the awaited clientIP finished before this listener even initializes.
            });
            con.onDisconnect().remove();
        }
    });

//create the rooms ref and persist it, outright, with code or manually...then push items to it.
var roomsRef = database.ref("rooms").on("value", function (snapshot) {
    console.log('snapshot() ', snapshot);
})

const addCPUToRoom = (roomName) => {
    var cpuRef = firebase.database().ref('rooms/' + roomName).push({
        id: '11.011.100.101',
        name: "CPU",
    });
    console.log('cpu ref: ', cpuRef);
}

const addPlayerToRoom = (user, roomName) => {
    // console.log('ADDING USER TO ROOM');
    // console.log('user: ', user);
    firebase.database().ref('rooms/' + roomName).push(user);
}

const clearAllRooms = () => firebase.database().ref('rooms').remove();

const getMyIPAsync = async () => await getMyIP();
const getMyIP = () => new Promise((resolve, reject) => $.getJSON('https://ipapi.co/json', data => resolve(data.ip)))
var wait = ms => new Promise((r, j) => {
    setTimeout(r, ms)
})