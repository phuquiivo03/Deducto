import Card from "./Card";

export default function IntroCard({
  start,
  disabled = false,
}: {
  start: () => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <span className="inline-block text-xs font-bold text-gold bg-goldBg px-3 py-1 rounded-full mb-3">
        Case #024
      </span>

      <h1
        className="
font-serif
text-3xl
mb-2
"
      >
        The Midnight Murder
      </h1>

      <p className="text-sm text-soft mb-4">
        A body was found at 11:42 PM inside the old Raven mansion.
      </p>

      <p
        className="
text-sm
leading-relaxed
mb-5
"
      >
        Jonathan Raven was discovered in his study after dinner party. Three
        guests remained.
      </p>

      <div
        className="
border-t border-line
pt-4
flex justify-between
"
      >
        <span>Victim</span>
        <b className="font-serif">Jonathan Raven</b>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={disabled}
        className="
w-full
mt-5
bg-ink
text-paper
rounded-xl
py-4
font-bold
disabled:opacity-50
disabled:cursor-not-allowed
"
      >
        Start investigation
      </button>
    </Card>
  );
}
