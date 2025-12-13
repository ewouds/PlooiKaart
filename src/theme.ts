import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          marginBottom: '1rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        margin: 'normal',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'sm', // Mobile-first default
      },
    },
  },
};

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    ...baseThemeOptions,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light Theme
            primary: {
              main: '#2563eb', // Modern Blue
            },
            secondary: {
              main: '#dc2626', // Red for penalties/errors
            },
            background: {
              default: '#f3f4f6', // Light gray background
              paper: '#ffffff',
            },
          }
        : {
            // Dark Theme
            primary: {
              main: '#AF1763', // Pinkish/Red
            },
            secondary: {
              main: '#0D6eFD', // Blue
            },
            background: {
              default: '#191c24', // Dark background
              paper: '#2A303C', // Slightly lighter for cards
            },
            success: {
              main: '#198754',
            },
            info: {
              main: '#0FCAF0',
            },
            warning: {
              main: '#FFC107',
            },
            error: {
              main: '#AB1E3C',
            },
          }),
    },
    components: {
      ...baseThemeOptions.components,
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: `url('/card-pattern.svg')`,
            backgroundSize: '60px 80px',
            backgroundAttachment: 'fixed',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            marginBottom: '1rem',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(42, 48, 60, 0.6)',
            backdropFilter: 'blur(8px)',
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              : '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
          },
        },
      },
    }
  });
};

export default getTheme('light');
