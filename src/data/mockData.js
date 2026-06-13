export const statsData = [
  { label: "Streak aktif",   value: "5 hari",  delta: "+1 dari kemarin",  trend: "up",   icon: "🔥" },
  { label: "Total poin",     value: "2.780",   delta: "+340 minggu ini",  trend: "up",   icon: "⭐" },
  { label: "Akurasi kuis",   value: "87%",     delta: "+4% dari kemarin", trend: "up",   icon: "🎯" },
  { label: "Sesi belajar",   value: "48",      delta: "+6 minggu ini",    trend: "up",   icon: "📚" },
];

export const languageProgress = [
  { flag: "🇮🇩", name: "Indonesia", pct: 100, color: "bg-primary"   },
  { flag: "🇬🇧", name: "Inggris",   pct: 90,  color: "bg-primary"   },
  { flag: "🇪🇸", name: "Spanyol",   pct: 60,  color: "bg-warning"   },
  { flag: "🇫🇷", name: "Prancis",   pct: 35,  color: "bg-error"     },
  { flag: "🇲🇾", name: "Melayu",    pct: 25,  color: "bg-secondary" },
];

export const activityLog = [
  { icon: "🃏", label: "Kuis kosakata Spanyol",    sub: "Skor 80/100",             time: "09:14" },
  { icon: "✍️", label: "Susun kalimat Prancis",    sub: "5 kalimat benar",         time: "08:45" },
  { icon: "💬", label: "Chat dengan Flingo AI",    sub: "3 terjemahan berhasil",   time: "08:12" },
  { icon: "🏆", label: "Tantangan harian selesai", sub: "+100 poin didapat",        time: "07:50" },
];

export const weeklyActivity = [
  { day: "Sen", val: 30 },
  { day: "Sel", val: 55 },
  { day: "Rab", val: 40 },
  { day: "Kam", val: 70 },
  { day: "Jum", val: 85 },
  { day: "Sab", val: 60 },
  { day: "Min", val: 90 },
];

export const dailyChallenge = {
  question: 'Apa arti "Buenos días" dalam bahasa Indonesia?',
  lang: "Spanyol → Indonesia",
  options: ["Selamat malam", "Selamat pagi", "Sampai jumpa", "Selamat siang"],
  answer: 1,
};

export const leaderboard = [
  { rank: 1, initials: "AR", name: "Arya Ramadhan",  pts: 4280, streak: 12, color: "bg-warning text-warning-content"   },
  { rank: 2, initials: "SD", name: "Siti Dewi",       pts: 3915, streak: 9,  color: "bg-base-300 text-base-content"     },
  { rank: 3, initials: "BK", name: "Budi Kurniawan",  pts: 3540, streak: 7,  color: "bg-secondary text-secondary-content"},
  { rank: 4, initials: "NF", name: "Nurul Fitri",     pts: 3120, streak: 5,  color: "bg-base-200 text-base-content"     },
  { rank: 5, initials: "MA", name: "M. Abyaz (Kamu)", pts: 2780, streak: 5,  color: "bg-primary text-primary-content",  isMe: true },
];
