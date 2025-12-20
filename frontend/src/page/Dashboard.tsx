import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/auth.context';
import fileApi from '../api/files.api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { MoreVertical, FileText, FileImage, FileVideo, FileAudio, File, ExternalLink, Download, Pencil, Copy, Share2, Link, FolderOpen, Info, WifiOff, Trash2, ChevronRight } from 'lucide-react';

interface FileItem {
    _id: string;
    filename: string;
    mimeType: string;
    size: number;
    isPublic: boolean;
    sharedToken?: string;
    createdAt: string;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [newName, setNewName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        try {
            const response = searchQuery
                ? await fileApi.searchFile(searchQuery)
                : await fileApi.getFiles();
            setFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const uploadFiles = async (fileList: FileList) => {
        if (fileList.length === 0) return;
        setUploading(true);
        try {
            await fileApi.uploadFiles(fileList[0]);
            fetchFiles();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this file?')) return;
        try {
            await fileApi.deleteFile(id);
            fetchFiles();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleRename = async (id: string) => {
        if (!newName.trim()) return;
        try {
            await fileApi.renameFile(id, newName);
            setEditingId(null);
            setNewName('');
            fetchFiles();
        } catch (error) {
            console.error('Rename error:', error);
        }
    };

    const handleDownload = async (file: FileItem) => {
        try {
            const response = await fileApi.downloadFile(file._id);
            window.open(response.data.url, "_blank");
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            uploadFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files) {
            uploadFiles(e.dataTransfer.files);
        }
    };

    const handleShare = async (file: FileItem) => {
        try {
            if (file.isPublic) {
                await fileApi.unshareFile(file._id);
                setShareLink(null);
            } else {
                const response = await fileApi.shareFile(file._id);
                const link = `${window.location.origin}/shared/${response.data.sharedToken}`;
                setShareLink(link);
                navigator.clipboard.writeText(link);
            }
            fetchFiles();
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleCopyLink = (file: FileItem) => {
        if (file.isPublic) {
            const link = `${window.location.origin}/shared/${file.sharedToken}`;
            navigator.clipboard.writeText(link);
            setShareLink(link);
        }
    };

    return (
        <div className="min-h-screen bg-[#1f1f1f] text-white flex">
            <Sidebar onFileSelect={handleFileSelect} />

            <div className="flex-1 flex flex-col">
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} userName={user?.name} onLogout={logout} avatar={user?.avatar}/>

                <main
                    className={`flex-1 p-6 overflow-auto bg-[#141414] rounded-tl-2xl transition-colors ${isDragActive ? 'bg-[#004a77]/10 border-2 border-dashed border-[#8ab4f8]' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Share Link Toast */}
                    {shareLink && (
                        <div className="mb-4 p-3 bg-[#004a77] border border-[#8ab4f8]/30 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-[#c2e7ff]">Link copied to clipboard</span>
                            <Button size="sm" variant="ghost" onClick={() => setShareLink(null)} className="text-[#c2e7ff] hover:text-white">×</Button>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-medium text-[#e8eaed]">My Drive</h2>
                            <svg className="w-5 h-5 text-[#9aa0a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3c4043] text-sm text-[#e8eaed] hover:bg-[#3c4043]">
                                Type
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3c4043] text-sm text-[#e8eaed] hover:bg-[#3c4043]">
                                People
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3c4043] text-sm text-[#e8eaed] hover:bg-[#3c4043]">
                                Modified
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                    />

                    {uploading ? (
                        <p className="text-center text-[#8ab4f8] py-12">Uploading...</p>
                    ) : loading ? (
                        <p className="text-center text-[#9aa0a6] py-12">Loading...</p>
                    ) : files.length === 0 ? (
                        <p className="text-center text-[#9aa0a6] py-12">No files yet. Click "New" or drop files here!</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {files.map((file) => {
                                const getFileIcon = () => {
                                    if (file.mimeType.startsWith('image/')) return <FileImage className="w-6 h-6 text-red-400" />;
                                    if (file.mimeType.startsWith('video/')) return <FileVideo className="w-6 h-6 text-purple-400" />;
                                    if (file.mimeType.startsWith('audio/')) return <FileAudio className="w-6 h-6 text-yellow-400" />;
                                    if (file.mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
                                    if (file.mimeType.includes('document') || file.mimeType.includes('word')) return <FileText className="w-6 h-6 text-blue-400" />;
                                    return <File className="w-6 h-6 text-gray-400" />;
                                };
                                return (
                                    <div key={file._id} className="group bg-[#2d2f31] rounded-xl overflow-hidden border border-[#3c4043] hover:border-[#8ab4f8] transition-colors">
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {getFileIcon()}
                                                {editingId === file._id ? (
                                                    <Input
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="h-6 text-sm bg-[#1e1e1e] border-[#8ab4f8]"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRename(file._id);
                                                            if (e.key === 'Escape') { setEditingId(null); setNewName(''); }
                                                        }}
                                                        onBlur={() => { setEditingId(null); setNewName(''); }}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-[#e8eaed] truncate">{file.filename}</span>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#9aa0a6] hover:text-white">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" side="right" className="w-56 bg-[#2d2f31] border-[#3c4043]">
                                                    <DropdownMenuItem className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open with
                                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownload(file)} className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setEditingId(file._id); setNewName(file.filename); }} className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Pencil className="w-4 h-4" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Copy className="w-4 h-4" />
                                                        Make a copy
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                    <DropdownMenuItem onClick={() => handleShare(file)} className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Share2 className="w-4 h-4" />
                                                        {file.isPublic ? 'Stop sharing' : 'Share'}
                                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                                    </DropdownMenuItem>
                                                    {file.isPublic && (
                                                        <DropdownMenuItem onClick={() => handleCopyLink(file)} className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                            <Link className="w-4 h-4" />
                                                            Copy link
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <FolderOpen className="w-4 h-4" />
                                                        Organize
                                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Info className="w-4 h-4" />
                                                        File information
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                    <DropdownMenuItem className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <WifiOff className="w-4 h-4" />
                                                        Make available offline
                                                        <span className="w-8 h-4 bg-[#3c4043] rounded-full relative ml-auto">
                                                            <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-[#9aa0a6] rounded-full"></span>
                                                        </span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                    <DropdownMenuItem onClick={() => handleDelete(file._id)} className="text-[#e8eaed] focus:bg-[#3c4043] gap-3">
                                                        <Trash2 className="w-4 h-4" />
                                                        Move to trash
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="h-32 bg-white flex items-center justify-center">
                                            {getFileIcon()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;