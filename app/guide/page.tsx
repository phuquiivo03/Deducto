import type { ReactNode } from 'react'

import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'
import Card from '@/components/ui/Card'
import { DoodleSquiggle } from '@/components/ui/doodles'

export const metadata = {
	title: 'Deducto — Hướng dẫn',
	description:
		'Cách chơi Deducto, cách tạo case, và mẹo khi điều tra.',
}

function Ui ({ children }: { children: ReactNode }) {
	return (
		<strong className="font-heading text-pencil">
			{children}
		</strong>
	)
}

interface Step {
	title: string
	body: ReactNode
}

const PLAY_STEPS: Step[] = [
	{
		title: 'Chọn case',
		body: (
			<>
				Vào <Ui>Cửa hàng</Ui>, bấm một case để mở{' '}
				<Ui>Tệp case</Ui>. Cần đăng nhập Google (
				<Ui>Tiếp tục với Google</Ui>) thì mới bấm được{' '}
				<Ui>Bắt đầu điều tra</Ui>.
			</>
		),
	},
	{
		title: 'Điều tra',
		body: (
			<>
				Dựa trên các <Ui>Manh mối</Ui> đã có, nối thẻ trên{' '}
				<Ui>Bảng điều tra</Ui> (nghi phạm, địa điểm, hung khí,
				động cơ) để ghi mối quan hệ, rồi suy ra những khả năng
				có thể đã xảy ra. Bấm một thẻ thì các thẻ không liên
				quan sẽ mờ đi để dễ tập trung.
			</>
		),
	},
	{
		title: 'Giải mã',
		body: (
			<>
				Có manh mối bị khóa. Mở <Ui>Bộ giải mật mã</Ui>, rồi tự
				chọn <Ui>Caesar</Ui> (bánh xe mật mã, kéo để xoay) hay{' '}
				<Ui>Scytale</Ui> (quấn giấy quanh que). Chọn sai công
				cụ thì ra chữ vô nghĩa. Bí quá thì đọc <Ui>Gợi ý</Ui>{' '}
				của người tạo case.
			</>
		),
	},
	{
		title: 'Cáo buộc',
		body: (
			<>
				Đủ chứng cứ thì bấm <Ui>Cáo buộc</Ui>. Chọn{' '}
				<Ui>Hung thủ</Ui>, <Ui>Hung khí</Ui>,{' '}
				<Ui>Hiện trường</Ui> và <Ui>Động cơ</Ui>, rồi{' '}
				<Ui>Gửi cáo buộc</Ui>. Mỗi case chỉ có đúng một đáp án.
			</>
		),
	},
	{
		title: 'Xếp hạng',
		body: (
			<>
				Tính theo <Ui>Thời gian điều tra</Ui>, từ lúc bấm{' '}
				<Ui>Bắt đầu điều tra</Ui> tới khi giải xong. Ai nhanh
				hơn xếp trên.
			</>
		),
	},
]

