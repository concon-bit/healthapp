const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 設定
const SOURCE_FILE = path.join(__dirname, '../public/icon.svg'); // 元になるSVG
const PUBLIC_DIR = path.join(__dirname, '../public');

// 生成する画像リスト
const TARGETS = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'favicon.ico', size: 64 }, // favicon.icoとしても使えるPNG（簡易版）
  // 必要なら他のサイズもここに追加するだけでOK
];

async function generate() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('エラー: public/icon.svg が見つかりません。');
    process.exit(1);
  }

  console.log('アイコン生成を開始します...');

  for (const target of TARGETS) {
    const outputPath = path.join(PUBLIC_DIR, target.name);
    
    await sharp(SOURCE_FILE)
      .resize(target.size, target.size)
      .png()
      .toFile(outputPath);

    console.log(`✔ 生成完了: ${target.name} (${target.size}x${target.size})`);
  }
  
  console.log('すべてのアイコンが更新されました！');
}

generate().catch(console.error);