import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AIAnalyze } from '../../libs/dto/ai/ai';
import { Message } from '../../libs/enums/common.enum';

interface GeminiFoodResult {
	foodName: string;
	estimatedCalories: number;
	protein: number;
	carbs: number;
	fats: number;
}

@Injectable()
export class AiService {
	constructor(
		@InjectModel('AIAnalyze') private readonly aiAnalyzeModel: Model<AIAnalyze>,
		private readonly configService: ConfigService,
	) {}

	public async analyzeFoodImage(
		memberId: string,
		imageUrl: string,
		imageBuffer: Buffer,
		mimetype: string,
	): Promise<AIAnalyze> {
		const apiKey = this.configService.get<string>('GEMINI_API_KEY');
		if (!apiKey) throw new BadRequestException('GEMINI_API_KEY is not configured');

		const model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
		const prompt = [
			'Analyze this food image.',
			'Return ONLY valid JSON with this exact shape:',
			'{"foodName":"","estimatedCalories":0,"protein":0,"carbs":0,"fats":0}',
			'Use grams for protein, carbs, and fats. Do not include markdown or explanations.',
		].join(' ');

		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': apiKey,
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								inline_data: {
									mime_type: mimetype,
									data: imageBuffer.toString('base64'),
								},
							},
							{ text: prompt },
						],
					},
				],
				generationConfig: {
					responseMimeType: 'application/json',
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new InternalServerErrorException(`Gemini food analysis failed: ${errorText}`);
		}

		const data = await response.json();
		const rawText = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).filter(Boolean).join('') ?? '';
		const parsed = this.parseFoodAnalysis(rawText);

		return await this.aiAnalyzeModel.create({
			memberId,
			imageUrl,
			foodName: parsed.foodName,
			estimatedCalories: parsed.estimatedCalories,
			protein: parsed.protein,
			carbs: parsed.carbs,
			fats: parsed.fats,
			aiProvider: `GEMINI:${model}`,
			aiRawResult: rawText,
		});
	}

	public async getAIAnalyzeHistory(memberId: string): Promise<AIAnalyze[]> {
		return await this.aiAnalyzeModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}

	private parseFoodAnalysis(rawText: string): GeminiFoodResult {
		try {
			const cleanText = rawText.replace(/```json|```/g, '').trim();
			const result = JSON.parse(cleanText);
			return {
				foodName: String(result.foodName ?? 'Unknown food'),
				estimatedCalories: Number(result.estimatedCalories ?? 0),
				protein: Number(result.protein ?? 0),
				carbs: Number(result.carbs ?? 0),
				fats: Number(result.fats ?? 0),
			};
		} catch (err) {
			console.log('Gemini JSON parse error:', err);
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}
	}
}
