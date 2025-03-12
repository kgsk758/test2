//初期設定
let time = Date.now();
const canvas = document.getElementById("maincanvas"); //canvas取得
const ctx = canvas.getContext("2d");
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
let next = [null, null, null, null] //next 0: ネクストの軸 1: ネクストの回転ぷよ 2,3: ネクネク
let limit = 0; //ぷよが設置されるまでの時間
let limitmanage = "off"; //ぷよ設置管理用
let dropmanage = 0; //何連続落ちたか
let limitTime = 0; //接地処理秒数カウント用
let limitpreserve = 0; //接地処理用
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
const nextcanvas = document.createElement("canvas"); //next用のcanvas要素を生成
nextcanvas.style.backgroundColor = "rgb(40, 53, 52)";
const nextctx = nextcanvas.getContext("2d");
if(width <= 480){ //スマホ
    document.getElementById("UI").prepend(nextcanvas); //スマホならUIの上(最初)にnextcanvas要素追加
    canvas.style.width = `${COLUMNS*SIZE}px`;
    canvas.style.height = `${(ROWS-2)*SIZE}px`;
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
    nextcanvas.style.width = `${SIZE}px`; //next
    nextcanvas.style.height = `${5*SIZE}px`;
    nextcanvas.width = SIZE;
    nextcanvas.height = 5*SIZE;
}else{ //パソコンタブレット
    SIZE += 3; //パソコン、タブレットの時のマスの大きさ
    const flexcanvas = document.getElementById("flexcanvas");
    flexcanvas.appendChild(nextcanvas); //パソコンタブレットならflexcanvasの最後にnextcanvas追加
    nextcanvas.style.marginLeft = "10px";
    canvas.style.width = `${COLUMNS*SIZE}px`;
    canvas.style.height = `${(ROWS-2)*SIZE}px`;
    canvas.width = COLUMNS*SIZE;
    canvas.height = (ROWS-2)*SIZE;
    nextcanvas.style.width = `${SIZE}px`; //next
    nextcanvas.style.height = `${5*SIZE}px`;
    nextcanvas.width = SIZE;
    nextcanvas.height = 5*SIZE;
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
        default: //color == nullの場合 

    }
    //隣の同色のぷよの位置(stateオブジェクト)によってスプライトシートの横の列を決める
    if (state == "vanish"){
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
    if(color != null){ //空のマスでない場合
        ctx.drawImage(allpuyo,
            spriteColumn*32, spriteRow*32 - 1, 32, 32, // スプライトシートの切り取り位置 (sx, sy, sw, sh)
            column*SIZE, row*SIZE, SIZE, SIZE // `canvas` 上の描画位置とサイズ (dx, dy, dw, dh)
        )
    }

}
//nextのぷよ描画
function drawnext(number, color){ //number 0:軸1  1:回転1  2:軸2  3:回転2
    let spriteColumn = 0;
    let drawrow = 0;
    switch(number){
        case 0:
            drawrow = 1;
            break;
        case 1:
            drawrow = 0;
            break;
        case 2:
            drawrow = 4;
            break;
        case 3:
            drawrow = 3;
            break;
    }
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
        default: //color == nullの場合 
    }
    nextctx.drawImage(allpuyo,
        spriteColumn*32, -1, 32, 32,
        0, drawrow*SIZE, SIZE, SIZE
    )
}



