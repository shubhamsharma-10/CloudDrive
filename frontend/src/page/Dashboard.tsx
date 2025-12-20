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
import { MoreVertical, FileText, FileImage, FileVideo, FileAudio, File } from 'lucide-react';

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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-[#111111] text-white flex">
            <Sidebar onFileSelect={handleFileSelect} />

            <div className="flex-1 flex flex-col">
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} userName={user?.name} />

                {/* Main Area */}
                <main
                    className="flex-1 p-6 overflow-auto"
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

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-8 mb-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-colors
                            ${isDragActive ? 'border-[#8ab4f8] bg-[#004a77]/20' : 'border-[#3c4043] hover:border-[#5f6368]'}`}
                    >
                        <p className="text-[#9aa0a6]">
                            {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop files, or click to select'}
                        </p>
                    </div>

                    {loading ? (
                        <p className="text-center text-[#9aa0a6] py-12">Loading...</p>
                    ) : files.length === 0 ? (
                        <p className="text-center text-[#9aa0a6] py-12">No files yet. Upload your first file!</p>
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
                                                <DropdownMenuContent align="end" className="w-48 bg-[#2d2f31] border-[#3c4043]">
                                                    <DropdownMenuItem onClick={() => handleDownload(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">Download</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setEditingId(file._id); setNewName(file.filename); }} className="text-[#e8eaed] focus:bg-[#3c4043]">Rename</DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                    <DropdownMenuItem onClick={() => handleShare(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">{file.isPublic ? 'Unshare' : 'Share'}</DropdownMenuItem>
                                                    {file.isPublic && <DropdownMenuItem onClick={() => handleCopyLink(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">Copy Link</DropdownMenuItem>}
                                                    <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                    <DropdownMenuItem onClick={() => handleDelete(file._id)} className="text-red-400 focus:bg-[#3c4043]">Move to trash</DropdownMenuItem>
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