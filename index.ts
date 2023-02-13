import {medianFilter, adaptiveMedianFilter} from './filters.js';

// Size of input image
let width: number;
let height: number;

let originalCvs: HTMLCanvasElement;
let medianCvs: HTMLCanvasElement;
let adaptiveMedianCvs: HTMLCanvasElement;

let originalCtx: CanvasRenderingContext2D;
let medianCtx: CanvasRenderingContext2D; 
let adaptiveMedianCtx: CanvasRenderingContext2D;

window.addEventListener('DOMContentLoaded', (event) => {
    const image = document.getElementById("source") as HTMLImageElement;
      
    width = image.width;
    height = image.height;

    image.src = '1.jpg';

    image.addEventListener("load", (e) => {

        originalCvs = document.getElementById("originalCvs") as HTMLCanvasElement;
        originalCvs.setAttribute('width', image.width.toString());
        originalCvs.setAttribute('height', image.height.toString());
        originalCtx = originalCvs.getContext("2d") as CanvasRenderingContext2D;

        originalCtx.drawImage(image, 0, 0);
   
        medianCvs = document.getElementById("medianCvs") as HTMLCanvasElement;
        medianCvs.setAttribute('width', image.width.toString());
        medianCvs.setAttribute('height', image.height.toString());
        medianCtx = medianCvs.getContext("2d") as CanvasRenderingContext2D;
        
        adaptiveMedianCvs = document.getElementById("adaptiveMedianCvs") as HTMLCanvasElement;
        adaptiveMedianCvs.setAttribute('width', image.width.toString());
        adaptiveMedianCvs.setAttribute('height', image.height.toString());
        adaptiveMedianCtx = adaptiveMedianCvs.getContext("2d") as CanvasRenderingContext2D;
        
    });
});



function getGrayscaleArray() {
    const imageData = originalCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const grayScaleArray = new Uint8Array(data.byteLength / 4);

    // Took only "r" chanel
    for (let i = 0, j = 0; i < data.length; i+=4, j++) {
        grayScaleArray[j] = data[i];
    }

    return grayScaleArray;
}

function fillCanvasData(filteredArray: Uint8Array, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = new Uint32Array(imageData.data.buffer);

    // Fill all 4 chanles with only one operation on abgr way
    for (let i = 0; i < filteredArray.length; i++) {
        data[i] = (255 << 24) + (filteredArray[i] << 16) + (filteredArray[i] << 8) + filteredArray[i];
    }

    ctx.putImageData(imageData, 0, 0);
}

(document.getElementById('filterBtn') as HTMLButtonElement).onclick = e => {
    // Canvas have rgba chanels but i need only one since my image don't have colors
    const grayScaleArray = getGrayscaleArray();

    // Apply primitive median filter and fill canvas image data
    const medianFilteredArray = medianFilter(grayScaleArray, width, height);
    fillCanvasData(medianFilteredArray, medianCtx);

    // Apply adaptive median filter and fill canvas image data
    const adaptiveFilteredArray = adaptiveMedianFilter(grayScaleArray, width, height);
    fillCanvasData(adaptiveFilteredArray, adaptiveMedianCtx);

}