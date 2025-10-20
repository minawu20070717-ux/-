//學習4程式碼所在
let circles = [];
let explosions = []; // 多個爆破物件
let score = 0; // 記分板

// --- 新增音效相關變數 ---
let popSound;
let soundLoaded = false; 

// 預載入音效檔案
function preload() {
    // 🔔 請將 'bubble-pop-406640.mp3' 替換為您下載的實際音效檔名 (如果名稱不同)
    popSound = loadSound('bubble-pop-406640.mp3', soundReady, soundError);
}

// 音效載入完成後會呼叫此函式
function soundReady() {
    soundLoaded = true;
    popSound.setVolume(0.5); // 將音量調低一點
    console.log("音效載入完成！");
}

// 音效載入失敗時的錯誤處理
function soundError(err) {
    console.error("音效載入失敗:", err);
}

// 處理瀏覽器音效自動播放限制：確保使用者點擊後音效才能播放，
// 並在點擊時做點擊判定與計分
function mousePressed() {
    // 確保音訊上下文在用戶互動後啟動
    userStartAudio();

    // 檢查是否點擊到任何圓，從最後一個開始以便正確處理重疊
    for (let i = circles.length - 1; i >= 0; i--) {
        let c = circles[i];
        let d = dist(mouseX, mouseY, c.x, c.y);
        if (d <= c.d / 2) {
            // 觸發爆破
            explosions.push(createExplosion(c.x, c.y, c.d));
            if (soundLoaded) popSound.play();

            // 根據顏色計分（目標色為 '#C58FAB' 加分， '#9E499D' 扣分）
            if (c.special === 'good') {
                score += 5;
            } else if (c.special === 'bad') {
                score -= 3;
            }

            // 重新生成該圓（從下方出現）
            let dNew = c.d;
            let xNew = random(width);
            let yNew = height + dNew / 2;
            let speedNew = c.speed;
            let cColor = c.c;
            let starSize = c.starSize;
            let starOffsetX = c.starOffsetX;
            let starOffsetY = c.starOffsetY;
            let explodeY = c.explodeY; // 保持爆破高度不變
            // 保持特殊屬性
            circles[i] = { x: xNew, y: yNew, d: dNew, speed: speedNew, c: cColor, starSize, starOffsetX, starOffsetY, explodeY, special: c.special };

            // 只處理第一個被點中的圓
            break;
        }
    }
}
// -----------------------

function setup() {
    createCanvas(windowWidth, windowHeight);
    // 產生 20 個圓
    for (let i = 0; i < 20; i++) {
        createCircle();
    }
    // **✨ 新增：設定文字基準點為左上角，方便定位 ✨**
    textAlign(LEFT, TOP);
}

function createCircle() {
    let d = random(30, 200); // 直徑
    let x = random(width);
    let y = random(height);
    // 速度與直徑成反比，直徑越大速度越慢
    let speed = map(d, 30, 200, 3, 0.5);
    // 粉色系隨機顏色
    let special = null;
    // 小機率產生目標色或扣分色
    let p = random();
    let c;
    if (p < 0.08) {
        // 8% 機率為加分色
        c = color('#C58FAB');
        special = 'good';
    } else if (p < 0.14) {
        // 6% 機率為扣分色
        c = color('#9E499D');
        special = 'bad';
    } else {
        let r = random(220, 255);
        let g = random(150, 200);
        let b = random(180, 230);
        c = color(r, g, b);
        c.setAlpha(random(50, 200));
    }
    // 五角星大小與圓直徑相關，且小於1/6圓直徑
    let starSize = d / 6;
    // 五角星在圓的右上角，整個星星在圓的直徑範圍內
    let starOffsetX = d / 4;
    let starOffsetY = -d / 4;
    // 隨機決定爆破高度 (雖然現在不使用自動爆破，但保留此屬性)
    let explodeY = random(height * 0.2, height * 0.7);
    circles.push({ x, y, d, speed, c, starSize, starOffsetX, starOffsetY, explodeY, special });
}

