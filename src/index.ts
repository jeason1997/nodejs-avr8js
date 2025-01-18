import { buildHex } from './shared/compile';
import { AVRRunner } from './shared/execute';
import { SSD1306Controller } from './shared/ssd1306';
import { I2CBus } from './shared/i2c-bus';
import { SDL_Renderer } from '../renderer/sdl/sdl';
import { readFile } from 'fs/promises';
import path from 'path';

let runner: AVRRunner;

function executeProgram(hex: string) {
  runner = new AVRRunner(hex);

  const cpuMillis = () => Math.round((runner.cpu.cycles / runner.frequency) * 1000);
  const i2cBus = new I2CBus(runner.twi);
  const ssd1306Controller = new SSD1306Controller(cpuMillis);
  i2cBus.registerDevice(0x3d, ssd1306Controller);

  while (true) {
    runner.execute((cpu) => {
      const time = (cpu.cycles / runner.frequency);
      console.log('Simulation time: ' + time);
      const frame = ssd1306Controller.update();
      if (frame) {
        ssd1306Controller.toImageData(sdl.imageData);
        sdl.redraw();
      }
    });
  }
}

async function compileAndRun() {
  try {
      // 读取文件内容
      console.log('Reading test code from file...');
      const code = await readFile(process.cwd() + '/example/ssd1306/ssd1306.ino', 'utf8');

      console.log('Compiling...');
      const result = await buildHex(code, [{ name: 'libraries.txt', content: 'Adafruit SSD1306' }]);
      console.log(result.stderr || result.stdout);
      
      if (result.hex) {
          console.log('\nProgram running...');
          executeProgram(result.hex);
      }
  } catch (err) {
      console.error('Error occurred:', err);
  }
}

const sdl = new SDL_Renderer();
sdl.init(128, 64, 4, 1);
compileAndRun();