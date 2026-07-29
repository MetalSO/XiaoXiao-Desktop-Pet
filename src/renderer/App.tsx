import { useEffect, useMemo, useState, type ReactElement } from 'react';
import type { PetConfig } from '../shared/types';
import { SpeechBubble } from './components/SpeechBubble';
import { PetCanvas } from './pet/PetCanvas';
import { petManifest } from './pet/petManifest';

const fallbackConfig: PetConfig = {
  scale: 1,
  alwaysOnTop: true
};

export function App(): ReactElement {
  const [config, setConfig] = useState<PetConfig>(fallbackConfig);
  const [bubble, setBubble] = useState('');

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    window.desktopPet?.getConfig().then(setConfig).catch(() => setConfig(fallbackConfig));
    cleanup = window.desktopPet?.onConfigChanged(setConfig);

    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (!bubble) {
      return;
    }

    const timer = window.setTimeout(() => setBubble(''), 3200);
    return () => window.clearTimeout(timer);
  }, [bubble]);

  const lines = useMemo(() => petManifest.bubbleLines, []);

  function speak(line?: string): void {
    const nextLine = line ?? lines[Math.floor(Math.random() * lines.length)];
    setBubble(nextLine);
  }

  function handleContextMenu(event: React.MouseEvent): void {
    event.preventDefault();
    window.desktopPet?.showContextMenu();
  }

  return (
    <main className="app-shell" onContextMenu={handleContextMenu}>
      <SpeechBubble text={bubble} petName={petManifest.name} />
      <PetCanvas config={config} manifest={petManifest} onSpeak={speak} />
    </main>
  );
}
