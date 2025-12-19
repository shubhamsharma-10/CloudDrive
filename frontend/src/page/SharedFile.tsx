import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import fileApi from '../api/files.api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

interface SharedFileData {
    filename: string;
    mimeType: string;
    size: number;
    url: string;
}

function SharedFile() {
    const { shareToken } = useParams<{ shareToken: string }>();
    const [file, setFile] = useState<SharedFileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSharedFile = async () => {
            if (!shareToken) return;
            try {
                const res = await fileApi.getSharedFile(shareToken);
                setFile(res.data.file);
            } catch {
                setError('File not found or no longer shared');
            } finally {
                setLoading(false);
            }
        };
        fetchSharedFile();
    }, [shareToken]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };


    const getFileIcon = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📕';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
        return '📄';
    };

    const handleDownload = () => {
        if (file?.url) {
            window.open(file.url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">CloudDrive</CardTitle>
                    <CardDescription>Shared File</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading file...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-6xl mb-4">😕</p>
                            <p className="text-destructive mb-4">{error}</p>
                            <Link to="/">
                                <Button variant="outline">Go to CloudDrive</Button>
                            </Link>
                        </div>
                    ) : file ? (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <p className="text-6xl mb-4">{getFileIcon(file.mimeType)}</p>
                                <h2 className="font-semibold text-lg break-all">{file.filename}</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {formatFileSize(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase() || file.mimeType}
                                </p>
                            </div>
                            <Button onClick={handleDownload} className="w-full" size="lg">
                                Download File
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                This link may expire. Download now to save the file.
                            </p>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

export default SharedFile;