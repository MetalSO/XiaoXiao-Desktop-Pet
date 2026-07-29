export type IdleAction = 'nod' | 'stretch' | 'shake' | 'talk';

export type TimedAction = {
  type: IdleAction;
  startedAt: number;
};

export type PoseInput = {
  now: number;
  startedAt: number;
  clickStartedAt: number | null;
  dragTilt: number;
  timedAction: TimedAction | null;
};

export type PetPose = {
  yOffset: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

const CLICK_DURATION = 480;
const ACTION_DURATION = 1100;

export function getPetPose(input: PoseInput): PetPose {
  const elapsed = (input.now - input.startedAt) / 1000;
  const breath = Math.sin(elapsed * 2.1);
  const float = Math.sin(elapsed * 1.45) * 5;
  const sway = Math.sin(elapsed * 1.1) * 0.018;
  const click = getClickPose(input.now, input.clickStartedAt);
  const action = getActionPose(input.now, input.timedAction);

  return {
    yOffset: float + click.yOffset + action.yOffset,
    rotation: sway + input.dragTilt + action.rotation,
    scaleX: 1 + breath * 0.012 + click.scale + action.scaleX,
    scaleY: 1 - breath * 0.008 + click.scale + action.scaleY
  };
}

export function isClickAnimating(now: number, clickStartedAt: number | null): boolean {
  return clickStartedAt !== null && now - clickStartedAt < CLICK_DURATION;
}

export function isTimedActionActive(now: number, action: TimedAction | null): boolean {
  return action !== null && now - action.startedAt < ACTION_DURATION;
}

function getClickPose(now: number, startedAt: number | null): Pick<PetPose, 'yOffset'> & { scale: number } {
  if (startedAt === null) {
    return { yOffset: 0, scale: 0 };
  }

  const progress = Math.min(1, (now - startedAt) / CLICK_DURATION);
  const wave = Math.sin(progress * Math.PI);

  return {
    yOffset: -18 * wave,
    scale: 0.055 * wave
  };
}

function getActionPose(
  now: number,
  action: TimedAction | null
): Pick<PetPose, 'yOffset' | 'rotation' | 'scaleX' | 'scaleY'> {
  if (!action) {
    return { yOffset: 0, rotation: 0, scaleX: 0, scaleY: 0 };
  }

  const progress = Math.min(1, (now - action.startedAt) / ACTION_DURATION);
  const wave = Math.sin(progress * Math.PI);
  const shake = Math.sin(progress * Math.PI * 6);

  if (action.type === 'nod') {
    return { yOffset: 8 * wave, rotation: 0, scaleX: 0.01 * wave, scaleY: -0.018 * wave };
  }

  if (action.type === 'stretch') {
    return { yOffset: -12 * wave, rotation: 0, scaleX: -0.02 * wave, scaleY: 0.045 * wave };
  }

  if (action.type === 'shake') {
    return { yOffset: 0, rotation: 0.045 * shake * wave, scaleX: 0, scaleY: 0 };
  }

  return { yOffset: -6 * wave, rotation: 0.02 * shake * wave, scaleX: 0.012 * wave, scaleY: 0 };
}
