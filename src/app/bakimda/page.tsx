
import { Store } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 mb-8">
        <Store className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Mağazamız Bakımda
      </h1>
      <p className="mt-4 max-w-md text-base text-neutral-500">
        Daha iyi hizmet verebilmek için kısa bir süreliğine bakımdayız. Lütfen daha sonra tekrar deneyin.
      </p>
      <div className="mt-10 flex items-center justify-center gap-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-900" style={{ animationDelay: '0s' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-900" style={{ animationDelay: '0.2s' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-900" style={{ animationDelay: '0.4s' }} />
      </div>
      <div className="mt-12 text-xs font-bold uppercase tracking-widest text-neutral-300">
        LESYA STORE
      </div>
    </div>
  );
}
