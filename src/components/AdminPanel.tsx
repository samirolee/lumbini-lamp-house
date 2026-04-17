import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Image as ImageIcon, 
  Trash2, 
  ShieldCheck, 
  LogOut,
  Loader2,
  FileVideo,
  Upload,
  CheckCircle,
  AlertCircle,
  Play,
  Film,
  Camera,
  Eye,
  MapPin,
  Type,
  AlignLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  title?: string;
  caption?: string;
  location?: string;
  size?: number;
  created_at: string;
}

interface UploadQueueItem {
  file: File;
  previewUrl: string;
  title: string;
  caption: string;
  location: string;
  type: 'image' | 'video';
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  errorMsg?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sessionLabel, setSessionLabel] = useState('Local Session');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminAccessKey, setAdminAccessKey] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const existing = window.sessionStorage.getItem('sanctuary-admin-auth');
    if (existing === 'granted') {
      setIsAdmin(true);
      setSessionLabel('Authenticated Local Session');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchMedia();

    try {
      const channel = supabase
        .channel('media_changes_panel')
        .on('postgres_changes', { event: '*', table: 'media', schema: 'public' }, () => {
          fetchMedia();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch { /* silent */ }
  }, [isAdmin]);

  const fetchMedia = async () => {
    try {
      const { data, error } = await (supabase.from('media') as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setMedia(data as MediaItem[]);
    } catch { /* silent */ }
  };

  const handleLogin = () => {
    const configuredKey = import.meta.env.VITE_ADMIN_ACCESS_KEY;
    if (!configuredKey) {
      alert('Admin key missing. Set VITE_ADMIN_ACCESS_KEY in .env.local and restart dev server.');
      return;
    }
    if (adminAccessKey.trim() !== configuredKey) {
      alert('Invalid access key.');
      return;
    }
    window.sessionStorage.setItem('sanctuary-admin-auth', 'granted');
    setIsAdmin(true);
    setSessionLabel('Authenticated Local Session');
    setAdminAccessKey('');
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('sanctuary-admin-auth');
    setIsAdmin(false);
    setSessionLabel('Local Session');
    setQueue([]);
  };

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const newItems: UploadQueueItem[] = arr
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(file => {
        const isVideo = file.type.startsWith('video/');
        const previewUrl = URL.createObjectURL(file);
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        return {
          file,
          previewUrl,
          title: baseName || file.name,
          caption: '',
          location: '',
          type: isVideo ? 'video' : 'image',
          status: 'pending',
          progress: 0,
        };
      });
    setQueue(prev => [...prev, ...newItems]);
    setActiveTab('upload');
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFilesToQueue(e.dataTransfer.files);
  };

  const updateQueueItem = (index: number, updates: Partial<UploadQueueItem>) => {
    setQueue(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    const pending = queue.filter(q => q.status === 'pending');
    if (pending.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'pending') continue;

      updateQueueItem(i, { status: 'uploading', progress: 5 });
      const item = queue[i];

      try {
        const ext = item.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `gallery/${fileName}`;

        updateQueueItem(i, { progress: 20 });

        const { error: uploadError } = await supabase.storage
          .from('sanctuary')
          .upload(filePath, item.file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;
        updateQueueItem(i, { progress: 70 });

        const { data: { publicUrl } } = supabase.storage.from('sanctuary').getPublicUrl(filePath);

        updateQueueItem(i, { progress: 85 });

        const { error: dbError } = await (supabase.from('media') as any).insert([{
          url: publicUrl,
          type: item.type,
          name: item.file.name,
          title: item.title.trim() || item.file.name,
          caption: item.caption.trim() || null,
          location: item.location.trim() || null,
          size: item.file.size,
        }]);

        if (dbError) throw dbError;

        updateQueueItem(i, { status: 'done', progress: 100 });
        URL.revokeObjectURL(item.previewUrl);
      } catch (err: any) {
        updateQueueItem(i, { status: 'error', progress: 0, errorMsg: err?.message || 'Upload failed' });
      }
    }

    setIsUploading(false);
    // Remove done items after a short delay
    setTimeout(() => {
      setQueue(prev => prev.filter(q => q.status !== 'done'));
      if (queue.every(q => q.status === 'done' || q.status === 'error')) {
        setActiveTab('gallery');
      }
    }, 1500);
  };

  const handleDelete = async (item: MediaItem) => {
    try {
      const { error: dbError } = await (supabase.from('media') as any).delete().eq('id', item.id);
      if (dbError) throw dbError;

      const pathParts = item.url.split('/storage/v1/object/public/sanctuary/');
      if (pathParts.length > 1) {
        await supabase.storage.from('sanctuary').remove([pathParts[1]]);
      }
      setDeleteConfirm(null);
      setSelectedMedia(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const doneCount = queue.filter(q => q.status === 'done').length;
  const errorCount = queue.filter(q => q.status === 'error').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex-none flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Sanctuary Archives</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Administrator Command Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-stone-500 hover:text-white hover:border-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
              <p className="text-stone-500 text-sm italic">Checking permissions…</p>
            </div>

          ) : !isAdmin ? (
            /* ─── LOGIN ─── */
            <div className="flex-grow flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-sm">
                <div className="w-20 h-20 rounded-full bg-amber-400/5 border border-amber-400/10 flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck className="w-10 h-10 text-amber-400/40" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white text-center mb-2">Admin Access</h3>
                <p className="text-stone-500 text-sm text-center mb-10 leading-relaxed">
                  Enter your private access key to manage the sanctuary's media gallery.
                </p>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={adminAccessKey}
                    onChange={(e) => setAdminAccessKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400/50 transition-colors placeholder:text-stone-600"
                    placeholder="Enter admin access key"
                    autoFocus
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full py-4 bg-amber-400 text-black font-bold rounded-full text-xs uppercase tracking-[0.2em] hover:bg-amber-300 transition-colors"
                  >
                    Unlock Sanctuary Registry
                  </button>
                </div>
              </div>
            </div>

          ) : (
            /* ─── MAIN ADMIN UI ─── */
            <div className="flex-grow overflow-hidden flex flex-col">

              {/* Stats row */}
              <div className="flex-none grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
                {[
                  { icon: ImageIcon, label: 'Total Media', value: media.length },
                  { icon: Film, label: 'Videos', value: media.filter(m => m.type === 'video').length },
                  { icon: Camera, label: 'Photos', value: media.filter(m => m.type === 'image').length },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-4 bg-[#0d0d0d]">
                    <stat.icon className="w-4 h-4 text-amber-400/50" />
                    <div>
                      <p className="text-xl font-bold text-white leading-none">{stat.value}</p>
                      <p className="text-[9px] uppercase tracking-widest text-stone-600 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex-none flex items-center gap-1 px-6 pt-4 pb-0">
                {(['upload', 'gallery'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab
                        ? 'bg-amber-400 text-black'
                        : 'text-stone-500 hover:text-white'
                    }`}
                  >
                    {tab === 'upload' ? 'Upload Media' : 'Gallery'}
                    {tab === 'upload' && queue.length > 0 && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black ${
                        errorCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-400 text-black'
                      }`}>
                        {queue.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-grow overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                <AnimatePresence mode="wait">

                  {/* ─── UPLOAD TAB ─── */}
                  {activeTab === 'upload' && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-6"
                    >
                      {/* Drop zone */}
                      <div
                        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center cursor-pointer ${
                          isDragging
                            ? 'border-amber-400 bg-amber-400/5 scale-[1.01]'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                        <motion.div
                          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                            <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-amber-400' : 'text-amber-400/60'}`} />
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-1">
                              {isDragging ? 'Drop your files here!' : 'Drag & drop photos or videos'}
                            </p>
                            <p className="text-stone-500 text-xs">or click to browse — images & videos supported</p>
                          </div>
                          <div className="flex gap-3 mt-2">
                            {[
                              { icon: Camera, label: 'JPG, PNG, WEBP, GIF' },
                              { icon: Film, label: 'MP4, MOV, WEBM' },
                            ].map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <f.icon className="w-3 h-3 text-amber-400/70" />
                                <span className="text-[10px] text-stone-400">{f.label}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      {/* Queue */}
                      {queue.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">
                              Upload Queue ({queue.length} file{queue.length !== 1 ? 's' : ''})
                            </h3>
                            {pendingCount > 0 && !isUploading && (
                              <button
                                onClick={uploadAll}
                                className="flex items-center gap-2 px-5 py-2 bg-amber-400 text-black text-xs font-bold rounded-full uppercase tracking-widest hover:bg-amber-300 transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                Upload All ({pendingCount})
                              </button>
                            )}
                            {isUploading && (
                              <div className="flex items-center gap-2 text-amber-400 text-xs">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading…
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <AnimatePresence>
                              {queue.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  layout
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10, height: 0 }}
                                  className={`rounded-2xl border overflow-hidden transition-colors ${
                                    item.status === 'done' ? 'border-green-500/30 bg-green-500/5' :
                                    item.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                                    item.status === 'uploading' ? 'border-amber-400/30 bg-amber-400/5' :
                                    'border-white/10 bg-white/[0.02]'
                                  }`}
                                >
                                  <div className="flex gap-4 p-4">
                                    {/* Preview thumbnail */}
                                    <div className="flex-none w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                                      {item.type === 'video' ? (
                                        <>
                                          <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Play className="w-6 h-6 text-white/80" />
                                          </div>
                                        </>
                                      ) : (
                                        <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
                                      )}
                                      <div className="absolute top-1 left-1">
                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                                          item.type === 'video' ? 'bg-purple-500/80 text-white' : 'bg-blue-500/80 text-white'
                                        }`}>
                                          {item.type === 'video' ? <Film className="w-2.5 h-2.5 inline" /> : <Camera className="w-2.5 h-2.5 inline" />}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Metadata fields */}
                                    <div className="flex-grow min-w-0 space-y-3">
                                      {item.status === 'pending' ? (
                                        <>
                                          <div className="relative">
                                            <Type className="absolute left-3 top-3 w-3 h-3 text-stone-500" />
                                            <input
                                              value={item.title}
                                              onChange={e => updateQueueItem(idx, { title: e.target.value })}
                                              className="w-full bg-transparent border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
                                              placeholder="Title"
                                            />
                                          </div>
                                          <div className="relative">
                                            <AlignLeft className="absolute left-3 top-3 w-3 h-3 text-stone-500" />
                                            <input
                                              value={item.caption}
                                              onChange={e => updateQueueItem(idx, { caption: e.target.value })}
                                              className="w-full bg-transparent border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
                                              placeholder="Caption (optional)"
                                            />
                                          </div>
                                          <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-3 h-3 text-stone-500" />
                                            <input
                                              value={item.location}
                                              onChange={e => updateQueueItem(idx, { location: e.target.value })}
                                              className="w-full bg-transparent border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
                                              placeholder="Location (e.g. Lumbini, Nepal)"
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <div className="py-2">
                                          <p className="text-sm text-white font-medium truncate">{item.title}</p>
                                          {item.location && <p className="text-xs text-stone-500">{item.location}</p>}
                                          <p className="text-[10px] text-stone-600 mt-1">{formatBytes(item.file.size)}</p>
                                        </div>
                                      )}

                                      {/* Progress bar */}
                                      {(item.status === 'uploading' || item.status === 'done') && (
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.progress}%` }}
                                            className={`h-full rounded-full ${item.status === 'done' ? 'bg-green-400' : 'bg-amber-400'}`}
                                            transition={{ duration: 0.3 }}
                                          />
                                        </div>
                                      )}
                                      {item.status === 'error' && (
                                        <p className="text-[10px] text-red-400 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3" /> {item.errorMsg}
                                        </p>
                                      )}
                                    </div>

                                    {/* Status / Remove */}
                                    <div className="flex-none flex flex-col items-center justify-between">
                                      {item.status === 'done' && <CheckCircle className="w-5 h-5 text-green-400" />}
                                      {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                                      {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />}
                                      {item.status === 'pending' && (
                                        <button
                                          onClick={() => removeFromQueue(idx)}
                                          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-stone-500 hover:text-red-400 hover:border-red-400/30 transition-all"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          {/* Upload summary / actions */}
                          {queue.length > 0 && (
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-xs text-stone-500">
                                {doneCount > 0 && <span className="text-green-400">{doneCount} uploaded </span>}
                                {errorCount > 0 && <span className="text-red-400">{errorCount} failed </span>}
                                {pendingCount > 0 && <span>{pendingCount} pending</span>}
                              </p>
                              {!isUploading && (
                                <button
                                  onClick={() => setQueue([])}
                                  className="text-[10px] text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors"
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ─── GALLERY TAB ─── */}
                  {activeTab === 'gallery' && (
                    <motion.div
                      key="gallery"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <ImageIcon className="w-12 h-12 text-stone-700 mb-4" />
                          <p className="text-stone-500 text-sm">No media uploaded yet.</p>
                          <button
                            onClick={() => setActiveTab('upload')}
                            className="mt-4 text-amber-400 text-xs font-bold uppercase tracking-widest hover:underline"
                          >
                            Upload your first photo or video →
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                          <AnimatePresence>
                            {media.map((item) => (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer"
                                onClick={() => setSelectedMedia(item)}
                              >
                                {item.type === 'video' ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/30 to-black">
                                    <FileVideo className="w-8 h-8 text-purple-400/60 mb-1" />
                                    <span className="text-[8px] uppercase tracking-wider text-stone-500 px-2 text-center line-clamp-2">
                                      {item.title || item.name}
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-2">
                                  <Eye className="w-5 h-5 text-white" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.id); }}
                                    className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Type badge */}
                                <div className="absolute top-2 left-2">
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                    item.type === 'video' ? 'bg-purple-500/80 text-white' : 'bg-blue-500/70 text-white'
                                  }`}>
                                    {item.type === 'video' ? 'VID' : 'IMG'}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {isAdmin && (
          <div className="flex-none flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-stone-600">{sessionLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400/20 transition-all"
              >
                <Upload className="w-3 h-3" /> Add Media
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 text-stone-500 text-[10px] font-bold uppercase tracking-widest rounded-full hover:text-white hover:border-white/20 transition-all"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Media Detail Modal ── */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => { setSelectedMedia(null); setDeleteConfirm(null); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-2xl w-full bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black">
                {selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls autoPlay playsInline className="w-full h-full object-contain" />
                ) : (
                  <img src={selectedMedia.url} alt={selectedMedia.title || selectedMedia.name} className="w-full h-full object-contain" />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-serif text-lg">{selectedMedia.title || selectedMedia.name}</h3>
                    {selectedMedia.caption && <p className="text-stone-400 text-sm mt-1">{selectedMedia.caption}</p>}
                    {selectedMedia.location && (
                      <p className="text-stone-600 text-xs mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedMedia.location}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${
                        selectedMedia.type === 'video' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {selectedMedia.type}
                      </span>
                      {selectedMedia.size && (
                        <span className="text-[9px] text-stone-600">{formatBytes(selectedMedia.size)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deleteConfirm === selectedMedia.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Confirm delete?</span>
                        <button
                          onClick={() => handleDelete(selectedMedia)}
                          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-full hover:bg-red-500/40 transition-all"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 border border-white/10 text-stone-400 text-xs rounded-full hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(selectedMedia.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-full hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedMedia(null); setDeleteConfirm(null); }}
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-stone-500 hover:text-white transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
