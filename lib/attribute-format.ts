/**
 * Convert an attribute key into a human-readable phrase.
 *
 * Example:
 * "handedness" -> "right-handed"
 * "hairColor"  -> "black hair"
 * "height"     -> "168 cm tall"
 */
export const formatAttributeValue = (
	attribute: string,
	value: string,
): string => {
	switch (attribute) {
		case 'handedness':
			return value === 'LEFT'
				? 'left-handed'
				: value === 'RIGHT'
					? 'right-handed'
					: value

		case 'hairColor':
			return `${value} hair`

		case 'height':
			return `${value} cm tall`

		case 'birthday':
			return `born on ${value}`

		default:
			return value
	}
}

/**
 * Convert an attribute key into a human-readable noun.
 */
export const formatAttributeName = (attribute: string): string => {
	switch (attribute) {
		case 'handedness':
			return 'handedness'

		case 'hairColor':
			return 'hair color'

		case 'height':
			return 'height'

		case 'birthday':
			return 'birthday'

		case 'weight':
			return 'weight'

		case 'material':
			return 'material'

		case 'type':
			return 'type'

		case 'found_at':
			return 'location'

		case 'weapon':
			return 'weapon'

		case 'location':
			return 'location'

		case 'motive':
			return 'motive'

		default:
			return attribute
				.replace(/([A-Z])/g, ' $1')
				.replace(/^./, (char) => char.toLowerCase())
	}
}
