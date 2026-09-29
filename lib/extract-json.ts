/**
 * Extract a JSON object string from model output (may include fences or prose).
 */
export function extractJson(text: string): string {
	let trimmed = text.trim()
	const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i)
	if (fenceMatch) {
		trimmed = fenceMatch[1].trim()
	}
	const start = trimmed.indexOf('{')
	const end = trimmed.lastIndexOf('}')
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('No JSON object found in model response')
	}
	return trimmed.slice(start, end + 1)
}
