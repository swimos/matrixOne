class Main {
    constructor() {
        this.deviceInfoApp = null;
        this.swimUrl = `ws://${document.location.hostname}:${document.location.port}`;

        this.detailsScreen = null;
    }

    start() {
        this.deviceInfoApp = new swim.HtmlAppView(document.getElementById("chartsMain"));
        this.showDeviceDetails();
    }

    didDisconnect(downlink) {
        console.info(`[Main] downlink didDisconnect`, downlink.hostUri().toString(), downlink.nodeUri().toString());
    }

    showDeviceDetails() {

        this.detailsScreen = new DeviceDetailsScreen(this.deviceInfoApp, this.swimUrl);
        this.detailsScreen.start();

    }

}
const main = new Main();
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {

        main.start()
    }
}
