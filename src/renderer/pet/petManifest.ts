import idleImage from '../../../assets/pets/xiaoxiao/idle.png';
import manifest from '../../../assets/pets/xiaoxiao/manifest.json';
import type { PetManifest } from '../../shared/types';

export const petManifest: PetManifest = {
  ...manifest,
  image: idleImage,
  idleActions: manifest.idleActions as PetManifest['idleActions']
};
