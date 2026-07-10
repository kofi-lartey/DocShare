import { cn } from '../../utils/helpers';

const IMAGE_URL = 'https://res.cloudinary.com/djjgkezui/image/upload/v1783687895/Gemini_Generated_Image_buwg67buwg67buwg_whwjno.png';

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
};

export default function BrandLogo({ size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <img
      src={IMAGE_URL}
      alt="DocShare Pro"
      className={cn('rounded-xl object-cover', sizeClass, className)}
    />
  );
}
