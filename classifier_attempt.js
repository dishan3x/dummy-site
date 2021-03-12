//classifier.js
var model;
var predResult = document.getElementById("result");
async function initialize() {

    model = await tf.loadLayersModel('https://raw.githubusercontent.com/dishan3x/Kora_tensorflowjs/main/models/tensoflowJSmodel/model.json');
}


(function() {
  
    document.getElementById("result_values").style.display= "none";
  
 
 })();


 async function uploadImage(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload =  function(e) {
            //console.log(e.target.result);
            //result = resizeBase64Img(e.target.result.split(",")[1],512,512)
            //console.log(result);
            //$('#previewHolder').attr('src', e.target.result); 
            document.getElementById("previewHolder").setAttribute("src",e.target.result);
            //predict();
        }

        // Triggers the onload 
        reader.readAsDataURL(input.files[0]);
        // triger the predict function after the image loaded
        reader.onloadend = () => predict(); 
        /* console.log("await"); */
        //predict();
    } else {
        alert('select a file to see preview');
        //$('#previewHolder').attr('src', '');
        document.getElementById("previewHolder").setAttribute("src",'');
    }


}

/* function resizeBase64Img(base64, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var deferred = $.Deferred();
    $("<img/>").attr("src", "data:image/gif;base64," + base64).load(function() {
        context.scale(width/this.width,  height/this.height);
        context.drawImage(this, 0, 0); 
        deferred.resolve($("<img/>").attr("src", canvas.toDataURL()));               
    });
    return deferred.promise();    
} */

async function predict() {
   
    //document.getElementById("canvas").remove();
    removePreviousResult();
    //context.clearRect(0, 0, canvas.width, canvas.height);
    // action for the submit button
  
    const tensorImg = await tf.tidy(() => {
        let image_from_element = document.getElementById("previewHolder");
        let tensorImg =   tf.browser.fromPixels(image_from_element).toFloat().expandDims();
        return tensorImg;
        
    });

    prediction = await model.predict(tensorImg);
    tf.dispose(tensorImg);
    var results = await prediction.argMax(3).dataSync();
    tf.dispose(prediction);

    /* console.info('Check memory is empty:'); */
   /*  console.log(tf.memory()); */


    //console.log(results);
    //console.log(results.shape);

    //test_array = nj.arange(prediction.data).reshape(1,512,512,3);
    //test_array = nj.array(results);
    //let test_array = nj.arange(results).reshape(512,512);
    //console.log(test_array.shape);

    // create an offscreen canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
   
    // size the canvas to your desired image
    canvas.width = 512;
    canvas.height = 512;
   
    // get the imageData and pixel array from the canvas
    var imgData = ctx.getImageData(0, 0, 512, 512);
    var data = imgData.data;
  

    // manipulate some pixel elements
 /*    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255; // set every red pixel element to 255
        data[i + 3] = 255; // make this pixel opaque
    } */

    index = 0;
    counter = 0;
    for(let y=0; y < canvas.height; y++){
        for(let x=0; x < canvas.height; x++){
            let index = (x + y * canvas.width)*4;
        
            pixel_value = results[counter];
            // stubble 
            if (pixel_value == 0){
                data[index+0] = 255;
                data[index+1] = 255;
                data[index+2] = 0;
                data[index+3] = 255;

            }else if(pixel_value == 1){
                // soil brown
                data[index+0] = 165;
                data[index+1] = 42;
                data[index+2] = 42;
                data[index+3] = 255;

            }else {
                //live vegetation green
                data[index+0] = 0;
                data[index+1] = 255;
                data[index+2] = 0;
                data[index+3] = 255;

            }
            counter += 1; 
        }
    }

    // unique groups available in picture
    var unique_items = unique(results) 
  

    /* console.log("unit",unique_items); */


    var counts = {};
    for (var i = 0; i < results.length; i++) {
        counts[results[i]] = 1 + (counts[results[i]] || 0);
    }

    var sum_count = 0;
    var per_stubble = 0;
    var per_soil = 0;
    var per_canopy = 0;
   /*  console.log("counts array",counts); */

    // stubble 
    if(counts.hasOwnProperty(0)){
        sum_count = sum_count + counts[0]; 
        per_stubble =  counts[0]; 
       /*  console.log("1 is here"); */
    }

    // soil 
    if(counts.hasOwnProperty(1)){
        /* console.log("2 is here"); */
        per_soil = counts[1];
        sum_count = sum_count + counts[1]; 
    }

    // Canopy
    if(counts.hasOwnProperty(2)){
        /* console.log("3 is here"); */
        per_canopy = counts[2];
        sum_count = sum_count + counts[2]; 
    }

    /* console.log("per_stubble",per_canopy); */
    per_stubble = (per_stubble/sum_count)*100;
    per_canopy  = (per_canopy/sum_count)*100;
    per_soil = (per_soil/sum_count)*100;



    document.getElementById('stubble_label').textContent = per_stubble.toFixed(2);
    document.getElementById('soil_label').textContent = per_soil.toFixed(2);
    document.getElementById('canopy_label').textContent = per_canopy.toFixed(2);


    




  /*   for (int i : unique_items)
    {
          
    } */
   
    tf.dispose(results);
    // put the modified pixels back on the canvas
    ctx.putImageData(imgData, 0, 0);



    // create a new img object
    var image = new Image();
    
    image.id = "result_image";
    // Attached canvas information to image tag
    image.src = canvas.toDataURL();  

    // append the new img object to the page
    //document.body.appendChild(image);
    document.getElementById('result_div').append(image);


    // Try to get 
    var a = document.getElementById('downloadtagbtn');
    a.href = image;  

    // View the original image holder
    document.getElementById("previewHolder").style.display = "block";
    
    document.getElementById("result_values").style.display= "block";

    
 

}

function removePreviousResult(){
   
    var result_elm = document.getElementById("result_image");

    //If it isn't "undefined" and it isn't "null", then it exists.
    if(typeof(result_elm) != 'undefined' && result_elm != null){
        result_elm.remove();
       /*  console.log("result removed"); */
    } else{
        /* console.log('Element does not exist!'); */
       // result_elm.remove();
    }
}

function unique(arr) {
    var hash = {}, result = [];
    for ( var i = 0, l = arr.length; i < l; ++i ) {
        if ( !hash.hasOwnProperty(arr[i]) ) { //it works with objects! in FF, at least
            hash[ arr[i] ] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

function downloadSomething(){
   var image_constructed = document.getElementById('result_image');
   console.log(image_constructed);
  // var url = image_constructed.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
   var url = image_constructed.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    window.open(url);

}

initialize();
