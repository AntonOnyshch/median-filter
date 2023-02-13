// Sort array of pixels on ascending way
function sortArray(a: number, b: number) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
      return 1;
    }

    return 0;
}

/**
 * Primitive median algorithm
 * @param array array of pixels by value from 0 to 255
 * @param width width of the image
 * @param height height of the image
 * @returns new array
 */
export function medianFilter(array: Uint8Array, width: number, height: number): Uint8Array {
    const newArray = new Uint8Array(array.length);
    const lengthOfFrame = width * height;
    const frames = array.length / lengthOfFrame;

    // Your array of pixels might be one frame or miltiframe but amount frames must always be integer
    if(!Number.isInteger(frames)) {
        throw new Error('Amount of frames must be integer value. Probably you have wrong width or height values or array length');
    }

    // Get nearby pixels around of central one
    const getNearbyPixels = function(index: number, width: number) {
        // For example
        // 73 is central and defined by index argument
        //==============
        // 100 230 170
        // 80  73  69
        // 63  66  90
        //==============
        return [
            array[(index - width) - 1], array[index - width], array[(index - width) + 1],

            array[index  - 1],          array[index],         array[index + 1],

            array[(index + width) + 1], array[index + width], array[(index + width) - 1],
        ]
    }
    
    let frame = 0;
    let nearbyPixels: number[] = [];
    let sorted: number[] = [];
    let pixelIndex: number;

    // Since we use 3x3 mask we must start/end by pixel 73 for example to obtain nerby pixels later
    //==============
    // 100 230 170
    // 80  73  69
    // 63  66  90
    //==============
    const borderWidth = width - 1;
    const borderHeight = height - 1;
    for (let i = 0; i < frames; i++) {

        frame = i * lengthOfFrame;

        // Start with index 1 to be able get leftist pixels
        for (let j = 1; j < borderHeight; j++) {
            
            for (let k = 1; k < borderWidth; k++) {
                pixelIndex = frame + ((j * width) + k);
                nearbyPixels = getNearbyPixels(pixelIndex, width);
                sorted = nearbyPixels.sort(sortArray);

                // Median(middle) value will always have index 4 because we constantly have 9 length array 
                newArray[pixelIndex] = sorted[4];
            }
            
        }
    }

    return newArray;

}

/**
 * Adaptive median algorithm with variable mask size.
 * Please checkout {@link https://www.irjet.net/archives/V6/i10/IRJET-V6I10148.pdf}
 * @param array array of pixels by value from 0 to 255
 * @param width width of the image
 * @param height height of the image
 * @param maxFilterSize maximum allowed filter size
 * @returns new array
 */
export function adaptiveMedianFilter(array: Uint8Array, width: number, height: number, maxFilterSize: number = 5): Uint8Array {

    const lengthOfFrame = width * height;
    const frames = array.length / lengthOfFrame;

    // Your array of pixels might be one frame or miltiframe but amount frames must always be integer
    if(!Number.isInteger(frames)) {
        throw new Error('Amount of frames must be integer value. Probably you have wrong either width/height values or array length');
    }

    // Get nearby pixels around of central one relying on filter size
    const getNearbyPixels = function(index: number, width: number, filterSize: number) {
        // Consider an example below
        // 73 is central and defined by index argument
        //==============
        // 100 230 170
        // 80  73  69
        // 63  66  90
        //==============
        const neighborhood = new Array<number>(filterSize * filterSize);
        let row = (index - width) - 1; // start with upper left corner. 100 in our example
        for (let i = 0; i < filterSize; i++) {

            // obtain 100 230 170 through first iteration
            for (let j = 0; j < filterSize; j++) {
                neighborhood[i * filterSize + j] = array[row + j]
            }

            // Go to the next row
            row += width;
        }
        return neighborhood;
    }

    let frame = 0;
    let nearbyPixels: number[] = [];
    let sorted: number[] = [];
    let pixelIndex: number;
    let pixel: number;
    // Minimum, maximum and median gray levels
    let zMin: number, zMax: number, zMed: number;

    const computation = function(filterSize: number, maxFilterSize: number, pixelIndex: number) {

        nearbyPixels = getNearbyPixels(pixelIndex, width, filterSize);

        sorted = nearbyPixels.sort(sortArray);

        zMin = sorted[0];
        zMax = sorted[sorted.length - 1];
        // Since our mask size may be 3 or 5 we dont know the middle array value exactly
        zMed = sorted[Math.floor(sorted.length / 2)];

        pixel = array[pixelIndex];
        if((pixel - zMin) > 0 && (pixel - zMax) < 0) {
            // Nothing to change. May be just return operation
            // return;
            array[pixelIndex] = pixel;
        } else {
            // This equation would be false in this example
            // 218 218 218
            // 218 218 218
            // 219 220 220
            // It means that we should increase our filter mask size
            if((zMed-zMin) > 0 && (zMed - zMax) < 0) {
                // Apply median value
                array[pixelIndex] = zMed;
            } else {
                if(filterSize < maxFilterSize) {
                    // Filter size may be 3,5,7...
                    filterSize += 2;
                    computation(filterSize, maxFilterSize, pixelIndex);
                } else {
                    // Apply median value
                    array[pixelIndex] = zMed;
                }
            }
        }
    }
    
    for (let i = 0; i < frames; i++) {

        frame = i * lengthOfFrame;

        for (let j = 1; j < height - 1; j++) {
            
            for (let k = 1; k < width - 1; k++) {
                pixelIndex = frame + ((j * width) + k);
                
                // Starts with 3x3 mask size
                computation(3, maxFilterSize, pixelIndex);
            }

        }
    }

    return array;
}