function draw() {
    background('#C58FAB'); // 淺紫色背景

    // **✅ 實現需求 2：左上角顯示學號 '414730415'**
    textSize(20);
    fill('#9E499D'); // 深紫色
    textAlign(LEFT, TOP); // 確保對齊方式為左上角
    text('414730415', 10, 10); // 畫在 (10, 10) 處
    // -------------------------

    noStroke();

    // 畫圓與五角星
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        // 若為特殊顏色，畫明顯邊框
        if (circle.special === 'good') {
            stroke(255, 220, 220, 200);
            strokeWeight(3);
        } else if (circle.special === 'bad') {
            stroke(80, 30, 80, 200);
            strokeWeight(3);
        } else {
            noStroke();
        }
        fill(circle.c);
        ellipse(circle.x, circle.y, circle.d, circle.d);
        noStroke();

        // 立體感五角星（固定位置與大小）
        let starX = circle.x + circle.starOffsetX + circle.starSize / 2;
        let starY = circle.y + circle.starOffsetY + circle.starSize / 2;
        fill(255, 255, 255, 180); // 白色半透明
        drawStar(starX, starY, circle.starSize / 2, circle.starSize / 4, 5);

        // 往上飄
        circle.y -= circle.speed;

        // ✅ 移除需求 1：移除圓圈到達爆破高度時的爆破與重生邏輯
        // if (circle.y <= circle.explodeY) {
        //     explosions.push(createExplosion(circle.x, circle.y, circle.d));
            
        //     // 播放爆破音效
        //     if (soundLoaded) {
        //         popSound.play(); 
        //     }

        //     // 重新生成圓，從視窗下方隨機位置往上飄
        //     let d = circle.d;
        //     let x = random(width);
        //     let y = height + d / 2;
        //     let speed = circle.speed;
        //     let c = circle.c;
        //     let starSize = circle.starSize;
        //     let starOffsetX = circle.starOffsetX;
        //     let starOffsetY = circle.starOffsetY;
        //     let explodeY = random(height * 0.2, height * 0.7);
        //     circles[i] = { x, y, d, speed, c, starSize, starOffsetX, starOffsetY, explodeY };
        // }

        // 新增：如果圓跑到視窗上方，從下方重生
        if (circle.y < -circle.d / 2) {
             let dNew = circle.d;
             let xNew = random(width);
             let yNew = height + dNew / 2;
             let speedNew = circle.speed;
             let cColor = circle.c;
             let starSize = circle.starSize;
             let starOffsetX = circle.starOffsetX;
             let starOffsetY = circle.starOffsetY;
             let explodeY = circle.explodeY;
             let special = circle.special;
             circles[i] = { x: xNew, y: yNew, d: dNew, speed: speedNew, c: cColor, starSize, starOffsetX, starOffsetY, explodeY, special };
        }

    }

    // 畫所有爆破動畫 (與原程式碼相同)
    for (let i = explosions.length - 1; i >= 0; i--) {
        let e = explosions[i];
        drawExplosion(e);
        e.radius += 10;
        e.alpha -= 10;
        // 更新碎片
        for (let j = 0; j < e.particles.length; j++) {
            let p = e.particles[j];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 10;
        }
        // 移除已結束的爆破
        if (e.alpha <= 0 && e.particles.every(p => p.alpha <= 0)) {
            explosions.splice(i, 1);
        }
    }

    // 顯示分數
    drawScore();
}

// 顯示分數（右上角）
function drawScore() {
    let s = 'Score: ' + score;
    textSize(24);
    
    // 設置右上角對齊
    textAlign(RIGHT, TOP);
    
    // 描邊文字（黑色描邊，白色填色）
    stroke(0, 0, 0, 80);
    strokeWeight(2);
    fill(255);
    
    // 右上角內縮 10px
    text(s, width - 10, 10);
    
    // 還原對齊 (不一定要，但為了其他元件的預期行為，最好還原)
    textAlign(LEFT, TOP);
}

// 建立爆破物件（含碎片） (與原程式碼相同)
function createExplosion(x, y, d) {
    let particles = [];
    let n = int(random(8, 16));
    for (let i = 0; i < n; i++) {
        let angle = random(TWO_PI);
        let speed = random(3, 7);
        particles.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            alpha: 255,
            size: random(d * 0.05, d * 0.12)
        });
    }
    return {
        x: x,
        y: y,
        radius: 30,
        alpha: 255,
        particles: particles
    };
}

// 畫爆破動畫（圓環+碎片） (與原程式碼相同)
function drawExplosion(e) {
    // 不畫圓環框線，只畫碎片
    noStroke();
    for (let i = 0; i < e.particles.length; i++) {
        let p = e.particles[i];
        if (p.alpha > 0) {
            fill(255, 255, 255, p.alpha);
            ellipse(p.x, p.y, p.size);
        }
    }
}

// 畫五角星的函式 (與原程式碼相同)
function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius1;
        let sy = y + sin(a) * radius1;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius2;
        sy = y + sin(a + halfAngle) * radius2;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}