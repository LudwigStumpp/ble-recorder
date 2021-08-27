let storage = null;

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
        recordingTime: 5,
        preparationTime: 3,
        timer: 0,
    },
    created() {
        this.myBLE = new p5ble();
    },
    computed: {
        names: function () {
            return this.messageFormat.split(this.delimiter);
        },
        recordingStartsIn: function () {
            return Math.max(0, this.timer - parseInt(this.recordingTime));
        },
        recordingDuration: function () {
            return Math.max(0, parseInt(this.recordingTime) - this.timer);
        },
        recordingTimeLeft: function () {
            return Math.min(parseInt(this.recordingTime), this.timer);
        }
    },
    mounted: function () {
        window.setInterval(() => {
            if (this.isRecording) {
                this.timer -= 1;
                if (this.timer == 0) {
                    this.isRecording = false;
                    this.downloadData();
                }
            }
        }, 1000);
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
            this.log = data;
            values = data.split(this.delimiter);
            values.forEach((value, index) => {
                value_name = this.names[index];
                Vue.set(this.parsed, value_name, value);
            })
            if (this.isRecording && this.recordingStartsIn == 0) {
                values = data.split(this.delimiter);
                storage[0].push(Date.now());
                values.forEach((value, index) => {
                    storage[index + 1].push(value);
                });
            }
        },
        startRecording: function () {
            this.timer = parseInt(this.preparationTime) + parseInt(this.recordingTime);
            this.isRecording = true;
            setTimeout(() => {
                element = document.getElementById("last-element");
                element.scrollIntoView(true);
            }, 100);

            storage = new Array(1 + this.names.length);
            for (let i = 0; i < storage.length; i++) {
                storage[i] = new Array();
            }
        },
        stopRecording: function () {
            this.isRecording = false;
        },
        downloadData: function () {
            // console.log(storage);
            // storage is [feature][data_point]

            let rows = new Array(storage[0].length + 1);
            rows[0] = ['ts'].concat(this.names);

            for (let row_index = 1; row_index < rows.length; row_index++) {
                rows[row_index] = new Array(this.names.length + 1);
                for (let column_index = 0; column_index < storage.length; column_index++) {
                    rows[row_index][column_index] = storage[column_index][row_index - 1];
                }
            }

            const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            console.log(encodedUri);
            window.open(encodedUri);
        }
    }
})