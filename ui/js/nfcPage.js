class NfcDemoScreen {
    
    constructor(parentApp, swimUrl) {
        this.parentDiv = parentApp;
        this.swimUrl = swimUrl;
        this.links = [];
        this.history = [];
    }

    start() {

        this.links['code'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("code")
            .didSet((newValue, oldValue) => {
                console.info('code', newValue);
                document.getElementById("nfcCode").innerHTML = newValue.stringValue();
            });        

        this.links['rawTagData'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("rawTagData")
            .didSet((newValue, oldValue) => {
                console.info('rawTagData', newValue.toAny());
                const tagInfo = newValue.get("info");
                document.getElementById("rawData").innerText = newValue;
                document.getElementById("nfcType").innerText = tagInfo.get("type").stringValue("");
                document.getElementById("nfcReadStatus").innerText = tagInfo.get("read_status").stringValue("0");
            });        

        this.links['payload'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("payload")
            .didSet((newValue, oldValue) => {
                console.info('payload', newValue);
                document.getElementById("nfcPayload").innerHTML = newValue.stringValue("No Tag");
            });        

        this.links['history'] = swim.downlinkMap()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("history")
            .didUpdate((key, newValue, oldValue) => {
                // console.info('history', key, newValue);
                this.history[key.stringValue()] = newValue;
                this.renderHistory();
            })
            .didRemove((key, oldValue) => {
                delete this.history[key];
                this.renderHistory();
            });        


        for(let key in this.links) {
            this.links[key].open();
        }
    

    }

    stop() {
        for(let key in this.links) {
            this.links[key].close();
        }
    }

    renderHistory() {
        const historyDiv = document.getElementById("tagHistory");
        historyDiv.innerHTML = "";

        for(const historyItem in this.history) {
            const historyData = this.history[historyItem];
            const rowDiv = document.createElement("div");
            rowDiv.innerHTML = historyItem + " " + historyData.get("decodedPayload").stringValue("No Tag");
            historyDiv.appendChild(rowDiv);
            // console.info(historyData.get("decodedPayload").stringValue("No Tag"));

        }
    }
}
