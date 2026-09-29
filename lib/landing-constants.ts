import { sampleIds } from '@/data/sample-ids'

export const SAMPLE_CASE_PATH = `/case/${sampleIds.game}`

export const GUIDE_STEPS = [
	{
		num: '01',
		title: 'Read the clues',
		body:
			'Examine statements, evidence, and suspicious details.',
	},
	{
		num: '02',
		title: 'Connect the dots',
		body:
			'Build your own Detective Board and test possible relationships.',
	},
	{
		num: '03',
		title: 'Make your deductions',
		body:
			'Eliminate impossible possibilities until the truth becomes clear.',
	},
	{
		num: '04',
		title: 'Solve the case',
		body: 'Accuse the murderer and reveal what really happened.',
	},
] as const
