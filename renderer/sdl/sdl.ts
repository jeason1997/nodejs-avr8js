import sdl from '@kmamal/sdl'

export class Color {
	r: number = 0
	g: number = 0
	b: number = 0
	a: number = 0

	constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}

	static red: Color = new Color(255, 0, 0)
	static green: Color = new Color(0, 255, 0)
	static blue: Color = new Color(0, 0, 255)
	static white: Color = new Color(255, 255, 255)
	static black: Color = new Color(0, 0, 0)
	static gray: Color = new Color(128, 128, 128)
}

class SDLImageData implements ImageData {
	colorSpace: PredefinedColorSpace = 'srgb'
	data: Uint8ClampedArray<ArrayBufferLike>
	height: number
	width: number
    
	constructor(width: number, height: number) {
		this.data = new Uint8ClampedArray(width * height * 4);
		this.height = height;
		this.width = width;
	}
}

export class SDL_Renderer {
	public imageData!: SDLImageData
	private window!: sdl.Sdl.Video.Window
	private buffer!: Buffer

	private windowScale = 1
	private windowWidth = 1
	private windowHeight = 1
	private scaleLineWidth = 0
	private windowRealWidth = 1
	private windowRealHeight = 1
	private stride = 1

	init(width: number = 128, height: number = 64, scale: number = 1, scaleLineWidth: number = 0) {
		this.windowWidth = width
		this.windowHeight = height
		this.windowScale = scale
		this.windowRealWidth = this.windowWidth * this.windowScale
		this.windowRealHeight = this.windowHeight * this.windowScale
		this.scaleLineWidth = scaleLineWidth
		this.stride = this.windowRealWidth * 4

		this.window = sdl.video.createWindow({
			width: this.windowRealWidth,
			height: this.windowRealHeight,
			title: 'AVR8JS',
		})
		this.buffer = Buffer.alloc(this.stride * this.windowRealHeight)
		this.imageData = new SDLImageData(this.windowWidth, this.windowHeight)
	}

	setColor(offset: number, color: Color) {
		this.buffer[offset] = color.r
		this.buffer[offset + 1] = color.g
		this.buffer[offset + 2] = color.b
		this.buffer[offset + 3] = color.a
	}

	redraw() {
		for (let y = 0; y < this.windowHeight; y++) {
			for (let x = 0; x < this.windowWidth; x++) {
				// 将imageData转为Color
				let color: Color = {
					r: this.imageData.data[(y * this.windowWidth + x) * 4],
					g: this.imageData.data[(y * this.windowWidth + x) * 4 + 1],
					b: this.imageData.data[(y * this.windowWidth + x) * 4 + 2],
					a: 255
					//a: this.imageData.data[(y * this.windowRealWidth + x) * 4 + 3],
				}

				let offset = x * 4 * this.windowScale + y * this.windowRealWidth * 4 * this.windowScale
				for (let i = 0; i < this.windowScale; i++) {
					for (let j = 0; j < this.windowScale; j++) {
						// 扫描线
						if (i < this.scaleLineWidth || j < this.scaleLineWidth) {
							this.setColor(offset + i * this.stride + j * 4, Color.black)
						}
						else {
							this.setColor(offset + i * this.stride + j * 4, color)
						}
					}
				}
			}
		}

		this.window.render(this.windowRealWidth, this.windowRealHeight, this.stride, 'rgba32', this.buffer)
	}
}