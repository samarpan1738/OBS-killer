const video=document.querySelector('video');
const startBtn=document.getElementById('startBtn');
const stopBtn=document.getElementById('stopBtn');
const videoSelectBtn=document.getElementById('videoSelectBtn');
const {desktopCapturer,remote}=require('electron');
const {Menu,dialog}=remote;
const {writeFile}=require('fs');
const { start } = require('repl');
// console.log(clipboard.readText(),clipboard.readText());

//Get video sources
// globalShortcut.register('`', () => {
//     console.log(remote.getCurrentWindow()); 
//     // Do stuff when Y and either Command/Control is pressed.
//     console.log("Terminal shortcut")
//   })
startBtn.onclick = e => {
    console.log("Started recording");
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
  };

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};
let sourcesName=[]
async function getVideoSources()
{
    const inputSources=await desktopCapturer.getSources({types:['window','screen']});
    const videoOptionsMenu=Menu.buildFromTemplate(
        inputSources.map(source=>{
                    return{
                        label:source.name,
                        click:()=>selectSource(source)
                    }
                })
    )
    videoOptionsMenu.popup();
}

function handleError (e) {
console.log(e)
}

function handleStream (stream) {
    video.srcObject = stream
    // startBtn.disabled=false;
    video.onloadedmetadata = (e) => video.play()
}

let mediaRecorder,recordedChunks=[],isRecording=false;
function record(stream)
{
    // isRecording=true;
    console.log("Started recording");
    // startBtn.disabled=true;
    const options={mimeType:'video/webm;codecs=vp9'};
    mediaRecorder=new MediaRecorder(stream,options);
    // mediaRecorder.start();
    //Event Handlers
    mediaRecorder.ondataavailable=handleAvailableData;
    mediaRecorder.onstop=handleStop;
    // stopBtn.disabled=false;
    // stopBtn.onclick=()=>mediaRecorder.stop();
}
let cnt=0
function handleAvailableData(e)
{
    recordedChunks.push(e.data);
    console.log(recordedChunks.length);
}
async function handleStop(e){
    // stopBtn.disabled=true;
    let options={
        type:'video/webm;codecs=vp9'
    }
    const blob=new Blob(recordedChunks,options);
    //Convert BLOB to Buffer
    const buffer=Buffer.from(await blob.arrayBuffer());
    const {filePath }=await dialog.showSaveDialog({
        buttonLabel:'Save Video',
        defaultPath:`vid-${Date.now()}.webm`
    });
    // console.log(toString(filePath ));
    writeFile(filePath ,buffer,()=>console.log("Video Saved Successfully"));
    // startBtn.disabled=false;
}
async function selectSource(source)
{
    // console.log(source);
    videoSelectBtn.innerText=source.name
    let constraints={
        audio:false,
        video:{
            mandatory: 
            {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId:source.id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        }
        try
        {
            const stream=await navigator.mediaDevices.getUserMedia(constraints);
            handleStream(stream);
            // startBtn.disabled=false;
            record(stream);
    }
    catch(e)
    {
        handleError(e)
    }
}
videoSelectBtn.onclick=getVideoSources
// stopBtn.onclick=mediaRecorder.stop();