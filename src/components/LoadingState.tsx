import React from 'react';
import { useTranslation } from 'next-i18next';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative w-16 h-16">
        {/* Spinning circle */}
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-600 text-sm font-medium">
        {message || t('loading.analyzing')}
      </p>
    </div>
  );
};

export default LoadingState;
