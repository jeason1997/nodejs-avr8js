import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

// 创建一个800x600的画布
const canvas = createCanvas(600, 600);
const ctx = canvas.getContext('2d');

// 填充背景
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 绘制红色矩形
ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 100, 100);

//ctx.putImageData(canvas.getImageData(50, 50, 100, 100), 0, 0);

// 保存为PNG文件
const buffer = canvas.toBuffer('image/png');
writeFileSync('./output.png', buffer);