//初期設定
let time = Date.now();
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
const allpuyo = new Image(); //ぷよスタイルシート取得
allpuyo.src = "puyoimage/allpuyo.png";
const ROWS = 14;
const COLUMNS = 6;
let SIZE = 40;
let tile = [];
const colorlist = ["red", "green", "blue", "yellow", "purple"];

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
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
}else{
    SIZE += 3;
    canvas.style.width = `${COLUMNS*SIZE}px`;
    canvas.style.height = `${(ROWS-2)*SIZE}px`;
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
}
//タッチ処理
document.addEventListener("touchstart", (event)=>{
    if (event.target.tagName === "BUTTON") {
        return; // ボタンなら無視
    }
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    firsttouchpos.x = touch.clientX;
    firsttouchpos.y = touch.clientY;
    touchpos.state = "touched";
})
document.addEventListener("touchmove", (event)=>{
    if (event.target.tagName === "BUTTON") {
        return; // ボタンなら無視
    }
    let touch = event.touches[0];
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    touchpos.state = "touched";
})
document.addEventListener("touchend", (event)=>{
    if (event.target.tagName === "BUTTON") {
        return; // ボタンなら無視
    }
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
//盤面
for(let n = 0; n < ROWS; n++){
    for(let m = 0; m < COLUMNS; m++){
        tile.push({
            color: null,
            row: n,
            column: m,
            state: {
                right: null,
                above: null,
                left: null,
                below: null
            }
        });
    }
}
console.log(tile);
//ぷよ描画
function drawpuyo(color, row, column, state){
    console.log(state);
    let spriteRow = 0;
    let spriteColumn = 0;
    switch(color){ //色によってスプライトシートの縦の列を決める
        case "red":
            spriteColumn = 0;
            break;
        case "green":
            spriteColumn = 1;
            break;
        case "blue":
            spriteColumn = 2;
            break;
        case "yellow":
            spriteColumn = 3;
            break;
        case "purple":
            spriteColumn = 4;
            break; 
    }
    //隣の同色のぷよの位置(stateオブジェクト)によってスプライトシートの横の列を決める
    if(state == "vanish"){
        spriteRow = spriteColumn + 5; //消えるエフェクトの色を指定
        spriteColumn = 5;
    }else{
        const spriteRows = {
            "same-same-same-same": 15,
            "same-null-same-same": 14,
            "same-same-same-null": 13,
            "same-null-same-null": 12,
            "same-same-null-same": 11,
            "same-null-null-same": 10,
            "same-same-null-null": 9,
            "same-null-null-null": 8,
            "null-same-same-same": 7,
            "null-null-same-same": 6,
            "null-same-same-null": 5,
            "null-null-same-null": 4,
            "null-same-null-same": 3,
            "null-null-null-same": 2,
            "null-same-null-null": 1,
            "null-null-null-null": 0
        };
            
            // 状態を文字列にしてキーを作成
        const stateKey = `${state.right}-${state.above}-${state.left}-${state.below}`;
            
            // マッピングオブジェクトを使って値を取得
        spriteRow = spriteRows[stateKey] || 0;  // 見つからなければ0をデフォルト
    }
    console.log(spriteRow);
    ctx.drawImage(allpuyo,
        spriteColumn*32, spriteRow*32, 32, 32, // スプライトシートの切り取り位置 (sx, sy, sw, sh)
        column*SIZE, row*SIZE, SIZE, SIZE // `canvas` 上の描画位置とサイズ (dx, dy, dw, dh)
    )


}
allpuyo.onload=()=>{drawpuyo("yellow", 3, 2, "vanish");}

//ずっと処理
function mainroop(){
    if(touchpos.state == "untouched"){
        time = Date.now();
    }
    requestAnimationFrame(mainroop);
}
requestAnimationFrame(mainroop);



