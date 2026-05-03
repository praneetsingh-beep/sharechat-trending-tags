/**
 * Lightweight fake feed cards shown below the trending rail to give the
 * prototype context — so the rail looks like part of a real social feed,
 * not a standalone widget. These are intentionally low-fi placeholders.
 */
export function MockFeedCard({ idx }: { idx: number }) {
  const seed = MOCK_POSTS[idx % MOCK_POSTS.length];
  return (
    <article className="px-4 py-3 border-b border-sc-border/60">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sc-accent2 to-sc-accent" />
        <div className="flex-1">
          <div className="font-hindi text-sm font-semibold">{seed.author}</div>
          <div className="text-[10px] text-sc-mute">{seed.time}</div>
        </div>
        <button aria-label="More" className="text-sc-mute text-xl leading-none">⋯</button>
      </div>
      <p className="font-hindi text-[15px] leading-relaxed text-sc-text">{seed.text}</p>
      <div className={`mt-2 h-44 rounded-xl bg-gradient-to-br ${seed.gradient}`} />
      <div className="flex items-center gap-5 mt-3 text-sc-mute text-xs">
        <span>❤️ {seed.likes}</span>
        <span>💬 {seed.comments}</span>
        <span>↗️ शेयर</span>
      </div>
    </article>
  );
}

const MOCK_POSTS = [
  {
    author: 'रोहित यादव',
    time: '15 मिनट पहले',
    text: 'आज मौसम कितना बढ़िया है यार ☀️ चाय की तलब हो रही है ☕',
    likes: '2.1K', comments: '128',
    gradient: 'from-amber-500 via-orange-600 to-rose-700'
  },
  {
    author: 'प्रिया शर्मा',
    time: '1 घंटा पहले',
    text: 'रील देख के हंस-हंस के पेट दुख गया 😂 #relatable',
    likes: '8.4K', comments: '512',
    gradient: 'from-fuchsia-500 via-purple-600 to-indigo-800'
  },
  {
    author: 'अमित वर्मा',
    time: '2 घंटे पहले',
    text: 'आज की जीत के लिए टीम इंडिया को बधाई 🇮🇳🏏',
    likes: '15K', comments: '1.2K',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-800'
  },
  {
    author: 'नेहा सिंह',
    time: '3 घंटे पहले',
    text: 'सुबह-सुबह की सैर का अपना ही मज़ा है 🌅',
    likes: '964', comments: '78',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700'
  }
];
