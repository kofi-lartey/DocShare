import PDFPreview from './PDFPreview';
import ImagePreview from './ImagePreview';
import WordPreview from './WordPreview';
import ExcelPreview from './ExcelPreview';
import VideoPreview from './VideoPreview';
import AudioPreview from './AudioPreview';
import TextPreview from './TextPreview';
import DefaultPreview from './DefaultPreview';
import { getFileCategory } from '../../utils/blob';

// Registry mapping a file category to its preview component. Replaces the
// long if/else chain that previously lived in ViewDocument, so adding a new
// preview type is a one-line change here.
const previewRegistry = {
  pdf: PDFPreview,
  image: ImagePreview,
  word: WordPreview,
  excel: ExcelPreview,
  video: VideoPreview,
  audio: AudioPreview,
  text: TextPreview,
  other: DefaultPreview,
};

export function getPreviewComponent(file) {
  return previewRegistry[getFileCategory(file)] || DefaultPreview;
}
