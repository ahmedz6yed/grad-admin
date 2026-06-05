import PageHeader from '../../components/ui/PageHeader';

export default function ResolveIssues() {
  return (
    <>
      <PageHeader
        title="Resolve Issues"
        subtitle="Review and resolve reported issues across the platform."
      />

      <div className="pb-12">
        {/* Content will go here */}
        <div className="flex h-64 items-center justify-center rounded-2xl border border-white/40 bg-white/30 backdrop-blur-sm">
          <p className="text-text-muted text-lg font-josefin">
            No issues to resolve at this time.
          </p>
        </div>
      </div>
    </>
  );
}
