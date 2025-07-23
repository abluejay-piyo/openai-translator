import { IEngine } from './interfaces'
import { IModel } from '../types'

export class LocalGemini implements IEngine {
    supportCustomModel(): boolean {
        return false
    }

    async listModels(): Promise<IModel[]> {
        return [
            {
                id: 'local-gemini-nano',
                name: 'Gemini Nano (Local)',
                description: 'Local Gemini Nano model using browser Translator API'
            }
        ]
    }

    async getModel(): Promise<string> {
        return 'local-gemini-nano'
    }

    async translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
        if (!('Translator' in self)) {
            throw new Error('Local Translator API is not supported in this browser')
        }

        let detectedSourceLanguage = sourceLanguage

        if (!detectedSourceLanguage && 'LanguageDetector' in self) {
            try {
                const detector = await (self as any).LanguageDetector.create()
                const detection = await detector.detect(text.trim())
                if (detection && detection.length > 0) {
                    detectedSourceLanguage = detection[0].detectedLanguage
                }
            } catch {
                // ignore detection errors
            }
        }

        const translatorOptions: any = { targetLanguage }
        if (detectedSourceLanguage) {
            translatorOptions.sourceLanguage = detectedSourceLanguage
        }

        const availability = await (self as any).Translator.availability(translatorOptions)
        if (availability === 'unavailable') {
            throw new Error(`Translation from ${detectedSourceLanguage || 'auto'} to ${targetLanguage} is not supported`)
        }

        const translator = await (self as any).Translator.create(translatorOptions)
        return await translator.translate(text.trim())
    }
}
