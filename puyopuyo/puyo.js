//初期設定
const canvas = document.getElementById("maincanvas");
//const ui = document.getElementById("UI");
const ctx = canvas.getContext("2d");
const ROWS = 14;
const COLUMNS = 6;
let SIZE = 30;
const width = window.innerWidth;
console.log(width);
if(width <= 480){
    canvas.style.width = `${COLUMNS*SIZE}px`;
canvas.style.height = `${(ROWS-2)*SIZE}px`;
//ui.style.fontsize = "10px";
}else{
    SIZE += 20;
canvas.style.width = `${COLUMNS*(SIZE)}px`;
canvas.style.height = `${(ROWS-2)*(SIZE)}px`;
//ui.style.fontsize = "100px";
}