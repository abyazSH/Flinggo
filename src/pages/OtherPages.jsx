export function ChatPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">💬 Chat AI</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">🤖</span>
          <p className="text-base font-medium">Flingo AI siap membantu</p>
          <p className="text-sm text-base-content/50 max-w-xs">
            Ketik kalimat dalam bahasa apapun. Flingo akan mendeteksi bahasa dan membalas secara natural.
          </p>
          <button className="btn btn-primary btn-sm mt-2">Mulai chat</button>
        </div>
      </div>
    </div>
  );
}

export function QuizPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">🃏 Kuis kosakata</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">🃏</span>
          <p className="text-base font-medium">Pilih bahasa untuk mulai kuis</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {["🇬🇧 Inggris","🇪🇸 Spanyol","🇫🇷 Prancis","🇲🇾 Melayu"].map(l => (
              <button key={l} className="btn btn-outline btn-sm">{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SentencePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">✍️ Susun kalimat</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">✍️</span>
          <p className="text-base font-medium">Susun kata menjadi kalimat yang benar</p>
          <p className="text-sm text-base-content/50 max-w-xs">
            Drag dan drop kata-kata untuk membentuk kalimat yang tepat dalam bahasa target.
          </p>
          <button className="btn btn-primary btn-sm mt-2">Mulai latihan</button>
        </div>
      </div>
    </div>
  );
}

export function ChallengePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">📅 Tantangan harian</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">🏅</span>
          <p className="text-base font-medium">Tantangan hari ini sudah tersedia</p>
          <p className="text-sm text-base-content/50 max-w-xs">
            Selesaikan tantangan harian dan pertahankan streak kamu untuk mendapatkan bonus poin.
          </p>
          <button className="btn btn-warning btn-sm mt-2">Lihat tantangan</button>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">🏆 Leaderboard</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">🏆</span>
          <p className="text-base font-medium">Halaman leaderboard lengkap</p>
          <p className="text-sm text-base-content/50">Coming soon — halaman ini sedang dikembangkan.</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">📊 Progres saya</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16 gap-3">
          <span className="text-5xl">📊</span>
          <p className="text-base font-medium">Analitik belajar kamu</p>
          <p className="text-sm text-base-content/50">Coming soon — halaman ini sedang dikembangkan.</p>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">⚙️ Pengaturan</h1>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Nama tampilan</span></label>
            <input type="text" defaultValue="M. Abyaz" className="input input-bordered input-sm" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Bahasa antarmuka</span></label>
            <select className="select select-bordered select-sm">
              <option>Bahasa Indonesia</option>
              <option>English</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-sm">Notifikasi tantangan harian</span>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm" />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-sm">Pengingat streak</span>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm" />
            </label>
          </div>
          <button className="btn btn-primary btn-sm w-fit">Simpan perubahan</button>
        </div>
      </div>
    </div>
  );
}
