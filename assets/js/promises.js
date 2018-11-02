/**
 * One param Promises
 */
async function asyncFun() {
    var value = await Promise
        .resolve(1)
        .then(x => x * 3)
        .then(x => x + 5)
        .then(x => x / 2);
    return value;
}

asyncFun().then(x => console.log(`x: ${x}`)); // <- 'x: 4'

/**
 * Conventional Promise
 */
//synchronous child function:
function getMyIP() {
    //Returning the Promise so we can extract the result.
    return new Promise((resolve, reject) => {
        //Promise code goes here...
        //your async function call:
        $.getJSON('https://ipapi.co/json',
            //callback
            function (data) {
                console.log('result of asynchronous function: ', data);
                //the data you'll return to an await(er).
                resolve(data);
            });
    })
}

//Asynchronous wrapper function
async function getMyIPAsync()
// const getMyIPAsync = async function () //Or this...
{
    var result = await getMyIP() //Do not use 'then' here or you'll lose the results.
    console.log('result: ', result);
    console.log('ip address only: ', result.ip);
    return result.ip;
}

getMyIPAsync().then(x => console.log(`data: ${x}`));

/**
 * Awaiting an Asynchronous function and printing results
 */
async function dostuff() {
    var x = await getMyIPAsync();
    console.log('x = ', x);
}

dostuff();

/**Now I try making a snippet */

// //Inner Promisary function:
// function innerFunc() {
//     return new Promise((resolve, reject) => {
//         //Time-intensive work goes here, then...
//         resolve("my value");
//     })
// }

// //Async function:
// const funcAsync = async function () {
//     var result = await innerFunc();
//     console.log('inner result: ', result);
//     return result;
// }

// //Promisified Call
// funcAsync().then(result => console.log('result = ', result));


//Inner Promisary function:
function inner() {
    return new Promise((resolve, reject) => {
        //todo: Time-intensive work goes here, then...
        var result = true;

        resolve(result);
    })
}

//Async function:
const MyFunstuffAsync = async function () {
    var result = await inner();
    console.log('inner result: ', result);
    return result;
}
//Promisified Call
MyFunstuffAsync().then(result => console.log('result = ', result));