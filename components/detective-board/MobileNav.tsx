interface Props {
	active: string
	setActive: (v: string) => void
}

export default function MobileNav({ active, setActive }: Props) {
	return (
		<nav
			className="
md:hidden fixed bottom-0 left-0 right-0 h-16
bg-card border-t-2 border-dashed border-erased
flex justify-around items-center
"
		>
			{['Clues', 'Board', 'Inspector'].map((item) => (
				<button
					key={item}
					type="button"
					onClick={() => setActive(item)}
					className={`
text-sm font-heading
${active === item ? 'text-pen wavy-underline' : 'text-pencil/70'}
`}
				>
					{item}
				</button>
			))}
		</nav>
	)
}
