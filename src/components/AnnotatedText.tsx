import React from 'react';
import { TextHighlight } from '../types/quiz';
import { RichText, renderFormattedContent } from './RichText';

export interface AnnotatedTextProps {
  text: string;
  target: 'passage' | 'stem' | 'prompt';
  highlights: TextHighlight[];
  className?: string;
  onHighlightClick: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
}

export const renderFormattedText = (content: string): React.ReactNode => {
  return renderFormattedContent(content);
};

export const AnnotatedText: React.FC<AnnotatedTextProps> = (props) => {
  return <RichText {...props} />;
};
