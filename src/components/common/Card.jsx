import { cn } from '../../utils/helpers';

// Main Card Component
export function Card({ 
  children, 
  className = '', 
  header, 
  footer, 
  variant = 'default',
  padding = 'md',
  hover = false,
  noShadow = false,
  ...props 
}) {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    primary: 'bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400',
    secondary: 'bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400',
    ghost: 'bg-transparent border-0',
    elevated: 'bg-white dark:bg-gray-800 border-0 shadow-2xl',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadows = noShadow ? '' : 'shadow-sm';
  const hoverEffects = hover ? 'hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer hover:-translate-y-1' : '';

  return (
    <div 
      className={cn(
        'rounded-2xl overflow-hidden',
        shadows,
        variants[variant] || variants.default,
        hoverEffects,
        className
      )} 
      {...props}
    >
      {header && (
        <div className={cn(
          'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
          variant === 'ghost' ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-gray-900/30'
        )}>
          {typeof header === 'string' ? <CardTitle>{header}</CardTitle> : header}
        </div>
      )}
      <div className={cn(paddings[padding] || paddings.md)}>
        {children}
      </div>
      {footer && (
        <div className={cn(
          'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
          variant === 'ghost' ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-gray-900/30'
        )}>
          {typeof footer === 'string' ? <p className="text-sm text-gray-600 dark:text-gray-400">{footer}</p> : footer}
        </div>
      )}
    </div>
  );
}

// Card Header Component
export function CardHeader({ 
  title, 
  subtitle, 
  action, 
  className = '',
  icon,
  children,
  ...props 
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="flex-1 min-w-0">
        {icon && (
          <div className="mb-3">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Card Title Component
export function CardTitle({ 
  children, 
  className = '',
  as: Component = 'h3',
  ...props 
}) {
  return (
    <Component 
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-white leading-tight',
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Description Component
export function CardDescription({ 
  children, 
  className = '',
  ...props 
}) {
  return (
    <p 
      className={cn(
        'text-sm text-gray-500 dark:text-gray-400 leading-relaxed',
        className
      )} 
      {...props}
    >
      {children}
    </p>
  );
}

// Card Content Component
export function CardContent({ 
  children, 
  className = '',
  noPadding = false,
  ...props 
}) {
  return (
    <div 
      className={cn(
        !noPadding && 'space-y-4',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Card Body Component (alias for CardContent for better naming)
export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer Component
export function CardFooter({
  children,
  className = '',
  align = 'left',
  ...props
}) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    between: 'flex justify-between items-center',
  };

  return (
    <div 
      className={cn(
        'mt-6 pt-6 border-t border-gray-200 dark:border-gray-700',
        alignments[align] || alignments.left,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Card Divider Component
export function CardDivider({ className = '', ...props }) {
  return (
    <hr 
      className={cn(
        'my-6 border-gray-200 dark:border-gray-700',
        className
      )} 
      {...props}
    />
  );
}

// Card Grid Component (for multiple cards)
export function CardGrid({ 
  children, 
  className = '',
  cols = 3,
  gap = 6,
  ...props 
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div 
      className={cn(
        'grid',
        gridCols[cols] || gridCols[3],
        `gap-${gap}`,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Card Group Component
export function CardGroup({ 
  children, 
  className = '',
  spacing = 4,
  ...props 
}) {
  return (
    <div 
      className={cn(
        `space-y-${spacing}`,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Export all components as default
const CardComponents = {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardBody,
  CardFooter,
  CardDivider,
  CardGrid,
  CardGroup,
};

export default CardComponents;