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
        log: null,
        parsed: {},
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
            this.parsed = {};
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
                this.log = data;
                values = data.split(this.delimiter);
                values.forEach((value, index) => {
                    value_name = this.names[index];
                    Vue.set(this.parsed, value_name, value);
                })
            } else {

            }
        }
    }
})