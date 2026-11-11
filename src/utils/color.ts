interface Rgb {
	r: number
	g: number
	b: number
}

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb() and rgba(). Alpha is ignored. */
export function parseColor(input: string): Rgb | null {
	const s = input.trim().toLowerCase()
	if (s.startsWith('#')) {
		let hex = s.slice(1)
		if (hex.length === 3 || hex.length === 4) {
			hex = hex.split('').map((c) => c + c).join('')
		}
		if (hex.length !== 6 && hex.length !== 8) return null
		const n = parseInt(hex.slice(0, 6), 16)
		if (Number.isNaN(n)) return null
		return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
	}
	const m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/)
	if (!m) return null
	return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
}

function channel(v: number): number {
	const c = v / 255
	return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function luminance(color: string): number {
	const rgb = parseColor(color)
	if (!rgb) return 0
	return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/** WCAG contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
	const la = luminance(a)
	const lb = luminance(b)
	const [hi, lo] = la > lb ? [la, lb] : [lb, la]
	return (hi + 0.05) / (lo + 0.05)
}

/** Black or white, whichever reads better on the given background. */
export function readableOn(background: string): string {
	return contrastRatio('#000000', background) >= contrastRatio('#FFFFFF', background) ? '#000000' : '#FFFFFF'
}

/** Returns fg if it meets the ratio on bg, otherwise the fallback. */
export function ensureContrast(fg: string, bg: string, min: number, fallback: string): string {
	return contrastRatio(fg, bg) >= min ? fg : fallback
}
