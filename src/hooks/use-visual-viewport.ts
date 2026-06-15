import { useEffect, useState } from 'react';

interface VisualViewportState {
  height: number;
  offsetTop: number;
}

function readViewport(): VisualViewportState {
  const vv = window.visualViewport;
  if (!vv) {
    return { height: window.innerHeight, offsetTop: 0 };
  }
  return { height: vv.height, offsetTop: vv.offsetTop };
}

/** Track the mobile visual viewport so fixed overlays stay above the keyboard. */
export function useVisualViewport(enabled: boolean): VisualViewportState {
  const [viewport, setViewport] = useState<VisualViewportState>(() =>
    typeof window !== 'undefined' ? readViewport() : { height: 0, offsetTop: 0 }
  );

  useEffect(() => {
    if (!enabled) return;

    const vv = window.visualViewport;
    const update = () => setViewport(readViewport());

    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return viewport;
}