import PageHeader from '../../components/ui/PageHeader';

export default function MarketplaceControl() {
  return (
    <>
      <PageHeader
        title="Marketplace Control"
        subtitle="Manage listings, approvals, and marketplace activity."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm">
        <p className="text-sm text-muted">Marketplace moderation tools go here.</p>
      </div>
    </>
  );
}
