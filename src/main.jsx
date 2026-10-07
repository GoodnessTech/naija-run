import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Naija Run App Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#0a0f0d',
            color: '#f87171',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#fef08a' }}>
            Naija Run Encountered An Error
          </h2>
          <pre
            style={{
              maxWidth: '600px',
              fontSize: '0.85rem',
              color: '#fca5a5',
              background: 'rgba(0,0,0,0.6)',
              padding: '16px',
              borderRadius: '8px',
              overflowX: 'auto',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: '#008751',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Restart Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
