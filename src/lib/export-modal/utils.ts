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

export const modalStyle = (getColor: (key: string) => string): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
});

export const contentStyle = (getColor: (key: string) => string): React.CSSProperties => ({
  backgroundColor: getColor('surface'),
  borderRadius: '16px',
  padding: '0',
  maxWidth: '1000px',
  maxHeight: '85vh',
  width: '95%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
});

export const tabStyle = (
  active: boolean, 
  getColor: (key: string) => string
): React.CSSProperties => ({
  padding: '12px 24px',
  border: 'none',
  backgroundColor: active ? getColor('primary') : 'transparent',
  color: active ? 'white' : getColor('text-secondary'),
  cursor: 'pointer',
  borderRadius: '8px',
  margin: '0 4px',
  fontWeight: '600',
  transition: 'all 0.2s ease'
});

export const inputStyle = (getColor: (key: string) => string): React.CSSProperties => ({
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: `1px solid ${getColor('border')}`,
  backgroundColor: getColor('surface'),
  color: getColor('text-primary'),
  fontSize: '14px'
});
