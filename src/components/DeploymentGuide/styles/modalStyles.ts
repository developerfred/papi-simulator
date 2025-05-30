export const modalStyles = (getColor: (key: string) => string) => ({
    overlay: {
        position: 'fixed' as const,
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
    },
    content: {
        backgroundColor: getColor('surface'),
        borderRadius: '16px',
        maxWidth: '900px',
        maxHeight: '85vh',
        width: '95%',
        overflow: 'hidden' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    tabContent: {
        padding: '20px',
        flex: 1,
        overflow: 'auto' as const
    }
});

