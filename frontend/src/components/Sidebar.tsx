import { useRef } from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface SidebarProps {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar = ({ onFileSelect }: SidebarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="w-64 bg-[#111111] border-r border-[#3c4043] flex flex-col">
            <div className="p-4">
                <h1 className="text-xl font-medium text-[#e8eaed]">CloudDrive</h1>
            </div>

            <div className="px-3 py-2">
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="justify-start gap-2 bg-[#2d2f31] hover:bg-[#3c4043] text-white border border-[#3c4043] rounded-2xl h-12 w-25 px-4 text-sm font-medium shadow-md"
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
        </div>
    );
};

export default Sidebar;
