const app = new Vue({
    el: '#app',
    data: {
        serviceUUID: '',
        messageFormat: 'val1;val2;val3',
        delimiter: ';',
        isConnected: false,
        isRecording: false,
        myCharacteristic: null,
        myBLE: null,
        log: '',
    },
    created() {
        this.myBLE = new p5ble();
    },
    computed: {
        names: function () {
            return this.messageFormat.split(this.delimiter);
        }
    },
    methods: {
        connectBLE: function () {
            this.myBLE.connect(this.serviceUUID, this.gotCharacteristics);
        },
        disconnectBLE: function () {
            this.myBLE.disconnect();
            this.isConnected = this.myBLE.isConnected();
        },
        gotCharacteristics: function (error, characteristics) {
            if (error) console.log('error: ', error);
            this.myCharacteristic = characteristics[0];

            this.isConnected = this.myBLE.isConnected();
            this.myBLE.onDisconnected(this.disconnectBLE);

            this.myBLE.startNotifications(this.myCharacteristic, this.handleNotifications, 'string');
        },
        handleNotifications: function (data) {
            if (!this.isRecording) {
                values = data.split(this.delimiter);
                output_str = '';
                values.forEach((value, index) => {
                    value_name = this.names[index];
                    output_str += value_name + ': ' + value + ' ';
                })
                this.log = output_str
            } else {

            }
        }
    }
})