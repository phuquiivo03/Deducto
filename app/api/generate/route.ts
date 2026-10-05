import { NextRequest } from 'next/server'

import {
	generateRequestSchema,
	type IGeneratedCase,
} from '@/features/game/game.schemas'
import gameServices from '@/features/game/game.services'
import { getSessionUserId } from '@/features/user/user.auth'
import { AppResponse } from '@/features/type'
import { publicApiFailure } from '@/lib/public-api-error'

export async function POST(req: NextRequest) {
	const sessionUserId = await getSessionUserId()
	if (!sessionUserId) {
		const response: AppResponse<null> = {
			data: null,
			success: false,
			message: 'Sign in required',
		}
		return Response.json(response, { status: 401 })
	}

	try {
		const body = await req.json()
		const parseResult = generateRequestSchema.safeParse(body)
		if (!parseResult.success) {
			const response = publicApiFailure(
				'POST /api/generate',
				parseResult.error,
				'Invalid request',
				null,
			)
			return Response.json(response, { status: 400 })
		}

		const generated = await gameServices.generate(
			parseResult.data.prompt,
			parseResult.data.level,
			sessionUserId,
		)

		const response: AppResponse<IGeneratedCase> = {
			data: generated,
			success: true,
			message: null,
		}
		return Response.json(response, { status: 200 })
	} catch (e) {
		const response: AppResponse<null> = publicApiFailure(
			'POST /api/generate',
			e,
			'Could not generate a case',
			null,
		)
		return Response.json(response, { status: 400 })
	}
}
