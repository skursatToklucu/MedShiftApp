import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  footer,
  className = '',
  contentClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-smooth border border-neutral-200 overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="p-4 border-b border-neutral-200">
          {title && <h3 className="text-lg font-medium text-neutral-800">{title}</h3>}
          {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
        </div>
      )}
      
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;