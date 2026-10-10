import { z } from 'zod'

import type { AppResponse } from '@/features/type'
import { publicApiFailure } from '@/lib/public-api-error'

import {
	updateGameVisibilitySchema,
	type GameVisibility,
} from './game-visibility'

export interface UpdateVisibilityDeps {
	getSessionUserId: () => Promise<string | null>
	updateVisibility: (
		gameId: string,
		userId: string,
		visibility: GameVisibility,
	) => Promise<boolean>
}

/**
 * PATCH /api/game/[id].
 * Only the creator can change visibility. Missing and not-owned
 * cases both answer 404.
 */
export async function handleUpdateVisibility (
	request: Request,
	gameId: string,
	deps: UpdateVisibilityDeps,
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

	const id = z.string().uuid().safeParse(gameId)
	if (!id.success) {
		return Response.json(
			publicApiFailure(
				'PATCH /api/game/[id]',
				id.error,
				'Invalid request',
				null,
			),
			{ status: 400 },
		)
	}

	let body: unknown
	try {
		body = await request.json()
	} catch (error) {
		return Response.json(
			publicApiFailure(
				'PATCH /api/game/[id]',
				error,
				'Invalid request',
				null,
			),
			{ status: 400 },
		)
	}

	const parsed = updateGameVisibilitySchema.safeParse(body)
	if (!parsed.success) {
		return Response.json(
			publicApiFailure(
				'PATCH /api/game/[id]',
				parsed.error,
				'Invalid request',
				null,
			),
			{ status: 400 },
		)
	}

	try {
		const updated = await deps.updateVisibility(
			id.data,
			sessionUserId,
			parsed.data.visibility,
		)
		if (!updated) {
			const response: AppResponse<null> = {
				data: null,
				success: false,
				message: 'Game not found',
			}
			return Response.json(response, { status: 404 })
		}
		const response: AppResponse<{ visibility: GameVisibility }> = {
			data: { visibility: parsed.data.visibility },
			success: true,
			message: null,
		}
		return Response.json(response, { status: 200 })
	} catch (error) {
		return Response.json(
			publicApiFailure(
				'PATCH /api/game/[id]',
				error,
				'Could not update this case',
				null,
			),
			{ status: 500 },
		)
	}
}
