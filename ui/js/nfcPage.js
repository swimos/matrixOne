class NfcDemoScreen {
    
    constructor(parentApp, swimUrl) {
        this.parentDiv = parentApp;
        this.swimUrl = swimUrl;
        this.links = [];
        
    }

    start() {
        this.buildScreen();

        this.links['code'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("code")
            .didSet((newValue, oldValue) => {
                console.info('code', newValue);
            });        

        this.links['pages'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("pages")
            .didSet((newValue, oldValue) => {
                console.info('pages', newValue.get("content"));
            });        

        this.links['rawTagData'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(`/nfc`)
            .laneUri("rawTagData")
            .didSet((newValue, oldValue) => {
                console.info('rawTagData', newValue);
            });        

        for(let key in this.links) {
            this.links[key].open();
        }
    

    }

    stop() {
        for(let key in this.links) {
            this.links[key].close();
        }
        this.destroyScreen();
    }

    buildScreen() {
        // todo
    }

    destroyScreen() {
        // todo
    }    
}
