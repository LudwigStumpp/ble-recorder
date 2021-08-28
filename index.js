let storage = null;

const app = new Vue({
    el: '#app',
    data: {
        serviceUUID: '',
        messageFormat: 'ts;accX;accY;accZ',
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
        addExtraTimestamp: false,
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
            });
            if (this.isRecording && this.recordingStartsIn == 0) {
                values = data.split(this.delimiter);
                let offset = 0;
                if (this.addExtraTimestamp) {
                    storage[0].push(Date.now());
                    offset = 1;
                }
                values.forEach((value, index) => {
                    storage[index + offset].push(value);
                });
            }
        },
        startRecording: function () {
            storageLength = this.addExtraTimestamp ? 1 + this.names.length : this.names.length;
            storage = new Array(storageLength);
            for (let i = 0; i < storage.length; i++) {
                storage[i] = new Array();
            }

            this.timer = parseInt(this.preparationTime) + parseInt(this.recordingTime);
            this.isRecording = true;
            setTimeout(() => {
                element = document.getElementById("last-element");
                element.scrollIntoView(true);
            }, 100);
        },
        stopRecording: function () {
            this.isRecording = false;
            this.storage = [];
        },
        downloadData: function () {
            // console.log(storage);
            // storage is [feature][data_point]
            // implementation from https://stackoverflow.com/a/14966131

            let rows = new Array(storage[0].length + 1);
            first_row = this.names;
            if (this.addExtraTimestamp) {
                first_row = ['unix_ts_from_web'].concat(first_row);
            }
            rows[0] = first_row;

            for (let row_index = 1; row_index < rows.length; row_index++) {
                let offset = this.addExtraTimestamp ? 1 : 0;
                rows[row_index] = new Array(this.names.length + offset);
                for (let column_index = 0; column_index < storage.length; column_index++) {
                    rows[row_index][column_index] = storage[column_index][row_index - 1];
                }
            }

            const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "recorded_data.csv");
            document.body.appendChild(link); // Required for FF

            link.click();
        }
    }
})