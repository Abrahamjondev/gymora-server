import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AIAnalyze } from '../../libs/dto/ai/ai';
import { Message } from '../../libs/enums/common.enum';

interface FoodResult {
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
		const apiKey = this.configService.get<string>('GROQ_API_KEY');
		if (!apiKey) throw new BadRequestException('GROQ_API_KEY is not configured');

		// Use groq vision-capable model
		const model = 'meta-llama/llama-4-scout-17b-16e-instruct';
		const base64Image = imageBuffer.toString('base64');
		const dataUrl = `data:${mimetype};base64,${base64Image}`;

		const prompt =
			'Analyze this food image. Return ONLY valid JSON (no markdown, no extra text) with this shape: ' +
			'{"foodName":"","estimatedCalories":0,"protein":0,"carbs":0,"fats":0}. ' +
			'Use grams for macros. Be specific about the food name.';

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'image_url', image_url: { url: dataUrl } },
							{ type: 'text', text: prompt },
						],
					},
				],
				temperature: 0.1,
				max_tokens: 256,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('GROQ vision error:', errorText);
			throw new InternalServerErrorException(`Food analysis failed: ${response.statusText}`);
		}

		const data = await response.json();
		const rawText: string = data?.choices?.[0]?.message?.content ?? '';
		const parsed = this.parseFoodAnalysis(rawText);

		return await this.aiAnalyzeModel.create({
			memberId,
			imageUrl,
			foodName: parsed.foodName,
			estimatedCalories: parsed.estimatedCalories,
			protein: parsed.protein,
			carbs: parsed.carbs,
			fats: parsed.fats,
			aiProvider: `GROQ:${model}`,
			aiRawResult: rawText,
		});
	}

	public async getAIAnalyzeHistory(memberId: string): Promise<AIAnalyze[]> {
		return await this.aiAnalyzeModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}

	private parseFoodAnalysis(rawText: string): FoodResult {
		try {
			const cleanText = rawText.replace(/```json|```/g, '').trim();
			// Extract JSON object if surrounded by other text
			const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
			const jsonStr = jsonMatch ? jsonMatch[0] : cleanText;
			const result = JSON.parse(jsonStr);
			return {
				foodName: String(result.foodName ?? 'Unknown food'),
				estimatedCalories: Number(result.estimatedCalories ?? 0),
				protein: Number(result.protein ?? 0),
				carbs: Number(result.carbs ?? 0),
				fats: Number(result.fats ?? 0),
			};
		} catch (err) {
			console.log('Food JSON parse error, raw:', rawText);
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}
	}
}
