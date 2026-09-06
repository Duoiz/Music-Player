import { create } from 'zustand'
import { getSpectrumData } from '../services/api'
import type { SpectrumEnvelope } from '../types'

export interface DecodedEnvelope {
	fps: number
	bands: number
	duration: number
	totalFrames: number
	data: number[] // 0-255 uint8 values in a flat array
}

interface SpectrumStore {
	currentEnvelope: DecodedEnvelope | null
	isLoading: boolean
	error: string | null
	cache: Record<string, DecodedEnvelope>

	loadSpectrum: (trackId: string) => Promise<DecodedEnvelope | null>
	clearSpectrum: () => void
}

/**
 * Fast, resilient base64 to byte array decoder that works in Hermes, React Native, and Node.
 */
function decodeBase64ToNumbers(b64: string): number[] {
	let binaryStr = ''
	if (typeof atob === 'function') {
		binaryStr = atob(b64)
	} else if (typeof Buffer !== 'undefined') {
		binaryStr = Buffer.from(b64, 'base64').toString('binary')
	} else {
		// Pure JS fallback lookup
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
		const lookup = new Uint8Array(256)
		for (let i = 0; i < chars.length; i++) {
			lookup[chars.charCodeAt(i)] = i
		}

		let buffer = 0
		let bits = 0
		const out: number[] = []
		for (let i = 0; i < b64.length; i++) {
			const c = b64.charCodeAt(i)
			if (c === 61) break // '='
			const val = lookup[c]
			if (val === undefined) continue
			buffer = (buffer << 6) | val
			bits += 6
			if (bits >= 8) {
				bits -= 8
				out.push((buffer >> bits) & 0xff)
			}
		}
		return out
	}

	const len = binaryStr.length
	const out = new Array(len)
	for (let i = 0; i < len; i++) {
		out[i] = binaryStr.charCodeAt(i)
	}
	return out
}

export const useSpectrumStore = create<SpectrumStore>((set, get) => ({
	currentEnvelope: null,
	isLoading: false,
	error: null,
	cache: {},

	loadSpectrum: async (trackId: string) => {
		if (!trackId) return null

		// 1. Check in-memory store cache
		const existing = get().cache[trackId]
		if (existing) {
			set({ currentEnvelope: existing, error: null })
			return existing
		}

		set({ isLoading: true, error: null })

		try {
			const envelopeData: SpectrumEnvelope = await getSpectrumData(trackId)
			const decodedNumbers = decodeBase64ToNumbers(envelopeData.envelope)

			const decoded: DecodedEnvelope = {
				fps: envelopeData.fps,
				bands: envelopeData.bands,
				duration: envelopeData.duration,
				totalFrames: envelopeData.totalFrames,
				data: decodedNumbers,
			}

			set((state) => ({
				currentEnvelope: decoded,
				isLoading: false,
				cache: {
					...state.cache,
					[trackId]: decoded,
				},
			}))

			return decoded
		} catch (err: any) {
			console.warn('[SpectrumStore] Failed to load spectrum for track:', trackId, err.message)
			set({ isLoading: false, error: err.message })
			return null
		}
	},

	clearSpectrum: () => {
		set({ currentEnvelope: null, error: null, isLoading: false })
	},
}))
