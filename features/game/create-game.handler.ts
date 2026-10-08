import {
	createGameInputSchema,
	type ICreateGameInput,
} from '@/features/game/game.schemas'
import { puzzleLockPublicMessage } from '@/features/puzzles/build-case-puzzles'
import type { AppResponse } from '@/features/type'
import { publicApiFailure } from '@/lib/public-api-error'

export interface CreateGameHandlerDeps {
	getSessionUserId: () => Promise<string | null>
	createGame: (
		input: ICreateGameInput,
		creatorId: string,
	) => Promise<string>
}

/**
 * POST /api/game.
 * Locks are `{ clueId, kind }` only. The service builds the cipher.
 */
export async function handleCreateGamePost (
	request: Request,
	deps: CreateGameHandlerDeps,
): Promise<Response> {
	const sessionUserId = await deps.getSessionUserId()
	if (!sessionUserId) {
		const response: AppResponse<null> = {
			data: null,
			success: false,
			message: 'Sign in required',
		}
		return Response.json(response, { status: 401 })
	}

	try {
		const body = await request.json()
		const parseResult = createGameInputSchema.safeParse(body)
		if (!parseResult.success) {
			const response: AppResponse<null> = publicApiFailure(
				'POST /api/game',
				parseResult.error,
				'Invalid request',
				null,
			)
			return Response.json(response, { status: 400 })
		}

		const id = await deps.createGame(parseResult.data, sessionUserId)
		const response: AppResponse<{ id: string }> = {
			data: { id },
			success: true,
			message: null,
		}
		return Response.json(response, { status: 201 })
	} catch (error) {
		const lockMessage = puzzleLockPublicMessage(error)
		if (lockMessage) {
			const response: AppResponse<null> = {
				data: null,
				success: false,
				message: lockMessage,
			}
			return Response.json(response, { status: 400 })
		}
		const response: AppResponse<null> = publicApiFailure(
			'POST /api/game',
			error,
			'Không thể tạo trò chơi',
			null,
		)
		return Response.json(response, { status: 500 })
	}
}
