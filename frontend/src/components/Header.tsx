import { Search, SlidersHorizontal, HelpCircle, Settings, LayoutGrid } from 'lucide-react';
import { Input } from './ui/input';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    userName?: string;
}

const Header = ({ searchQuery, onSearchChange, userName }: HeaderProps) => {
    return (
        <header className="h-16 border-b border-[#3c4043] flex items-center px-4 gap-4 ">
            <div className="max-w-2xl w-full">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa0a6]" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search in Drive"
                        className="w-full pl-12 pr-12 h-12 bg-[#2d2f31] border-none rounded-full text-[#e8eaed] placeholder:text-[#9aa0a6] focus-visible:ring-1 focus-visible:ring-[#8ab4f8]"
                    />
                    <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa0a6] cursor-pointer hover:text-[#e8eaed]" />
                </div>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed]">
                    <HelpCircle className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed]">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed]">
                    <LayoutGrid className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-[#8ab4f8] flex items-center justify-center text-sm font-medium text-[#1e1e1e] ml-2">
                    {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
};

export default Header;
