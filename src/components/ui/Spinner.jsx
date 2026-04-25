import { LoaderOne } from "@/components/ui/loader";

export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-surface">
      <LoaderOne size="md" label="Loading..." />
    </div>
  );
}

