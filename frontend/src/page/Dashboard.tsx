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
            {/* Sidebar */}
            <aside className="w-64 bg-[#111111] border-r border-[#3c4043] flex flex-col">
                <div className="p-4">
                    <p className="text-gray-500 text-sm">Sidebar</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-[#3c4043] flex items-center px-4">
                    <p className="text-gray-500 text-sm">Header</p>
                </header>

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
                        <h2 className="text-xl font-medium text-[#e8eaed] mb-4">My Drive</h2>
                        <p className="text-gray-500 text-sm mb-4">Main content area</p>
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
                        <div className="bg-[#1e1e1e] rounded-xl border border-[#3c4043] overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#3c4043]">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-[#9aa0a6]">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-[#9aa0a6]">Size</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-[#9aa0a6]">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-[#9aa0a6]">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-[#9aa0a6]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr key={file._id} className="border-b border-[#3c4043] last:border-0 hover:bg-[#2d2f31]">
                                            <td className="px-4 py-3">
                                                {editingId === file._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="text"
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            className="h-8 bg-[#2d2f31] border-[#3c4043]"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleRename(file._id)}
                                                        />
                                                        <Button size="sm" onClick={() => handleRename(file._id)}>Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setNewName(''); }}>Cancel</Button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-[#e8eaed]">{file.filename}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-[#9aa0a6]">{formatFileSize(file.size)}</td>
                                            <td className="px-4 py-3 text-[#9aa0a6]">{new Date(file.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                {file.isPublic ? (
                                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Shared</span>
                                                ) : (
                                                    <span className="text-xs bg-[#3c4043] text-[#9aa0a6] px-2 py-1 rounded">Private</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="sm" variant="ghost" className="text-[#9aa0a6] hover:text-white">
                                                            ⋮
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-[#2d2f31] border-[#3c4043]">
                                                        <DropdownMenuItem onClick={() => handleDownload(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setEditingId(file._id); setNewName(file.filename); }} className="text-[#e8eaed] focus:bg-[#3c4043]">
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                        <DropdownMenuItem onClick={() => handleShare(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">
                                                            {file.isPublic ? 'Unshare' : 'Share'}
                                                        </DropdownMenuItem>
                                                        {file.isPublic && (
                                                            <DropdownMenuItem onClick={() => handleCopyLink(file)} className="text-[#e8eaed] focus:bg-[#3c4043]">
                                                                Copy Link
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-[#3c4043]" />
                                                        <DropdownMenuItem onClick={() => handleDelete(file._id)} className="text-red-400 focus:bg-[#3c4043]">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;