'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-lime-400 mb-4">
          🎉 SabjiRate
        </h1>
        <p className="text-xl mb-8">GEN-Z LOCAL MARKET CALCULATOR</p>
        <div className="space-y-4">
          <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-bold mb-2">✅ App is Working!</h2>
            <p className="text-slate-400">
              The home page loaded successfully.
            </p>
          </div>
          <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-4xl">🥦 60 Vegetables</p>
            <p className="text-4xl">🍎 35 Fruits</p>
            <p className="text-4xl">🥛 15 Dairy Items</p>
            <p className="text-4xl">🧺 40 Kirana Items</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-8">
          Check the Preview Panel on the right side of the screen.
        </p>
      </div>
    </div>
  );
}
