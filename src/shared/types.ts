export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PetConfig = {
  bounds?: Bounds;
  scale: number;
  alwaysOnTop: boolean;
};

export type PetManifest = {
  id: string;
  name: string;
  image: string;
  defaultScale: number;
  bubbleLines: string[];
  idleActions: Array<'nod' | 'stretch' | 'shake' | 'talk'>;
};

export type PointerScreenPoint = {
  screenX: number;
  screenY: number;
};

export type DesktopPetApi = {
  getConfig: () => Promise<PetConfig>;
  saveConfig: (patch: Partial<PetConfig>) => Promise<PetConfig>;
  showContextMenu: () => void;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<PetConfig>;
  startDrag: (point: PointerScreenPoint) => void;
  dragMove: (point: PointerScreenPoint) => void;
  endDrag: () => void;
  quitApp: () => void;
  onConfigChanged: (callback: (config: PetConfig) => void) => () => void;
};
