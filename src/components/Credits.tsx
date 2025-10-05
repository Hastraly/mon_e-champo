import { Heart, Code, Coffee, Github } from 'lucide-react';

export default function Credits() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Crédits
          </h2>
          <p className="text-slate-600">
            Cette application a été créée avec passion!
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Développement</h3>
                <p className="text-slate-600">Conçu et développé par</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  H
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">Kélian</p>
                  <p className="text-sm text-slate-600">Développeur Full-Stack</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              Remerciements
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Un grand merci à <span className="font-bold text-blue-600">Hastaly</span> pour avoir
              créé cette application d'emploi du temps et de gestion de tâches. Son travail acharné
              et sa passion pour le développement web ont permis de créer cet outil intuitif et élégant.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800">Technologies utilisées</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700">React</p>
                <p className="text-xs text-slate-500">Interface utilisateur</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700">TypeScript</p>
                <p className="text-xs text-slate-500">Typage statique</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700">Tailwind CSS</p>
                <p className="text-xs text-slate-500">Design moderne</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700">Supabase</p>
                <p className="text-xs text-slate-500">Base de données</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white text-center space-y-3">
            <Heart className="w-8 h-8 mx-auto" />
            <p className="font-medium">
              Fait avec amour pour vous aider à mieux organiser votre vie
            </p>
            <p className="text-sm text-blue-100">
              Version 1.0.0 - 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
