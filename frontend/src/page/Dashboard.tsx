import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/auth.context';
import fileApi from '../api/files.api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
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
            const response = await fileApi.getFiles();
            let filteredFiles = response.data.files;
            if (searchQuery) {
                filteredFiles = filteredFiles.filter((f: FileItem) =>
                    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setFiles(filteredFiles);
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
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-card">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">CloudDrive</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{user?.name}</span>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Share Link Toast */}
                {shareLink && (
                    <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                        <span className="text-sm">Link copied: <code className="text-xs bg-muted px-1 rounded">{shareLink}</code></span>
                        <Button size="sm" variant="ghost" onClick={() => setShareLink(null)}>×</Button>
                    </div>
                )}

                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="max-w-sm mb-6"
                />

                <Card
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`p-8 mb-6 border-2 border-dashed cursor-pointer text-center transition-colors
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                    />
                    <p className="text-muted-foreground">
                        {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop files, or click to select'}
                    </p>
                </Card>

                {loading ? (
                    <p className="text-center text-muted-foreground py-12">Loading...</p>
                ) : files.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No files yet. Upload your first file!</p>
                ) : (
                    <Card className="overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Size</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file) => (
                                    <tr key={file._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            {editingId === file._id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="h-8"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(file._id)}
                                                    />
                                                    <Button size="sm" onClick={() => handleRename(file._id)}>Save</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setNewName(''); }}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <span className="font-medium">{file.filename}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{formatFileSize(file.size)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            {file.isPublic ? (
                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Shared</span>
                                            ) : (
                                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Private</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <span className="sr-only">Actions</span>
                                                        ⋮
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setEditingId(file._id); setNewName(file.filename); }}>
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleShare(file)}>
                                                        {file.isPublic ? 'Unshare' : 'Share'}
                                                    </DropdownMenuItem>
                                                    {file.isPublic && (
                                                        <DropdownMenuItem onClick={() => handleCopyLink(file)}>
                                                            Copy Link
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(file._id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
