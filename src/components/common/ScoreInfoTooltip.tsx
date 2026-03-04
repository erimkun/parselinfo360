import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { scoreExplanations } from '../../constants/scoreExplanations';

interface ScoreInfoTooltipProps {
  title: string;
  description: string;
  formula?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Skor açıklamalarını gösteren ufak bilgi ikonu + tooltip popup
 * Kullanım:
 * <ScoreInfoTooltip title="Kısa Vade Momentum" description="..." formula="..." />
 */
export const ScoreInfoTooltip: React.FC<ScoreInfoTooltipProps> = ({
  title,
  description,
  formula,
  position = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block group">
      {/* Info İkonu */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-help"
        title="açıklama göster"
      >
        <Info size={14} />
      </button>

      {/* Tooltip Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 w-56 p-2 rounded-lg shadow-lg border dark:border-gray-700 bg-white dark:bg-slate-800 text-xs ${
            position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : ''
          } ${position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : ''} ${
            position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''
          } ${position === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : ''} max-h-64 overflow-y-auto`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Kapatma Butonu */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={14} />
          </button>

          {/* Başlık */}
          <h4 className="font-bold text-gray-900 dark:text-white mb-1 pr-4 lowercase text-xs">
            {title}
          </h4>

          {/* Açıklama */}
          <p className="text-gray-600 dark:text-gray-300 text-xs leading-snug mb-1 lowercase">
            {description}
          </p>

          {/* Formula */}
          {formula && (
            <div className="mt-1 p-1.5 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-mono text-gray-700 dark:text-gray-400 lowercase">
                <span className="font-bold text-gray-900 dark:text-gray-300">
                  formül:{' '}
                </span>
                {formula}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ScoreFieldProps {
  label: string;
  value: string | number;
  // use the already imported object for typing so relative path is correct
  scoreKey?: keyof typeof scoreExplanations;
  icon?: React.ReactNode;
}

/**
 * Skor alanını label, value ve tooltip ile gösterir
 * Kullanım:
 * <ScoreField label="Momentum" value={45} scoreKey="shortTermMomentum" />
 */
export const ScoreField: React.FC<ScoreFieldProps> = ({
  label,
  value,
  scoreKey,
  icon,
}) => {
  const explanation = scoreKey ? scoreExplanations[scoreKey] : null;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 lowercase">
            {label}
          </span>
          {explanation && (
            <ScoreInfoTooltip
              title={explanation.title}
              description={explanation.description}
              formula={explanation.formula}
              position="top"
            />
          )}
        </div>
      </div>
      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {value}
      </div>
    </div>
  );
};

export default ScoreInfoTooltip;
