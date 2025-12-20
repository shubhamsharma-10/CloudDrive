import { useRef } from 'react';
import { Button } from './ui/button';
import { Plus, Home, FolderClosed, Monitor, Users, Clock, Star, AlertCircle, Trash2 } from 'lucide-react';

interface SidebarProps {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const navItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: FolderClosed, label: 'My Drive', active: true },
    { icon: Monitor, label: 'Computers', active: false },
    { icon: Users, label: 'Shared with me', active: false },
    { icon: Clock, label: 'Recent', active: false },
    { icon: Star, label: 'Starred', active: false },
    { icon: AlertCircle, label: 'Spam', active: false },
    { icon: Trash2, label: 'Trash', active: false },
];

const Sidebar = ({ onFileSelect }: SidebarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <aside className="w-64 bg-[#111111] border-r border-[#3c4043] flex flex-col">
            <div className="p-4">
                <h1 className="text-xl font-medium text-[#e8eaed]">CloudDrive</h1>
            </div>

            <div className="px-3 py-2">
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="justify-start gap-2 bg-[#2d2f31] hover:bg-[#3c4043] text-white border border-[#3c4043] rounded-2xl h-12 px-4 text-sm font-medium shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    New
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    multiple
                    className="hidden"
                />
            </div>

            <nav className="flex-1 px-3 py-2">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${item.active
                                ? 'bg-[#004a77] text-[#c2e7ff]'
                                : 'text-[#e8eaed] hover:bg-[#3c4043]'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${item.active ? 'text-[#c2e7ff]' : ''}`} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
