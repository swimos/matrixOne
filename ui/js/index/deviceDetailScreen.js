class DeviceDetailsScreen {

    constructor(parentApp, swimUrl) {
        this.parentApp = parentApp;
        this.swimUrl = swimUrl;
        this.links = [];
        this.screenElements = [];
        this.batteryServiceId = '';
    }

    start(deviceId) {
        this.deviceId = deviceId;
        this.buildScreen();
    }

    stop() {
        for(let key in this.links) {
            this.links[key].close();
        }
        this.destroyScreen();
    }

    buildScreen() {

        let origin = new THREE.Vector3();
        const container = this.parentApp.append("div")
            .position('relative')
            .width(800)
            .height(600);

        this.screenElements['screenContainer'] = container;

        const webGlContainer = container.append("div")
            .width('100%')
            .height('100%')
            .position('absolute');

        const canvas = container.append("canvas");

        const chart = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .bottomGesture(false)
            .leftDomainPadding([0.1, 0.1])
            .domainColor("#4a4a4a")
            .tickMarkColor("#4a4a4a")
            .font("12px sans-serif")
            .textColor("#4a4a4a");
        canvas.append(chart);
        chart.leftAxis().insertTick({
            value: 0.5,
            tickLabel: "0.5",
            gridLineColor: '#989898',
            gridLineWidth: 1,
        });
        const plotX = new swim.LineGraphView()
            .stroke("#FF0000")
            .strokeWidth(1);

        chart.addPlot(plotX);

        const plotY = new swim.LineGraphView()
            .stroke("#00FF00")
            .strokeWidth(1);

        const webGlWidth = 800;
        const webGlHeight = 600;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, webGlWidth / webGlHeight, 0.1, 50);
        camera.position.set( 0, 0, 35 );

        var lights = [];
        lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

        lights[ 0 ].position.set( 0, 200, 0 );
        lights[ 1 ].position.set( 100, 200, 100 );
        lights[ 2 ].position.set( - 100, - 200, - 100 );

        scene.add( lights[ 0 ] );
        scene.add( lights[ 1 ] );
        scene.add( lights[ 2 ] );

        var group = new THREE.Group();

        var geometry = new THREE.DodecahedronBufferGeometry(10, 0);
        var lineMaterial = new THREE.LineBasicMaterial( { color: 0x46c7ff, transparent: false, opacity: 1 } );
        var meshMaterial = new THREE.MeshPhongMaterial( { color: 0x008ac5, emissive: 0x004868, side: THREE.DoubleSide, flatShading: true } );

        group.add( new THREE.LineSegments( geometry, lineMaterial ) );
        group.add( new THREE.Mesh( geometry, meshMaterial ) );

        var matStdObjects = new THREE.MeshStandardMaterial( { color: 0x00A000, roughness: 0, metalness: 0 } );
        var mshStdKnot = new THREE.Mesh( group, matStdObjects );
        mshStdKnot.position.set( 0, 0, 0 );
        mshStdKnot.castShadow = true;
        mshStdKnot.receiveShadow = true;

        scene.add( group );

        const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( webGlWidth, webGlHeight);
        renderer.setClearColor( 0x000000, 0 );
        camera.aspect = ( webGlWidth/webGlHeight );
        renderer.shadowMap.enabled = true;

        webGlContainer.node.appendChild(renderer.domElement);

        this.links['yawLink'] = swim.downlinkMap()
            .hostUri(this.swimUrl)
            .nodeUri(`/sensor/yaw`)
            .laneUri("history")
            .didUpdate((key, value) => {
                plotX.insertDatum({x: key.value, y: value, opacity: 1});
                group.rotation.y = value * Math.PI / 180;
                //group.rotation.y = value * -1;
            })
            .didRemove((key, value) => {
                plotX.removeDatum(key.value);
            })
            .open();

        setInterval(() => {
            renderer.render( scene, camera );
        }, 1);


    }

    destroyScreen() {
        this.screenElements['screenContainer'].remove();
    }

}
