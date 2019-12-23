class PerfGauge {

    constructor(parentElementId, titleText, swimUrl, nodeUri, statLaneUri, historyLaneUri, bgColor = "#FF0000", fontColor) {
        this.parentElementId = parentElementId;
        this.titleText = titleText;
        this.swimUrl = swimUrl
        this.app = null;
        this.nodeUri = nodeUri;
        this.statLaneUri = statLaneUri;
        this.historyLaneUri = historyLaneUri;
        this.links = [];
        this.bgColor = bgColor;
        this.fontColor = fontColor;

        this.chart = null;
        this.plot = null;
        this.title = null;
        this.parentElement = new swim.HtmlAppView(document.querySelector(`#${this.parentElementId}`));
        this.mainElement = null;
        this.chartElement = null;
        this.chartCanvas = null;
        this.statsElement = null;
        this.titleElement = null;

        this.initialize();
    }

    initialize() {
        this.mainElement = swim.HtmlView.create('div')
            .className("chartWrap col col-12 col-md-6 col-lg-4 col-xl-3");

        this.boxElement = this.mainElement.append('div')
            .className('chartBox');

        this.titleElement = this.boxElement.append('h3')
            .text(`${this.titleText}`)
            .backgroundColor(this.bgColor)
            .color(this.fontColor);

        this.contentElement = this.boxElement.append('div')
            .className('content')

        this.chartElement = this.contentElement.append('div')
            .className('graphic');

        this.app = this.chartElement.append('div')
            .className('chart');

        this.statsElement = this.contentElement.append('div')
            .className('stat')
            .text('--');

        this.parentElement.append(this.mainElement);
    }

    start() {
        this.chartCanvas = this.app.append("canvas");

        this.chart = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .topGutter(0)
            .rightGutter(0)
            .bottomGutter(0)
            .leftGutter(0);
        this.chartCanvas.append(this.chart);

        this.chart.leftAxis().insertTick({
            value: 0.5,
            tickLabel: "0.5",
            gridLineColor: '#989898',
            gridLineWidth: 1,
        });

        this.plot = new swim.LineGraphView()
            .stroke(this.bgColor)
            .strokeWidth(0);

        this.chart.addPlot(this.plot);

        this.openLinks();
    }

    stop() {
        this.closeLinks()
        this.parentElement.removeChild(this.mainElement);
    }

    setMainColor(newColor) {
        // console.info('[perfGauge] new color', newColor)
        this.bgColor = newColor;
        this.statsElement.color(this.bgColor);
        this.titleElement.backgroundColor(this.bgColor);
        this.plot.stroke(this.bgColor);
    }

    openLinks() {
        this.links['historyLink'] = swim.downlinkMap()
            .hostUri(this.swimUrl)
            .nodeUri(this.nodeUri)
            .laneUri(this.historyLaneUri)
            .didUpdate((key, newValue) => {
                if (newValue) {
                    if (newValue && newValue.value) {
                        this.plot.insertDatum({
                            x: key.value,
                            y: newValue.value,
                            opacity: 1
                        });
                    }
                    if (newValue.get('rate').value) {
                        this.plot.insertDatum({
                            x: key.value,
                            y: newValue.get('rate').value,
                            opacity: 1
                        });

                    }

                }
            })
            .didRemove((key) => {
                this.plot.removeDatum(key.value);
            })
            .open();

        this.links['statsLink'] = swim.downlinkValue()
            .hostUri(this.swimUrl)
            .nodeUri(this.nodeUri)
            .laneUri(this.statLaneUri)
            .didSet((newValue) => {
                if (newValue) {
                    if (newValue && newValue.value) {
                        this.statsElement.text(`${newValue.value.toPrecision(2)}`);
                    }
                    if (newValue.get('rate').value) {
                        this.statsElement.text(`${newValue.get('rate').value}`);
                    }

                }
            })
            .open();
    }

    closeLinks() {
        for (let key in this.links) {
            this.links[key].close();
        }
    }

}
