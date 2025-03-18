//初期設定
let touchManage = 0;
let time = Date.now();
let sensitivity = 0; //横移動の感度
let timeoutId = 0;
let rotateTimer = 0;
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
let interval = 0; //ぷよの落下速度
const slowinterval = 250; //ぷよの落下速度(遅い)
const fastinterval = 20; //ぷよの落下速度(速い)
let fallcheck = []; //ぷよの落とすマス数を入れる配列
let drawMainPuyo = true; //操縦ぷよを描画するか
let next = [null, null, null, null] //next 0:ネクストの軸  1:ネクストの回転ぷよ  2,3:ネクネク
let limit = 0; //ぷよが設置されるまでの時間
let limitmanage = "off"; //ぷよ設置管理用
let dropmanage = 0; //何連続落ちたか
let limitTime = 0; //接地処理秒数カウント用
let limitpreserve = 0; //接地処理用
let isRotating = false; //回転中か
let rotateSpeed = 50; //四分の一回転にかかるミリ秒
let tapPreserve = 0; //スワイプした瞬間の指の座標を保存
let xPreserve = 0; //スワイプした瞬間の操作ぷよの座標を保存
let k = 0;
const fallSpeed = 50; //設置後の落ちる速さ(ミリ秒)
let animationDt = { //アニメーションで移動する距離
    dx: 0,
    dy: 0
}
let rotateManage = 0;
let pos = { //軸ぷよの座標,回転ぷよ,色
    x: 0, //ぷよの縦の列の位置
    y: 0, //ぷよの横の列の位置
    drawX: 0, //描画用x
    drawY: 0, //描画用y
    sub: 0, //判定用の回るぷよ 0:右  1:上  2:左  3:下 
    drawsub: 0, //描画用の回るぷよ
    virtualsub: 0, //仮想の回るぷよ
    colors: ["red", "red"] //ぷよの色 0:軸ぷよ  1:回転ぷよ
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
    SIZE += 4; //パソコン、タブレットの時のマスの大きさ
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
    touchManage = 1;
    if(drawMainPuyo == true){
        sensitivity = 0.75;
        if (event.target.tagName === "BUTTON") {
            return; // ボタンなら無視
        }
        let touch = event.touches[0];
        touchpos.x = touch.clientX;
        touchpos.y = touch.clientY;
        firsttouchpos.x = touch.clientX;
        firsttouchpos.y = touch.clientY;
        touchpos.state = "touched";
        tapPreserve = Math.floor(touch.clientX/(SIZE*sensitivity));
        xPreserve = pos.x;
    }
})
document.addEventListener("touchmove", (event)=>{ //指が触れながら動く度呼び出される
    if(drawMainPuyo == true){
        if (event.target.tagName === "BUTTON") {
            return; // ボタンなら無視
        }
        let touch = event.touches[0];
        touchpos.x = touch.clientX;
        touchpos.y = touch.clientY;
        touchpos.state = "touched";
        if(touchManage == 0){
            touchManage = 1;
            tapPreserve = Math.floor(touch.clientX/(SIZE*sensitivity));
            xPreserve = pos.x;
        }
        let xTemp = xPreserve + (Math.floor(touch.clientX/(SIZE*sensitivity)) - tapPreserve);
        
        if(firsttouchpos.y + 0.75*SIZE < touchpos.y/* && touchpos.y - firsttouchpos.y > Math.abs(firsttouchpos.x - touchpos.x)*/){
            interval = fastinterval; //下にスワイプしたら高速落下
        }else{
            //interval = slowinterval;
        }
        if(touchpos.y - firsttouchpos.y < Math.abs(firsttouchpos.x - touchpos.x)){
            if(moveCheck(pos.x, pos.y, xTemp, pos.y, pos.sub) == "notEmpty"){ //横移動
                xPreserve = pos.x;
                tapPreserve = Math.floor(touch.clientX/(SIZE*sensitivity));
            }else{
                if(interval == fastinterval && pos.x != xTemp){
                    interval = slowinterval;
                    tapPreserve = Math.floor(touch.clientX/(SIZE*sensitivity));
                    xPreserve = pos.x;
                    firsttouchpos.y = touch.clientY;
                }
                pos.x = xTemp;
                pos.drawX = xTemp;
            }
        }else{
            tapPreserve = Math.floor(touch.clientX/(SIZE*sensitivity));
            xPreserve = pos.x;
        }
        render();
    }

})
document.addEventListener("touchend", (event)=>{
    if(drawMainPuyo == true){
        interval = slowinterval; //指を離したら遅くする
        if (event.target.tagName === "BUTTON") {
            return; // ボタンなら無視
        }
        let touch = event.changedTouches[0];
        if(Date.now() - time < touchTime && Math.abs(firsttouchpos.x - touch.clientX) < SIZE / 3 && Math.abs(firsttouchpos.y - touch.clientY) < SIZE / 3){
            //タップ
            //console.log(touch.clientX);
            if(touch.clientX >= width/2){ //タップの座標が画面の半分より大きいか
                //右側タップ
                rotation("right");
            }else{
                //左側タップ
                rotation("left");
            }
        }else{
            //スワイプ
        }
        touchpos.x = touch.clientX;
        touchpos.y = touch.clientY;
        touchpos.state = "untouched";
    }
})
//ぷよ横移動できるか判定(スマホ用)
function moveCheck(x0, y0, x1, y1, direction){ //0:移動前座標  1:移動後座標
    if(Math.abs(x1 - x0) >= 1){
        let i = Math.sign(x1 - x0); //(x1 - x0) が正 =>1 負 =>-1
        for(let n = 0; Math.abs(n) < Math.abs(x1 - x0);){
            n += i;
            if(isValid(x0 + n, Math.ceil(y0)) == "notEmpty" || isValid(subpuyo(direction, x0 + n, y0).subX, Math.ceil(subpuyo(direction, x0 + n, y0).subY)) == "notEmpty"){
                return "notEmpty";
            }
        }
    }
}
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
            spriteColumn*32 + 0.1, spriteRow*32 + 0.1, 32 - 0.2, 32 - 0.2, // スプライトシートの切り取り位置 (sx, sy, sw, sh)
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
    clearTimeout(timeoutId);
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
    sensitivity = 0.75;
    drawMainPuyo = true; //操作ぷよを描画する
    touchManage = 0;
    interval = slowinterval; //落下速度初期設定
    isRotating = false; //回転中か
    limitmanage = "off"; //接地処理用
    dropmanage = 0; //何連続落ちたか
    limit = interval*2; //ぷよが設置されるまでの時間
    pos.x = 2; //軸ぷよの縦の列
    pos.y = -0.5; //軸ぷよの横の列
    pos.drawX = 2; //描画用x
    pos.drawY = -0.5; //描画用y
    pos.sub = 1; //判定用回転ぷよを上に
    pos.drawsub = 1; //描画用回転ぷよを上に
    pos.virtualsub = 1; //仮想回転ぷよを上に
    pos.colors[0] = next[0]; //軸ぷよの色をネクストの0に
    pos.colors[1] = next[1]; //回転ぷよの色をネクストの1に
    next[0] = next[2]; //ネクストを移動
    next[1] = next[3];
    next[2] = thiscolor[Math.floor(Math.random()*4)]; //新しいネクストを生成
    next[3] = thiscolor[Math.floor(Math.random()*4)];
    render();
}
function droppuyo(){
    dropmanage++; //連続落下数を加算
    pos.y += 0.5; //落下
    pos.drawY += 0.5;
    if(Math.floor(pos.y) != pos.y){ //もしyが中途半端なマスにいるとき
        if(isValid(pos.x, pos.y + 0.5) == "notEmpty" || isValid(subpuyo(pos.sub, pos.x, pos.y).subX, subpuyo(pos.sub, pos.x, pos.y).subY + 0.5) == "notEmpty"){ //軸ぷよか回転ぷよが埋まっているかどうか
            pos.y -= 0.5; //戻す
            pos.drawY -= 0.5;
            dropmanage = 0; //連続落下数をゼロにする
        }
    }
    render();
}
function isValid(x, y){
    if(tile.some(tile => tile.color == null && tile.row == y && tile.column == x)){ //対象の座標が空のマスか
        return true;
    }else{
        return "notEmpty";
    }
}
document.addEventListener("keydown", event => { //キーボード操作
    if(drawMainPuyo == true){
        if(isRotating == false){
            rotateManage = 0;
            switch(event.key){
                case "z": //左回転処理
                    rotateManage = 1;
                    break;
                case "x": //右回転処理
                    rotateManage = -1;
                    break;
            }
        }
        if((event.key == "z" || event.key == "x") && isRotating == false){
            animationDt.dx = 0; //滑らかに移動する用
            animationDt.dy = 0;
            limit = interval*2 //仮に回転で接地判定をリセットする
            pos.sub += rotateManage; //判定用回転ぷよを回転
            pos.virtualsub += rotateManage; //仮想回転ぷよを回転
            if(Math.floor(pos.y) == pos.y){ //もしy座標が整数なら
                if(isValid(subpuyo(pos.virtualsub, pos.x, pos.y).subX, subpuyo(pos.virtualsub, pos.x, pos.y).subY) == true){
                    //回転成功
                    isRotating = true;
                    pos.sub = pos.virtualsub;
                }else if(isValid(subpuyo(pos.virtualsub + 2, pos.x, pos.y).subX, subpuyo(pos.virtualsub + 2, pos.x, pos.y).subY) == true){
                    //回転方向に障害物　回転の反対方向に空あり　回転成功
                    isRotating = true;
                    pos.sub = pos.virtualsub;
                    animationDt.dx = -1 * (Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000); 
                    animationDt.dy = Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
                    //反対方向に一マス移動
                    pos.x -= Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000; 
                    pos.y += Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
                }else{
                    //回転失敗
                    pos.sub -= rotateManage;
                }
            }else{ //もしy座標が中途半端なら半分下としてマスを調べる
                if(isValid(subpuyo(pos.virtualsub, pos.x, pos.y + 0.5).subX, subpuyo(pos.virtualsub, pos.x, pos.y + 0.5).subY) == true){
                    //回転成功
                    isRotating = true;
                    pos.sub = pos.virtualsub;
                }else if(isValid(subpuyo(pos.virtualsub + 2, pos.x, pos.y + 0.5).subX, subpuyo(pos.virtualsub + 2, pos.x, pos.y + 0.5).subY) == true){
                    //回転方向に障害物　回転の反対方向に空あり　回転成功
                    isRotating = true;
                    pos.sub = pos.virtualsub;
                    animationDt.dx = -1 * (Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000); 
                    animationDt.dy = 0.5 * Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
                    //反対方向に一マス移動
                    pos.x -= Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000; 
                    pos.y += 0.5*(Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000);
                }else{
                    //回転失敗
                    pos.sub -= rotateManage;
                }
            }
            rotateManage = pos.virtualsub - pos.drawsub;
            render()
        }
        switch(event.key){
            case "ArrowRight":
                pos.x += 1;
                pos.drawX += 1;
                if(isValid(pos.x, Math.ceil(pos.y)) == "notEmpty" || isValid(subpuyo(pos.sub, pos.x, pos.y).subX, Math.ceil(subpuyo(pos.sub, pos.x, pos.y).subY)) == "notEmpty"){
                    pos.x -= 1;
                    pos.drawX -= 1;
                }
                render();
                break;
            case "ArrowLeft":
                pos.x -= 1;
                pos.drawX -= 1;
                if(isValid(pos.x, Math.ceil(pos.y)) == "notEmpty" || isValid(subpuyo(pos.sub, pos.x, pos.y).subX, Math.ceil(subpuyo(pos.sub, pos.x, pos.y).subY)) == "notEmpty"){
                    pos.x += 1;
                    pos.drawX += 1;
                }
                render();
                break;
            case "ArrowDown":
                interval = fastinterval;
                intervaltime = Date.now() - interval;
                break;

        }
    }
})
document.addEventListener("keyup", (event) =>{
    if(event.key == "ArrowDown"){
        interval = slowinterval;
        intervaltime = Date.now()
    }
})
//})
function rotation(RorL){ //スマホ用回転
    if(isRotating == false){
        rotateManage = 0;
        switch(RorL){
            case "left": //左回転処理
                rotateManage = 1;
                break;
            case "right": //右回転処理
                rotateManage = -1;
                break;
        }
        animationDt.dx = 0; //滑らかに移動する用
        animationDt.dy = 0;
        limit = interval*2 //仮に回転で接地判定をリセットする
        pos.sub += rotateManage; //判定用回転ぷよを回転
        pos.virtualsub += rotateManage; //仮想回転ぷよを回転
        if(Math.floor(pos.y) == pos.y){ //もしy座標が整数なら
            if(isValid(subpuyo(pos.virtualsub, pos.x, pos.y).subX, subpuyo(pos.virtualsub, pos.x, pos.y).subY) == true){
                //回転成功
                isRotating = true;
                pos.sub = pos.virtualsub;
            }else if(isValid(subpuyo(pos.virtualsub + 2, pos.x, pos.y).subX, subpuyo(pos.virtualsub + 2, pos.x, pos.y).subY) == true){
                //回転方向に障害物　回転の反対方向に空あり　回転成功
                isRotating = true;
                pos.sub = pos.virtualsub;
                animationDt.dx = -1 * (Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000); 
                animationDt.dy = Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
                //反対方向に一マス移動
                pos.x -= Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000; 
                pos.y += Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
            }else{
                //回転失敗
                pos.sub -= rotateManage;
            }
        }else{ //もしy座標が中途半端なら半分下としてマスを調べる
            if(isValid(subpuyo(pos.virtualsub, pos.x, pos.y + 0.5).subX, subpuyo(pos.virtualsub, pos.x, pos.y + 0.5).subY) == true){
                //回転成功
                isRotating = true;
                pos.sub = pos.virtualsub;
            }else if(isValid(subpuyo(pos.virtualsub + 2, pos.x, pos.y + 0.5).subX, subpuyo(pos.virtualsub + 2, pos.x, pos.y + 0.5).subY) == true){
                //回転方向に障害物　回転の反対方向に空あり　回転成功
                isRotating = true;
                pos.sub = pos.virtualsub;
                animationDt.dx = -1 * (Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000); 
                animationDt.dy = 0.5 * Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000;
                //反対方向に一マス移動
                pos.x -= Math.round(1000*Math.cos(pos.sub*(Math.PI/2)))/1000; 
                pos.y += 0.5*(Math.round(1000*Math.sin(pos.sub*(Math.PI/2)))/1000);
            }else{
                //回転失敗
                pos.sub -= rotateManage;
            }
        }
        rotateManage = pos.virtualsub - pos.drawsub;
        render()
    }
}
function fix(x, y, color){ //ぷよを設置
    let index = tile.findIndex( (tile) => tile.column == x && tile.row == y);
    tile[index].color = color;
}
function fall(){ //ぷよを落下の管理
    fallcheck = []; //初期化
    for(let n = 0; n < ROWS; n++){
        for(let m = 0; m < COLUMNS; m++){
            //マスごとに落ちるマス数を確かめる
            let index = tile.findIndex((tile) => tile.column == m && tile.row == n-2); //横がm,縦がn-2の座標のマスの配列上の位置取得
            let fallTimes = 0;
            if(tile[index].color != null){
                for(let i = index + COLUMNS; i < tile.length; i += COLUMNS){
                    //マスの真下のマスを調べていく
                    if(tile[i].color == null){ //もし調べたマスが空なら
                        fallTimes++;
                    }
                }
            }
            fallcheck.push(fallTimes); //落ちる量を配列に保存
        }
    }
    let count = 0; //落下処理を行った回数カウント
    let copy = [...fallcheck];
    timeoutId = setTimeout(fallOnce, 0);
    function fallOnce(){ //半マスだけ落下させる
        count++;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
        let j = 0; //落ちる必要のあるぷよの数のカウント
        for(let i = 0; i < tile.length; i++){
            if(copy[i] > 0){ //落ちるぷよについて
                tile[i].state = {
                    right: null,
                    above: null,
                    left: null,
                    below: null
                }
                j++;
                copy[i] -= 0.5;
                drawpuyo(tile[i].color, tile[i].row + 0.5*count, tile[i].column, {
                    right: null,
                    above: null,
                    left: null,
                    below: null
                });
            }else{
                drawpuyo(tile[i].color, tile[i].row + fallcheck[i], tile[i].column, tile[i].state);
            }
        }
        if(j > 0){
            timeoutId = setTimeout(fallOnce, fallSpeed);
        }else{ //次の処理へ移行
            for(let i = tile.length - 1; i >= 0; i--){ //インデックスは最後のマスから最初のマスまで
                if(fallcheck[i] > 0){ //そのマスの落下量が一以上なら
                    tile[i + fallcheck[i]*COLUMNS] = {
                        color: tile[i].color,
                        row: tile[i].row + fallcheck[i],
                        column: tile[i].column,
                        state: {
                            right: null,
                            above: null,
                            left: null,
                            below: null
                        }
                    }; //tileのi番目の情報を落ちるマス分下のマスに代入
                    tile[i].color = null;
                    //console.log(tile[i + fallcheck[i]*COLUMNS]);
                }
                
            }
            render();
            connect();
            render();
            chain();
        }
    }
}
function connect(){ //ぷよを繋ぐ
    for(let i = 0; i < tile.length; i++){
        tile[i].state = {
            right: null,
            above: null,
            left: null,
            below: null
        }
        if(tile[i].color != null){
            if(i % COLUMNS != 0 && tile[i - 1].color == tile[i].color){ //左端でなければかつ左がおなじ色なら
                tile[i].state.left = "same";
            }
            if(i % COLUMNS != COLUMNS - 1 && tile[i + 1].color == tile[i].color){ //右端でなければかつ右がおなじ色なら
                tile[i].state.right = "same";
            }
            if(i > COLUMNS - 1 && tile[i - COLUMNS].color == tile[i].color){ //上端でなく上と同じ色なら
                tile[i].state.above = "same";
            }
            if(tile[i].row < ROWS -3 && tile[i + COLUMNS].color == tile[i].color){ //下端でなく下と同じ色なら
                tile[i].state.below = "same";
            }
        }
    }
}
function chain(){ //一連鎖分
    let chainPuyo = [];
    let chainPuyoSpread = [];
    for(let i = 0; i < tile.length; i++){
        let checked = []; //チェックされたマス
        function check(k){ //再帰的にチェック
            checked.push(k);
            if(tile[k].state.right == "same" && checked.includes(k + 1) == false){
                check(k + 1);
            }
            if(tile[k].state.above == "same" && checked.includes(k - COLUMNS) == false){
                check(k - COLUMNS);
            }
            if(tile[k].state.left == "same" && checked.includes(k - 1) == false){
                check(k - 1);
            }
            if(tile[k].state.below == "same" && checked.includes(k + COLUMNS) == false){
                check(k + COLUMNS);
            }
        }
        if(chainPuyoSpread.includes(i) == false){
            check(i);
        }
        if(checked.length >= 4){ //四個以上連なったら
            chainPuyoSpread.push(...checked);
            chainPuyo.push([tile[i].color, ...checked]);
        }
    }
    console.log(chainPuyoSpread);
    if(chainPuyo.length > 0){ //消えるぷよがあったら
        setTimeout(() => {
            for(let n = 0; n < chainPuyoSpread.length; n++){
                tile[chainPuyoSpread[n]].state = "vanish";
            }
            render();
            setTimeout(() => {
                for(let n = 0; n < chainPuyoSpread.length; n++){
                    tile[chainPuyoSpread[n]].color = null;
                    tile[chainPuyoSpread[n]].state = {
                        right: null,
                        above: null,
                        left: null,
                        below: null
                    };
                }
                render();
                setTimeout(fall, 250);
            }, 250);
        }, 250);
    }else{
        generatepuyo();
    }
}
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    nextctx.clearRect(0, 0, nextcanvas.width, nextcanvas.height); //ネクスト画面をクリア
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
    if(drawMainPuyo == true){ //もし操作ぷよ描画が許可されているなら
        drawpuyo( //軸ぷよ
            pos.colors[0], pos.drawY, pos.drawX, {
                right: null,
                above: null,
                left: null,
                below: null
            }
        );
        drawpuyo( //回転ぷよ
            pos.colors[1], 
            pos.drawY - Math.sin(pos.drawsub*(Math.PI/2)),
            pos.drawX + Math.cos(pos.drawsub*(Math.PI/2)),
            {
                right: null,
                above: null,
                left: null,
                below: null
            }

        );
    }
}
function subpuyo(direction, x, y){ //回転ぷよの座標(subX, subY)を返す　引数は回転数と軸ぷよの座標(x, y)
    let subpuyo_x = x + Math.round(1000*Math.cos(direction*(Math.PI/2)))/1000;
    let subpuyo_y = y - Math.round(1000*Math.sin(direction*(Math.PI/2)))/1000;
    return {
        subX: subpuyo_x,
        subY: subpuyo_y
    }
}
//ずっと処理
function mainroop(){
    if(touchpos.state == "untouched"){ //タップ,スワイプ判別処理
        time = Date.now();
    }
    if(Date.now() - intervaltime > interval){ //操作ぷよの自然落下をintervalミリ秒ごとに呼び出す
        intervaltime = Date.now();
        if(drawMainPuyo == true){
            droppuyo();
        }
    }
    if(dropmanage >= 3){ //操作ぷよが3連続で下に進んだときlimitを元の値にリセット
        limit = slowinterval*2; //ぷよが設置されるまでの時間
    }
    if(Math.floor(pos.y) == pos.y && (isValid(pos.x, pos.y + 1) == "notEmpty" || isValid(subpuyo(pos.sub, pos.x, pos.y).subX, subpuyo(pos.sub, pos.x, pos.y).subY + 1) == "notEmpty")){ //接地している時にlimitmanageを"on"にする
        if(limitmanage == "off"){ //"off"から"on"に切り替わる時
            limitTime = Date.now(); //接地した瞬間limitをlimitpreserveに保存
            limitpreserve = limit; //接地した瞬間の時間をlimitTimeに保存
            dropmanage = 0;
        }
        limitmanage = "on"; //接地している間はlimitpreserveから接地してから経った時間を引いた値をlimitに代入する
        limit = limitpreserve - (Date.now() - limitTime); //limitがリセットされない限りひかれ続ける
        intervaltime = Date.now(); //接地している間ぷよの落下を呼び出す間隔をリセット
        //console.log("仮接地！");
    }else{
        limitmanage = "off";
    }
    if(limit < 0){ //limitがゼロより小さくなった時接地とする
        //console.log("接地！");
        if(drawMainPuyo == true){
            drawMainPuyo = false; //操作ぷよの描画を停止
            fix(pos.x, pos.y, pos.colors[0]); //ぷよを盤面に設置
            fix(subpuyo(pos.sub, pos.x, pos.y).subX, subpuyo(pos.sub, pos.x, pos.y).subY, pos.colors[1]);
            render();
            fall();

            
        }
    }
    //console.log(limit);
    //console.log(dropmanage);
    if(isRotating == true){
        k = 0;
        rotateTimer = Date.now();
        isRotating = "animation"
    }
    if(isRotating == "animation"){
        if(k < 4){
            if(Date.now() - rotateTimer > rotateSpeed/4){
                pos.drawX += animationDt.dx/4;
                pos.drawY += animationDt.dy/4;
                rotateTimer = Date.now();
                pos.drawsub += rotateManage/4;
                k++;
                if(drawMainPuyo == true){
                    render();
                }
            }
        }else{
            pos.drawX = pos.x;
            pos.drawY = pos.y;
            pos.drawsub = pos.sub;
            isRotating = false;
        }

    }
    //console.log(k);
    //console.log(isRotating);
    requestAnimationFrame(mainroop);
}
allpuyo.onload = () => { //ぷよスプライトシートが読み込まれてから
    newgame(); //ゲーム自動開始
    requestAnimationFrame(mainroop); //メインループ開始

}


