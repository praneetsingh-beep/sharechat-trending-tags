export function FeedHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-sc-bg/85 backdrop-blur-md z-10 border-b border-sc-border/60">
      <div className="flex items-center gap-2">
        {/* logo mark */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sc-accent to-sc-accent2 flex items-center justify-center font-extrabold text-white">S</div>
        <span className="font-hindi text-lg font-extrabold tracking-tight">शेयरचैट</span>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Search" className="text-sc-mute">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" />
          </svg>
        </button>
        <button aria-label="Notifications" className="text-sc-mute">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
