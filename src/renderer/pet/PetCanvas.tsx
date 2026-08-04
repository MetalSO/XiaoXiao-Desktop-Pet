import { useEffect, useRef, type ReactElement } from 'react';
import 'pixi.js/unsafe-eval';
import { Application, Assets, Container, Sprite } from 'pixi.js';
import type { PetConfig, PetManifest, PointerScreenPoint } from '../../shared/types';
import {
  getPetPose,
  isClickAnimating,
  isTimedActionActive,
  type IdleAction,
  type TimedAction
} from './petAnimator';

type PetCanvasProps = {
  config: PetConfig;
  manifest: PetManifest;
  onSpeak: (line?: string) => void;
};

const BASE_DISPLAY_HEIGHT = 420;
const BOTTOM_PADDING = 18;
const CLICK_MOVE_LIMIT = 6;

export function PetCanvas({ config, manifest, onSpeak }: PetCanvasProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef(config);
  const onSpeakRef = useRef(onSpeak);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    onSpeakRef.current = onSpeak;
  }, [onSpeak]);

  useEffect(() => {
    const hostElement = hostRef.current;

    if (!hostElement) {
      return;
    }

    const host = hostElement;
    let destroyed = false;
    let app: Application | null = null;
    let petContainer: Container | null = null;
    let sprite: Sprite | null = null;
    let startTime = performance.now();
    let clickStartedAt: number | null = null;
    let timedAction: TimedAction | null = null;
    let nextActionAt = performance.now() + randomBetween(7000, 12000);
    let pointerDown: {
      x: number;
      y: number;
      screen: PointerScreenPoint;
      dragging: boolean;
    } | null = null;
    let dragTilt = 0;

    async function setup(): Promise<void> {
      app = new Application();
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1
      });

      if (destroyed) {
        app.destroy();
        return;
      }

      host.appendChild(app.canvas);
      app.canvas.className = 'pet-canvas';

      const texture = await Assets.load(manifest.image);

      if (destroyed || !app) {
        return;
      }

      petContainer = new Container();
      sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      petContainer.addChild(sprite);
      app.stage.addChild(petContainer);

      sizePet();
      app.ticker.add(tick);
    }

    function sizePet(): void {
      if (!app || !sprite || !petContainer) {
        return;
      }

      const targetHeight = Math.min(app.screen.height - 86, BASE_DISPLAY_HEIGHT * configRef.current.scale);
      const baseScale = targetHeight / sprite.texture.height;
      sprite.scale.set(baseScale);
      petContainer.position.set(app.screen.width / 2, app.screen.height - BOTTOM_PADDING);
    }

    function tick(): void {
      if (!app || !petContainer) {
        return;
      }

      const now = performance.now();

      if (!isClickAnimating(now, clickStartedAt)) {
        clickStartedAt = null;
      }

      if (!isTimedActionActive(now, timedAction)) {
        timedAction = null;
      }

      if (!pointerDown && !timedAction && now >= nextActionAt) {
        timedAction = chooseTimedAction(manifest.idleActions, now);
        nextActionAt = now + randomBetween(9000, 16000);

        if (timedAction.type === 'talk') {
          onSpeakRef.current();
        }
      }

      const pose = getPetPose({
        now,
        startedAt: startTime,
        clickStartedAt,
        dragTilt,
        timedAction
      });

      petContainer.y = app.screen.height - BOTTOM_PADDING + pose.yOffset;
      petContainer.rotation = pose.rotation;
      petContainer.scale.set(pose.scaleX, pose.scaleY);
    }

    function handlePointerDown(event: PointerEvent): void {
      if (event.button !== 0) {
        return;
      }

      pointerDown = {
        x: event.clientX,
        y: event.clientY,
        screen: toScreenPoint(event),
        dragging: false
      };
      window.desktopPet?.startDrag(pointerDown.screen);
      host.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent): void {
      if (!pointerDown) {
        return;
      }

      const deltaX = event.clientX - pointerDown.x;
      const deltaY = event.clientY - pointerDown.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > CLICK_MOVE_LIMIT) {
        pointerDown.dragging = true;
      }

      if (pointerDown.dragging) {
        dragTilt = clamp(deltaX / 520, -0.13, 0.13);
        window.desktopPet?.dragMove(toScreenPoint(event));
      }
    }

    function handlePointerUp(event: PointerEvent): void {
      if (!pointerDown) {
        return;
      }

      const wasDragging = pointerDown.dragging;
      pointerDown = null;
      dragTilt = 0;
      window.desktopPet?.endDrag();

      if (!wasDragging) {
        clickStartedAt = performance.now();
        timedAction = null;
        onSpeakRef.current();
      }

      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    }

    function handlePointerCancel(event: PointerEvent): void {
      pointerDown = null;
      dragTilt = 0;
      window.desktopPet?.endDrag();

      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    }

    host.addEventListener('pointerdown', handlePointerDown);
    host.addEventListener('pointermove', handlePointerMove);
    host.addEventListener('pointerup', handlePointerUp);
    host.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('resize', sizePet);
    setup().catch((error: unknown) => {
      console.error('Pixi failed to initialize the desktop pet canvas.', error);
    });

    return () => {
      destroyed = true;
      host.removeEventListener('pointerdown', handlePointerDown);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerup', handlePointerUp);
      host.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('resize', sizePet);
      app?.destroy(true);
      petContainer = null;
      sprite = null;
      startTime = performance.now();
    };
  }, [manifest]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [config.scale]);

  return <div ref={hostRef} className="pet-host" aria-label={`${manifest.name}桌宠`} />;
}

function toScreenPoint(event: PointerEvent): PointerScreenPoint {
  return {
    screenX: event.screenX,
    screenY: event.screenY
  };
}

function chooseTimedAction(actions: IdleAction[], now: number): TimedAction {
  const action = actions[Math.floor(Math.random() * actions.length)] ?? 'nod';
  return {
    type: action,
    startedAt: now
  };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
