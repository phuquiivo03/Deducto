import type { DraftSolvabilityResult } from '@/features/game/case-solver'

const MAX_DETAIL = 120

function trimDetail(text: string): string {
	if (text.length <= MAX_DETAIL) {
		return text
	}
	return `${text.slice(0, MAX_DETAIL - 1)}…`
}

/**
 * User-facing solvability copy for the create-game editor (Vietnamese).
 */
export function solvabilityMessageVi(
	result: DraftSolvabilityResult,
): string | null {
	if (result.status === 'valid') {
		return null
	}
	if (result.status === 'invalid') {
		const detail = result.issues[0]
		if (detail) {
			return `Manh mối không hợp lệ: ${trimDetail(detail)}`
		}
		return 'Manh mối không hợp lệ hoặc tham chiếu sai thực thể.'
	}
	if (result.status === 'none') {
		const detail = result.issues[0]
		if (detail) {
			return `Bộ manh mối không có nghiệm: ${trimDetail(detail)}`
		}
		return 'Bộ manh mối không có nghiệm — không ai khớp đủ bốn ô đáp án.'
	}
	if (result.status === 'ambiguous') {
		return 'Manh mối cho phép nhiều hơn một đáp án. Hãy thêm hoặc sửa manh mối.'
	}
	if (result.status === 'mismatch') {
		return 'Phần Đáp án không khớp với nghiệm duy nhất mà manh mối ép ra.'
	}
	return 'Vụ án chưa sẵn sàng để tạo.'
}

export const SOLVABILITY_OK_VI =
	'Logic hợp lệ: manh mối chỉ ra đúng một đáp án và khớp phần Đáp án.'
