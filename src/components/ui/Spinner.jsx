import { LoaderOne } from "@/components/ui/loader";

export default function Spinner() {
  return (
    <div
      className="flex justify-center items-center h-screen w-full"
      style={{ background: "var(--loading-bg,#ffffff)", color: "var(--loading-fg,#111111)" }}
    >
      <LoaderOne size="md" label="Loading..." />
    </div>
  );
}
