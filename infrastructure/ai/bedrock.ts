import {
	BedrockRuntimeClient,
	ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SYSTEM_PROMPT = readFileSync(
	resolve(process.cwd(), 'infrastructure/ai/system_prompt.md'),
	'utf-8',
)

const client = new BedrockRuntimeClient({
	region: process.env.AWS_REGION ?? 'ap-southeast-1',
})

export async function askBedrock(prompt: string) {
	const command = new ConverseCommand({
		modelId: process.env.BEDROCK_MODEL_ID ?? 'global.amazon.nova-2-lite-v1:0',
		system: [{ text: SYSTEM_PROMPT }],
		messages: [
			{
				role: 'user',
				content: [{ text: prompt }],
			},
		],
		inferenceConfig: {
			maxTokens: 4096,
			temperature: 0.7,
		},
	})

	const response = await client.send(command)

	return response.output?.message?.content?.[0]?.text ?? ''
}
