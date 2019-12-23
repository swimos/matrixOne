document.addEventListener('DOMContentLoaded', ()=> {
  const rangeSlider = document.querySelectorAll('.range-slider .group');

  const palletCanvas = document.getElementById("palletCanvas");
  const palletContext = palletCanvas.getContext('2d');

  const image = new Image();

  image.addEventListener('load', e => {
    palletContext.drawImage(image, 0, 0, 360, 360);
  });

  image.src = "imgs/color-wheel.png";

  palletCanvas.addEventListener("click",function(event){
    // Get the coordinates of the click
    // var eventLocation = getEventLocation(this,event);
    // // Get the data of the pixel according to the location generate by the getEventLocation function
    // var context = this.getContext('2d');
    var pixelData = palletContext.getImageData(event.offsetX, event.offsetY, 1, 1).data; 
    // console.info(palletContext.getImageData(event.layerX, event.layerY, 1, 1).data);
    // console.info(document.getElementsByTagName("input"))
    const inputFields = document.getElementsByTagName("input"); 
    inputFields[0].value = pixelData[0];
    inputFields[1].value = pixelData[0];
    update(0, pixelData[0]);

    inputFields[2].value = pixelData[1];
    inputFields[3].value = pixelData[1];
    update(1, pixelData[1]);

    inputFields[4].value = pixelData[2];
    inputFields[5].value = pixelData[2];
    update(2, pixelData[2]);

    inputFields[6].value = 0;
    inputFields[7].value = 0;
    update(3, 0);

  },false);

  // Slider interaction
  rangeSlider.forEach((elem, i)=> {
    const slider = elem.querySelector('.slider');
    const input = elem.querySelector('.value');

    const getSliderValue = ()=> {
      const value = slider.value;
      input.value = value;
      update(i, value);
    }

    // Drag event
    slider.addEventListener('mousedown', (evt)=> {
      slider.addEventListener("mousemove", getSliderValue);
    });

    slider.addEventListener('mouseup', (evt)=> {
      getSliderValue(); // set value on single click
      slider.removeEventListener("mousemove", getSliderValue);
    });

    // Input value event only number
    input.addEventListener('keyup', (evt)=> {
      const onlyNumber = input.value.trim().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const number = (onlyNumber.length)? +onlyNumber : 0;
      const value = (number <= 255)? number : 255;
      input.value = value;
      slider.value = value;
      update(i, value);
    });

  });


  // Swim Client settings
  // const host = 'ws://localhost:9001';
  const host = `ws://${document.location.hostname}:${document.location.port}`;
  const node = '/settings/color';
  const colorKey = ['R', 'G', 'B', 'W'];

  // Use swim command to set color value
  const update = (i, value)=> {
    swim.command( host, node, `addColor${colorKey[i]}`, value);
  }

  // Connect to swim downlink to get color on page load to initialize value
  const colorLink = swim.downlinkValue().hostUri(host).nodeUri(node).laneUri('rgbw')
    .didSet((value)=> {
      const color = value.toAny();

      // Set value to slider and input
      rangeSlider.forEach((elem, i)=> {
        elem.querySelector('.slider').value = color[colorKey[i].toLowerCase()];
        elem.querySelector('.value').value = color[colorKey[i].toLowerCase()];
      });

      // close swim link after init
      colorLink.close();
    }).open();
}, false);
