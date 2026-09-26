import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { sampleGame, sampleResult } from '@/data/sample-be'
import { sampleIds } from '@/data/sample-ids'
import type { IGameMetadata } from '@/types/apiDto'

function isGameMetadata(
	value: string | IGameMetadata,
): value is IGameMetadata {
	return typeof value !== 'string'
}

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
	if (!isGameMetadata(sampleGame.gameMetadata)) {
		throw new Error('sampleGame.gameMetadata must be populated')
	}

	const metadata = sampleGame.gameMetadata

	await prisma.$transaction(async (tx) => {
		await tx.game.deleteMany({ where: { id: sampleGame.id } })
		await tx.gameMetadata.deleteMany({ where: { id: metadata.id } })

		await tx.gameMetadata.create({
			data: {
				id: metadata.id,
				suspects: {
					create: metadata.suspects.map((suspect) => ({
						id: suspect.id,
						name: suspect.name,
						avatar: suspect.avatar,
						age: suspect.age,
						gender: suspect.gender,
						description: suspect.description,
						attributes: suspect.attributes ?? undefined,
					})),
				},
				locations: {
					create: metadata.locations.map((location) => ({
						id: location.id,
						name: location.name,
						description: location.description,
						icon: location.icon,
						attributes: location.attributes ?? undefined,
					})),
				},
				weapons: {
					create: metadata.weapons.map((weapon) => ({
						id: weapon.id,
						name: weapon.name,
						description: weapon.description,
						icon: weapon.icon,
						attributes: weapon.attributes ?? undefined,
					})),
				},
				motives: {
					create: metadata.motives.map((motive) => ({
						id: motive.id,
						name: motive.name,
						description: motive.description,
						icon: motive.icon,
					})),
				},
				clues: {
					create: metadata.clues.map((clue) => ({
						id: clue.id,
						type: clue.type,
						attribute: clue.attribute,
						value: clue.value,
						relation: clue.relation,
						suspectId: clue.suspect_id,
						locationId: clue.location_id,
						weaponId: clue.weapon_id,
					})),
				},
			},
		})

		await tx.game.create({
			data: {
				id: sampleGame.id,
				creator: sampleGame.creator,
				title: sampleGame.title,
				description: sampleGame.description,
				banner: sampleGame.banner,
				level: sampleGame.level,
				createdAt: new Date(sampleGame.created_at),
				gameMetadataId: metadata.id,
			},
		})

		await tx.result.create({
			data: {
				id: sampleResult.id ?? sampleIds.result,
				gameId: sampleResult.game_id,
				murderId: sampleResult.anwser.murder_id,
				weaponId: sampleResult.anwser.weapon_id,
				motiveId: sampleResult.anwser.motive_id,
				locationId: sampleResult.anwser.location_id,
			},
		})
	})

	console.log('Seed completed:', sampleGame.id)
}

main()
	.catch((err) => {
		console.error(err)
		process.exitCode = 1
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
