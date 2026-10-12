import GVPLoadingSpinner from "@/components/GVPLoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-[65vh] w-full flex items-center justify-center">
      <GVPLoadingSpinner
        size="lg"
        message="Loading GVPIHLR Portal..."
        subtext="Gayatri Vidya Parishad Institute of Higher Learning and Research"
      />
    </div>
  );
}
