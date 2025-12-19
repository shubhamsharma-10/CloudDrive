import { useState, useRef } from 'react';
import { useAuth } from '../context/auth.context';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

interface FileItem {
    _id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [newName, setNewName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="dark min-h-screen bg-background text-foreground">
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
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleDownload(file)}>Download</Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setEditingId(file._id); setNewName(file.originalName); }}>Rename</Button>
                                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(file._id)}>Delete</Button>
                                            </div>
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
