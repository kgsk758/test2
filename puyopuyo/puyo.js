//初期設定
let time = Date.now();
const canvas = document.getElementById("maincanvas"); //canvas取得
const ctx = canvas.getContext("2d");
const nextcanvas = document.getElementById("nextcanvas") //nextcanvas取得
const nextctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height); //画面をクリア
const allpuyo = new Image(); //ぷよスタイルシート取得
allpuyo.src = "puyoimage/allpuyo.png";
const ROWS = 14; //横の列の数(上二列は隠れる)
const COLUMNS = 6; //縦の列の数
let SIZE = 40; //一マスの大きさ
let tile = []; //盤面用
const colorlist = ["red", "green", "blue", "yellow", "purple"];
const interval = 250; //ぷよの落下速度(遅い)
const fastinterval = 125; //ぷよの落下速度(速い)

let pos = { //軸ぷよの座標,回転ぷよ,色
    x: 0, //ぷよの縦の列の位置
    y: 0, //ぷよの横の列の位置
    sub: 0, //回るぷよ 0: 右 1: 上 2: 左 3: 下
    colors: ["red", "red"] //ぷよの色 0: 軸ぷよ 1: 回転ぷよ
};
let touchpos = { //タップの座標
    x: null,
    y: null,
    state: "untouched"
};
let firsttouchpos = { //スワイプ処理用
    x: null,
    y: null
}
let touchTime = 250; //これ以上長押しするとタップにならない
const width = window.innerWidth; //デバイス判別用
console.log(width);
if(width <= 480){
    canvas.style.width = `${COLUMNS*SIZE}px`;
    canvas.style.height = `${(ROWS-2)*SIZE}px`;
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
    nextcanvas.style.width = `${SIZE}px`; //next
    nextcanvas.style.height = `${4*SIZE}px`;
    nextcanvas.width = SIZE;
    nextcanvas.height = 4*SIZE;
}else{
    SIZE += 3; //パソコン、タブレットの時のマスの大きさ
    canvas.style.width = `${COLUMNS*SIZE}px`;
    canvas.style.height = `${(ROWS-2)*SIZE}px`;
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
    nextcanvas.style.width = `${SIZE}px`; //next
    nextcanvas.style.height = `${4*SIZE}px`;
    nextcanvas.width = SIZE;
    nextcanvas.height = 4*SIZE;
}
//nextcanvas.style.top = `${canvas.offsetTop}px`;
//nextcanvas.style.left = `${canvas.offsetLeft + SIZE*COLUMNS}px`;
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
document.addEventListener("touchmove", (event)=>{ //指が触れながら動く度呼び出される
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

    }else{
        //スワイプ
    }
    touchpos.x = touch.clientX;
    touchpos.y = touch.clientY;
    touchpos.state = "untouched";
})
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
//allpuyo.onload=()=>{drawpuyo("yellow", 3, 2, "vanish");}
//ゲーム開始
const newgameElement = document.getElementById("newgame");
newgameElement.addEventListener("click", newgame); //newgameボタンが押されたらnewgame関数が呼び出される
let intervaltime = Date.now(); //操作ぷよ自然落下管理用
let thiscolor = []; //今回のゲームに使われる四色用
function newgame(){
    intervaltime = Date.now(); //操作ぷよ自然落下管理用
    let randomFour = colorlist.sort(() => Math.random() - 0.5).slice(0, 4); //5つの色からランダムに4つ選ぶ
    thiscolor = [...randomFour]; //今回のゲームに使われる四色
    console.log(thiscolor);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    tile = [];
    //盤面
    for(let n = 0; n < ROWS; n++){
        for(let m = 0; m < COLUMNS; m++){
            tile.push({
                color: null,
                row: n-2,
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
    generatepuyo();
}
function generatepuyo(){ //盤面の上部に操作するぷよを生成
    pos.x = 2; //軸ぷよの縦の列
    pos.y = -1; //軸ぷよの横の列
    pos.sub = 1; //回転ぷよを上に
    


}
function droppuyo(){
    //drawpuyo();
}

//ずっと処理
function mainroop(){
    if(touchpos.state == "untouched"){ //タップ,スワイプ判別処理
        time = Date.now();
    }
    if(Date.now() - intervaltime > interval){ //操作ぷよの自然落下をintervalミリ秒ごとに呼び出す
        intervaltime = Date.now();
        droppuyo();
    }
    requestAnimationFrame(mainroop);
}
newgame(); //ゲーム自動開始
requestAnimationFrame(mainroop); //メインループ開始



