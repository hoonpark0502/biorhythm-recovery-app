import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', background: '#333', height: '100vh', overflow: 'auto' }}>
                    <h1>Something went wrong.</h1>
                    <h3 style={{ color: 'red' }}>{this.state.error && this.state.error.toString()}</h3>
                    <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px', marginTop: '20px' }}>
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
