//初期設定
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");
const ROWS = 14;
const COLUMNS = 6;
let SIZE = 40;
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
document.addEventListener("touchstart", ()=>{
    is_touched = true;
});
document.addEventListener("touchend", ()=>{
    is_touched = false;
});

//ずっと処理
function mainroop(){
    console.log(is_touched);
    requestAnimationFrame(mainroop);
}
requestAnimationFrame(mainroop);



