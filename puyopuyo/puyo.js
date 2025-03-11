//初期設定
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
    y: null
};
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
let is_touched = false;
document.addEventListener("touchstart", (event)=>{
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
})
document.addEventListener("touchmove", (event)=>{
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
})
document.addEventListener("touchend", (event)=>{
    let touch = event.touches[0];
    touchpos.x = null;
    touchpos.y = null;
})

//ずっと処理
function mainroop(){
    console.log(touchpos);
    requestAnimationFrame(mainroop);
}
requestAnimationFrame(mainroop);



