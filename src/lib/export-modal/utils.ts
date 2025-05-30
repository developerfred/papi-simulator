/* eslint-disable  @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

export const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getFileExtension = (filename: string): string => {
  if (filename.includes('.tsx')) return '.tsx';
  if (filename.includes('.ts')) return '.ts';
  if (filename.includes('.js')) return '.js';
  if (filename.includes('.json')) return '.json';
  if (filename.includes('.md')) return '.md';
  if (filename.includes('.css')) return '.css';
  return '.txt';
};

export const modalStyle = (getColor: any) => ({
  position: 'fixed' as const,
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease-out'
});

export const contentStyle = (getColor: any) => ({
  backgroundColor: getColor('surface'),
  border: `1px solid ${getColor('border')}`,
  borderRadius: '16px',
  width: '90vw',
  maxWidth: '900px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column' as const,
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  animation: 'scaleIn 0.2s ease-out',
  overflow: 'hidden'
});

export const tabStyle = (isActive: boolean, getColor: any) => ({
  padding: '12px 20px',
  border: 'none',
  background: isActive ? getColor('surface-variant') : 'transparent',
  color: isActive ? getColor('text-primary') : getColor('text-secondary'),
  cursor: 'pointer',
  borderRadius: '8px 8px 0 0',
  fontSize: '14px',
  fontWeight: isActive ? '600' : '500',
  transition: 'all 0.2s ease',
  borderBottom: isActive ? `3px solid ${getColor('network-primary')}` : 'none',
  position: 'relative' as const
});

export const inputStyle = (getColor: any) => ({
  width: '100%',
  padding: '12px 16px',
  backgroundColor: getColor('background'),
  border: `2px solid ${getColor('border')}`,
  borderRadius: '8px',
  color: getColor('text-primary'),
  fontSize: '14px',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'inherit'
});


