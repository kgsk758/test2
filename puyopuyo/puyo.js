//初期設定
let time = Date.now();
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");
const ROWS = 14;
const COLUMNS = 6;
let SIZE = 40;
let pos = {
    x: 0,
    y: 0
};
let touchpos = {
    x: null,
    y: null,
    state: "untouched"
};
let firsttouchpos = {
    x: null,
    y: null
}
let touchTime = 250;
const width = window.innerWidth;
console.log(width);
if(width <= 480){
    canvas.style.width = `${COLUMNS*SIZE}px`;
canvas.style.height = `${(ROWS-2)*SIZE}px`;
}else{
    SIZE += 3;
canvas.style.width = `${COLUMNS*(SIZE)}px`;
canvas.style.height = `${(ROWS-2)*(SIZE)}px`;
}
//タッチ処理
document.addEventListener("touchstart", (event)=>{
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    firsttouchpos.x = touch.clientX;
    firsttouchpos.y = touch.clientY;
    touchpos.state = "touched";
})
document.addEventListener("touchmove", (event)=>{
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    touchpos.state = "touched";
})
document.addEventListener("touchend", (event)=>{
    let touch = event.changedTouches[0];
    if(Date.now() - time < touchTime && Math.abs(firsttouchpos.x - touch.clientX) < SIZE / 3 && Math.abs(firsttouchpos.y - touch.clientY) < SIZE / 3){
        //タップ
        console.log("tap");
    }else{
        //スワイプ
        console.log("swipe");
    }


    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    touchpos.state = "untouched";
})

//ずっと処理
function mainroop(){
    if(touchpos.state == "untouched"){
        time = Date.now();
    }
    requestAnimationFrame(mainroop);
}
requestAnimationFrame(mainroop);