//ゲーム開始
const newgameElement = document.getElementById("newgame");
newgameElement.addEventListener("click", newgame); //newgameボタンが押されたらnewgame関数が呼び出される
let intervaltime = Date.now(); //操作ぷよ自然落下管理用
let thiscolor = []; //今回のゲームに使われる四色用
function newgame(){
    intervaltime = Date.now(); //操作ぷよ自然落下管理用
    let randomFour = colorlist.sort(() => Math.random() - 0.5).slice(0, 4); //5つの色からランダムに4つ選ぶ
    thiscolor = [...randomFour]; //今回のゲームに使われる四色
    let randomthree = randomFour.sort(() => Math.random() - 0.5).slice(0, 3); //4つの色からランダムに3つ選ぶ
    for(let i = 0; i < 4; i++){ //Nextの数だけ繰り返し
        //ネクスト初期化

        next[i] = randomthree[Math.floor(Math.random()*3)]; //最初のネクスト四つは三色以内
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    nextctx.clearRect(0, 0, nextcanvas.width, nextcanvas.height);
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
    generatepuyo();
}
function generatepuyo(){ //盤面の上部に操作するぷよを生成
    limitmanage = "off"; //接地処理用
    dropmanage = 0; //何連続落ちたか
    limit = interval*2; //ぷよが設置されるまでの時間
    pos.x = 2; //軸ぷよの縦の列
    pos.y = -0.5; //軸ぷよの横の列
    pos.sub = 1; //回転ぷよを上に
    pos.colors[0] = next[0]; //軸ぷよの色をネクストの0に
    pos.colors[1] = next[1]; //回転ぷよの色をネクストの1に
    next[0] = next[2]; //ネクストを移動
    next[1] = next[3];
    next[2] = thiscolor[Math.floor(Math.random()*4)]; //新しいネクストを生成
    next[3] = thiscolor[Math.floor(Math.random()*4)];
    render();
}
function droppuyo(){
    dropmanage++;
    pos.y += 0.5; //落下
    if(Math.floor(pos.y) != pos.y){ //もし中途半端なマスにいるとき
        if(isValid(pos.x, pos.y + 0.5) == "notEmpty"){ //pos.yの下にあるマスが空じゃない時
            pos.y -= 0.5; //戻す
            dropmanage = 0;

        }
    }
    console.log(dropmanage);
    render();
}
function isValid(x, y){
    if(Math.floor(y) == y){ //pos.yが整数の時でなければならない
        if(tile.some(tile => tile.color == null && tile.row == y && tile.column == x)){ //軸ぷよが空のマスにいる
            if(tile.some(tile => tile.color == null && tile.row == y - Math.sin(pos.sub*(Math.PI/2)) && tile.column == x + Math.cos(pos.sub*(Math.PI/2)))){ //回転ぷよが空のマスにいる
                return true;
            }else{
                
                return "notEmpty";
            }
        }else{
            return "notEmpty";
        }
    }
}
function fix(){

}
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    nextctx.clearRect(0, 0, nextcanvas.width, nextcanvas.height);
    let j = 0; //リスト番号指定用
    for(let n = 0; n < ROWS; n++){ //盤面の描画
        for(let m = 0; m < COLUMNS; m++){
            drawpuyo(tile[j].color, tile[j].row, tile[j].column, tile[j].state);
            j++;
        }
    }
    for(let i = 0; i < 4; i++){ //next描画
        drawnext(i, next[i]);
    }
    //操作ぷよ描画
    drawpuyo( //軸ぷよ
        pos.colors[0], pos.y, pos.x, {
            right: null,
            above: null,
            left: null,
            below: null
        }
    );
    drawpuyo( //回転ぷよ
        pos.colors[1], 
        pos.y - Math.sin(pos.sub*(Math.PI/2)),
        pos.x + Math.cos(pos.sub*(Math.PI/2)),
        {
            right: null,
            above: null,
            left: null,
            below: null
        }

    );
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
    if(dropmanage >= 2){ //操作ぷよが2連続で下に進んだときlimitを元の値にリセット
        limit = interval*2; //ぷよが設置されるまでの時間
    }
    if(isValid(pos.x, pos.y + 1) == "notEmpty"){ //接地している時にlimitmanageを"on"にする
        if(limitmanage == "off"){ //"off"から"on"に切り替わる時
            limitTime = Date.now(); //接地した瞬間limitをlimitpreserveに保存
            limitpreserve = limit; //接地した瞬間の時間をlimitTimeに保存
        }
        limitmanage = "on"; //接地している間はlimitpreserveから接地してから経った時間を引いた値をlimitに代入する
        limit = limitpreserve - (Date.now() - limitTime); //limitがリセットされない限りひかれ続ける

    }else{
        limitmanage = "off";
    }
    if(limit < 0){ //limitがゼロより小さくなった時接地とする
        console.log("接地！");
    }
    console.log(limit);
    console.log(limitmanage);
    requestAnimationFrame(mainroop);
}
allpuyo.onload = () => { //ぷよスプライトシートが読み込まれてから
    newgame(); //ゲーム自動開始
}
requestAnimationFrame(mainroop); //メインループ開始



