import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <Topbar />
                {children}
            </main>
        </div>
    );
}
