import UpdateNotifier from './components/UpdateNotifier';

// ... (imports remain same)

function App() {
    return (
        <AuthProvider>
            <StorageProvider>
                <AppContent />
                <UpdateNotifier />
            </StorageProvider>
        </AuthProvider>
    );
}

export default App;
