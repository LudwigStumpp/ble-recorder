const serviceUuid = "4119d95e-ebbc-4df8-8e11-a41dcbf6675e";
const parts = "accX,accY,accZ";
const del = ","
const names = parts.split(del)

let isConnected = false;
let myCharacteristic;
let myBLE;
let div;

function setup() {
    myBLE = new p5ble();

    createCanvas(200, 200);
    textSize(20);
    textAlign(CENTER, CENTER);

    const connectButton = createButton('Connect')
    connectButton.mousePressed(connectToBle);

    const stopButton = createButton('Disconnect')
    stopButton.mousePressed(disconnectToBle);

    div = createDiv('').size(300, 100);
}

function connectToBle() {
    myBLE.connect(serviceUuid, gotCharacteristics);
}

function disconnectToBle() {
    myBLE.disconnect();
    isConnected = myBLE.isConnected();
}

function gotCharacteristics(error, characteristics) {
    if (error) console.log('error: ', error);
    myCharacteristic = characteristics[0];

    isConnected = myBLE.isConnected();
    myBLE.onDisconnected(disconnectToBle)

    myBLE.startNotifications(myCharacteristic, handleNotifications, 'string');
}

function handleNotifications(data) {
    values = data.split(del)
    output_str = ''

    values.forEach((value, index) => {
        value_name = names[index]
        output_str += value_name + ': ' + value + ' '
    })

    div.html(output_str);
}

function draw() {
    if (isConnected) {
        background(0, 255, 0);
        text('Connected!', 100, 100);
    } else {
        background(255, 0, 0);
        text('Disconnected :/', 100, 100);
    }
}