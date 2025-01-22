import { Star } from "lucide-react";
export default function Logo() {
  return (
    <div className="text-nowrap flex items-center gap-2">
      <Star
        className="size-5 text-sky-300"
        absoluteStrokeWidth={false}
        strokeWidth={3}
      />{" "}
      PDF-Anki
    </div>
  );
}
