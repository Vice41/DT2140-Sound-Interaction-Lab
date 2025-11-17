//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;
let thunderNode = null;
let thunderNodeParams = null;
let thunderJsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "laser";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
laser.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/laser/trigger");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });

// Thunder setup
const thunderDspName = "thunder";
const thunderInstance = new FaustWasm2ScriptProcessor(thunderDspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[thunderDspName] = thunderInstance;
} else {
    const exp = {};
    exp[thunderDspName] = thunderInstance;
    module.exports = exp;
}

// The name should be the same as the WASM file
thunder.createDSP(audioContext, 1024)
    .then(node => {
        thunderNode = node;
        thunderNode.connect(audioContext.destination);
        console.log('params: ', thunderNode.getParams());
        const jsonString = thunderNode.getJSON();
        thunderJsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        thunderNodeParams = thunderJsonParams
        // const exampleMinMaxParam = findByAddress(thunderNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

let charged = false;

function accelerationChange(accx, accy, accz) {

}

function rotationChange(rotx, roty, rotz) {
    if(rotx >= 80 && rotx <= 100 && rotz >= 180 && rotz <= 300) {
        playAudio("charge");
        charged = true;
    }
    else {
        // Phone is no longer pointed up, stop the laser sound
        if (!dspNode) {
            return;
        }
        dspNode.setParamValue("/laser/trigger", 0);
    }
}

function mousePressed() {
    //playAudio()
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio("release");
    charged = false;
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio(action) {
    switch(action) {
        case "charge":
            if (!dspNode) 
            {
                return;
            }
            if (audioContext.state === 'suspended') 
            {
                return;
            }
            dspNode.setParamValue("/laser/trigger", 1)
            break;
        case "release":
            if(charged) 
            {
                if (!thunderNode) 
                {
                    return;
                }
                if (audioContext.state === 'suspended') 
                {
                    return;
                }
                thunderNode.setParamValue("/thunder/rumble", 1)
                setTimeout(() => { thunderNode.setParamValue("/thunder/rumble", 0) }, 100);
            }
            break;
        default:
            break;
    }
}

//==========================================================================================
// END
//==========================================================================================