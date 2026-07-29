import type { ReactElement } from 'react';

type SpeechBubbleProps = {
  text: string;
  petName: string;
};

export function SpeechBubble({ text, petName }: SpeechBubbleProps): ReactElement | null {
  if (!text) {
    return null;
  }

  return (
    <div className="speech-bubble" role="status" aria-label={`${petName}说`}>
      {text}
    </div>
  );
}
