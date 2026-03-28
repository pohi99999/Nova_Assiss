import ChatInterface from "./components/ChatInterface";
import profile from "../config/profile.json";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">

      {/* Bal oldalsáv – csak desktopon */}
      <aside className="hidden md:flex md:w-72 lg:w-80 bg-white border-r border-slate-200 flex-col p-8 justify-between shrink-0" aria-label="Asszisztens információs oldalsáv">
        <div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6"
            style={{ backgroundColor: profile.accentColor }}
          >
            {profile.name[0]}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h1>
          <p className="text-sm text-slate-500 mb-1">{profile.company}</p>
          <p className="text-xs text-slate-400 mb-8">{profile.slogan}</p>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-blue-600 text-sm">🧠</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Dinamikus Emlékezet</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Megjegyzi a fontos tényeket a beszélgetésekből.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <span className="text-purple-600 text-sm">📚</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Élő Tudásbázis (RAG)</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Tölts fel fájlokat a 📎 gombbal, majd kérdezz róluk.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <span className="text-green-600 text-sm">🗣️</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Hang Interakció</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Diktálj 🎤 gombbal, hallgasd Nova hangján 🔊.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          <p>Powered by Next.js & OpenAI</p>
          <p>{profile.name} v2.1</p>
        </div>
      </aside>

      {/* Fő chat terület */}
      <main className="flex-1 p-4 md:p-6 h-full min-w-0">
        <ChatInterface />
      </main>

    </div>
  );
}