const CREATE_STEPS: Step[] = [
	{
		title: 'Đăng nhập',
		body: (
			<>
				Vào <Ui>Tạo case</Ui> và đăng nhập Google (
				<Ui>Tiếp tục với Google</Ui>).
			</>
		),
	},
	{
		title: 'Soạn case',
		body: (
			<>
				Nhập <Ui>Nội dung của bạn</Ui>, chọn <Ui>Độ khó</Ui>,
				rồi bấm <Ui>Tạo case</Ui>. Sau đó sửa từng mục:{' '}
				<Ui>Tổng quan</Ui>, <Ui>Nghi phạm</Ui>,{' '}
				<Ui>Hung khí</Ui>, <Ui>Địa điểm</Ui>, <Ui>Động cơ</Ui>,{' '}
				<Ui>Manh mối</Ui>, <Ui>Đáp án</Ui>.
			</>
		),
	},
	{
		title: 'Thuộc tính',
		body: (
			<>
				Điền đủ thuộc tính có cấu trúc: nghi phạm (tay thuận,
				chiều cao, giới tính, màu tóc, ngày sinh), hung khí
				(cân nặng, loại, vật liệu), địa điểm (loại, đặc điểm).
				Mô tả tự do không dùng khi che manh mối.
			</>
		),
	},
	{
		title: 'Che bằng thuộc tính',
		body: (
			<>
				Mỗi manh mối có <Ui>Che bằng thuộc tính</Ui>, cạnh{' '}
				<Ui>Khóa mật thư</Ui>. Bật lên thì câu gốc bị giấu. Người
				chơi thấy câu thuộc tính nói vòng — ví dụ{' '}
				<Ui>Ann không sử dụng Dao lam</Ui> thành{' '}
				<Ui>Người không sử dụng Dao lam thuận tay trái</Ui> và{' '}
				<Ui>Ann là người duy nhất thuận tay trái</Ui>. Hệ thống
				chọn bộ thuộc tính nhỏ nhất để nhận ra đúng thẻ; bạn được
				thêm hoặc bớt. Bộ đó phải chỉ đúng một nghi phạm, hung khí
				hoặc địa điểm, và cả vụ án vẫn còn đúng một đáp án thì
				mới lưu được. Máy chủ kiểm tra lại. Từng câu thay thế
				vẫn khóa mật thư được.
			</>
		),
	},
	{
		title: 'Mật thư',
		body: (
			<>
				Mỗi câu người chơi thấy có <Ui>Khóa mật thư</Ui>, kể cả
				câu vừa che bằng thuộc tính. Tắt khóa thì câu hiện thẳng.
				Bật khóa thì chọn <Ui>Scytale</Ui> hoặc <Ui>Caesar</Ui>.{' '}
				<Ui>Gợi ý</Ui> là bắt buộc nhập. Hệ thống tự gắn khóa là
				bắt buộc hay tuỳ chọn khi bạn tạo vụ án.
			</>
		),
	},
	{
		title: 'Còn N khả năng',
		body: (
			<>
				Bảng <Ui>Còn N khả năng</Ui> đếm lời giải còn lại. Khi
				còn ít, danh sách hiện ra và gợi ý một thuộc tính phân
				biệt (ví dụ chỉ một người thuận tay trái). Nếu còn 0,
				dòng đỏ nêu các manh mối đang mâu thuẫn. <Ui>Tạo vụ án</Ui>{' '}
				chỉ bấm được khi còn đúng 1 khả năng, thuộc tính đã đủ,
				và câu che (nếu có) suy ra đúng manh mối gốc. Máy chủ
				kiểm tra lại lúc lưu.
			</>
		),
	},
	{
		title: 'Công khai',
		body: (
			<>
				Case mới mặc định <Ui>Private</Ui>. Vào{' '}
				<Ui>Cửa hàng</Ui> › <Ui>Các case của tôi</Ui>, bấm nhãn
				trên thẻ, rồi <Ui>Xác nhận</Ui> để chuyển sang{' '}
				<Ui>Public</Ui>.
			</>
		),
	},
]

const TIPS: string[] = [
	'Ghi chú bằng cách nối thẻ ngay trên Bảng điều tra.',
	'Đọc kỹ Gợi ý trước khi thử từng công cụ trong Bộ giải mật mã.',
	'Khi tạo case, nên cho mỗi manh mối loại trừ đúng một khả năng.',
]

function StepList ({ steps }: { steps: Step[] }) {
	return (
		<ol className="mt-5 space-y-5">
			{steps.map((step, index) => (
				<li key={step.title} className="flex gap-3">
					<span
						className="
shrink-0 w-8 font-heading text-2xl leading-none text-pen
"
						aria-hidden
					>
						{index + 1}
					</span>
					<div className="min-w-0">
						<h3 className="font-heading text-xl text-pencil">
							{step.title}
						</h3>
						<p className="mt-1 text-base leading-relaxed text-pencil/85">
							{step.body}
						</p>
					</div>
				</li>
			))}
		</ol>
	)
}

export default function GuidePage () {
	return (
		<div className="min-h-dvh bg-paper text-pencil" lang="vi">
			<Header />
			<main className="max-w-5xl mx-auto px-6 py-16 md:py-20">
				<header className="mb-10 -rotate-1">
					<h1
						className="
font-heading text-4xl md:text-5xl text-pencil
leading-tight
"
					>
						Deducto — Hướng dẫn
					</h1>
					<DoodleSquiggle className="mt-4 max-w-xs" />
				</header>

				<div className="space-y-8">
					<section aria-labelledby="cach-choi">
						<Card
							tone="postit"
							tilt="left"
							decoration="tape"
							className="mb-0"
						>
							<h2
								id="cach-choi"
								className="font-heading text-3xl text-pencil"
							>
								1. Cách chơi
							</h2>
							<StepList steps={PLAY_STEPS} />
						</Card>
					</section>

					<section aria-labelledby="cach-tao-case">
						<Card
							tone="postit"
							tilt="right"
							decoration="tack"
							className="mb-0"
						>
							<h2
								id="cach-tao-case"
								className="font-heading text-3xl text-pencil"
							>
								2. Cách tạo case
							</h2>
							<StepList steps={CREATE_STEPS} />
						</Card>
					</section>

					<section aria-labelledby="meo">
						<Card decoration="tape" className="mb-0">
							<h2
								id="meo"
								className="font-heading text-3xl text-pencil"
							>
								3. Mẹo
							</h2>
							<ul className="mt-5 space-y-3">
								{TIPS.map((tip) => (
									<li
										key={tip}
										className="
flex gap-3 text-base leading-relaxed
text-pencil/85
"
									>
										<span
											className="font-heading text-marker"
											aria-hidden
										>
											→
										</span>
										<span>{tip}</span>
									</li>
								))}
							</ul>
						</Card>
					</section>
				</div>
			</main>
			<SiteFooter />
		</div>
	)
}
