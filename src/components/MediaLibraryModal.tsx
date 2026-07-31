import React, { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Copy,
  Check,
  Trash2,
  Edit2,
  RefreshCw,
  Eye,
  X,
  FileImage,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MediaAsset } from '../data/appSettings';
import { uploadToBrandStorage, deleteBrandStorageAsset, generateCleanSlug } from '../lib/supabase';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaAsset[];
  onUpdateMediaList: (newList: MediaAsset[]) => void;
  isPickerMode?: boolean;
  onSelectMedia?: (asset: MediaAsset) => void;
  selectedAssetUrl?: string;
  pickerTitle?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  onUpdateMediaList,
  isPickerMode = false,
  onSelectMedia,
  selectedAssetUrl,
  pickerTitle = 'মিডিয়া লাইব্রেরি থেকে ছবি সিলেক্ট করুন'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Interaction States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [assetToRename, setAssetToRename] = useState<MediaAsset | null>(null);
  const [assetToReplace, setAssetToReplace] = useState<MediaAsset | null>(null);
  const [newSlugInput, setNewSlugInput] = useState('');

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    const uploadedAssets: MediaAsset[] = [];
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const asset = await uploadToBrandStorage(file, undefined, (progress) => {
          setUploadProgress(progress);
        });
        uploadedAssets.push(asset);
      } catch (err: any) {
        hasError = true;
        setUploadError(err.message || 'আপলোডে সমস্যা হয়েছে');
      }
    }

    if (uploadedAssets.length > 0) {
      const updatedList = [...uploadedAssets, ...mediaList];
      onUpdateMediaList(updatedList);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Handle Replace File
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!assetToReplace || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload new file with same slug
      const newAsset = await uploadToBrandStorage(file, assetToReplace.slug);
      
      // Remove old storage asset if any
      await deleteBrandStorageAsset(assetToReplace);

      // Update in mediaList
      const updatedList = mediaList.map((item) =>
        item.id === assetToReplace.id ? { ...newAsset, id: assetToReplace.id, slug: assetToReplace.slug } : item
      );
      onUpdateMediaList(updatedList);
      setAssetToReplace(null);
    } catch (err: any) {
      setUploadError(err.message || 'ছবি রিপ্লেস করতে সমস্যা হয়েছে');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Copy URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    await deleteBrandStorageAsset(assetToDelete);
    const updatedList = mediaList.filter((item) => item.id !== assetToDelete.id);
    onUpdateMediaList(updatedList);
    setAssetToDelete(null);
  };

  // Handle Confirm Rename
  const handleConfirmRename = () => {
    if (!assetToRename) return;
    const cleanSlug = generateCleanSlug(newSlugInput);
    const updatedList = mediaList.map((item) =>
      item.id === assetToRename.id ? { ...item, slug: cleanSlug } : item
    );
    onUpdateMediaList(updatedList);
    setAssetToRename(null);
    setNewSlugInput('');
  };

  // Filtering & Sorting
  const filteredList = mediaList.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name') return a.slug.localeCompare(b.slug);
    if (sortBy === 'size') return b.size - a.size;
    return 0;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-bn leading-tight">
                {isPickerMode ? pickerTitle : 'মিডিয়া লাইব্রেরি (Media Assets Manager)'}
              </h2>
              <p className="text-xs text-slate-400">
                Supabase Cloud Storage • স্বয়ংক্রিয় ক্লিন স্ল্যাগ (Auto Slugs) & পাবলিক URL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
                : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 hover:border-blue-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/x-icon,.ico"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-blue-600">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                নতুন ছবি আপলোড করতে ড্র্যাগ করুন অথবা ক্লিক করুন
              </p>
              <p className="text-xs text-slate-500 mt-1">
                অনুমোদিত ফরম্যাট: <span className="font-bold text-slate-700">PNG, JPG, WEBP, SVG, ICO</span> (সর্বোচ্চ ১০MB)
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>আপলোড হচ্ছে ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>কম্পিউটার থেকে ছবি বাছুন</span>
                </>
              )}
            </button>

            {uploadError && (
              <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Controls Bar: Search, View Mode, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ছবি খুঁজুন (নাম বা স্ল্যাগ দিয়ে)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">সর্ট:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value="newest">সর্বশেষ আপলোড</option>
                <option value="oldest">পুরাতন ফাইল</option>
                <option value="name">নাম (A-Z)</option>
                <option value="size">সাইজ (বড় থেকে ছোট)</option>
              </select>

              <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden Replace File Input */}
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleReplaceFile}
            className="hidden"
          />

          {/* Media Grid / List */}
          {sortedList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">কোনো ছবি পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">
                উপরের আপলোড বক্স ব্যবহার করে আপনার ব্র্যান্ডের ছবি যুক্ত করুন।
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedList.map((asset) => {
                const isSelected = selectedAssetUrl === asset.url;
                return (
                  <div
                    key={asset.id}
                    className={`group relative bg-white border rounded-2xl overflow-hidden transition-all shadow-2xs hover:shadow-md flex flex-col justify-between ${
                      isSelected ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Image Preview Box */}
                    <div className="relative aspect-square bg-slate-100 flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase truncate max-w-[100px]">
                          {asset.slug}
                        </span>
                        {isSelected && (
                          <span className="bg-blue-600 text-white p-1 rounded-full shadow-md">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Overlay Hover Actions */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {isPickerMode && onSelectMedia ? (
                          <button
                            onClick={() => {
                              onSelectMedia(asset);
                              onClose();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>সিলেক্ট করুন</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setPreviewAsset(asset)}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 transition"
                              title="প্রিভিউ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyUrl(asset.url, asset.id)}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-blue-700 transition"
                              title="Public URL কপি করুন"
                            >
                              {copiedId === asset.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setAssetToRename(asset);
                                setNewSlugInput(asset.slug);
                              }}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-amber-700 transition"
                              title="রি-নেম (স্ল্যাগ পরিবর্তন)"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setAssetToReplace(asset);
                                replaceFileInputRef.current?.click();
                              }}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-purple-700 transition"
                              title="রিপ্লেস ছবি"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              className="p-2 rounded-xl bg-white/90 hover:bg-white text-red-600 transition"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Details */}
                    <div className="p-2.5 bg-white border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                      <p className="font-bold text-slate-900 truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>{formatFileSize(asset.size)}</span>
                        <button
                          onClick={() => handleCopyUrl(asset.url, asset.id)}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          {copiedId === asset.id ? 'কপি হয়েছে!' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {sortedList.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{asset.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          slug: {asset.slug}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(asset.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPickerMode && onSelectMedia ? (
                      <button
                        onClick={() => {
                          onSelectMedia(asset);
                          onClose();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        সিলেক্ট
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopyUrl(asset.url, asset.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === asset.id ? 'কপি হয়েছে' : 'Copy URL'}</span>
                        </button>

                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="প্রিভিউ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setAssetToRename(asset);
                            setNewSlugInput(asset.slug);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-700 transition"
                          title="রি-নেম"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setAssetToDelete(asset)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>মোট ছবি: <strong className="text-slate-900">{mediaList.length}</strong> টি</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Preview Sub-Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 text-center shadow-2xl relative">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-black text-slate-900 text-base">ছবি প্রিভিউ</h3>
            <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center max-h-[300px] overflow-hidden">
              <img src={previewAsset.url} alt={previewAsset.name} className="max-h-[260px] object-contain rounded-lg" />
            </div>
            <div className="text-left text-xs space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 font-mono">
              <p><strong>Name:</strong> {previewAsset.name}</p>
              <p><strong>Slug:</strong> {previewAsset.slug}</p>
              <p><strong>Size:</strong> {formatFileSize(previewAsset.size)}</p>
              <p className="truncate"><strong>URL:</strong> {previewAsset.url}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={previewAsset.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1"
              >
                <span>লিংক ওপেন করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Sub-Modal */}
      {assetToRename && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-base">ছবি রি-নেম (স্ল্যাগ পরিবর্তন)</h3>
            <p className="text-xs text-slate-500">
              ক্লিন স্ল্যাগ ওয়েবসাইট লিংকে ব্যবহৃত হবে। কোনো স্পেস গ্রহণযোগ্য নয় (স্বয়ংক্রিয় হাইফেন হবে)।
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্লিন স্ল্যাগ:</label>
              <input
                type="text"
                value={newSlugInput}
                onChange={(e) => setNewSlugInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ফাইনাল স্ল্যাগ: <strong className="text-slate-700">{generateCleanSlug(newSlugInput)}</strong>
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssetToRename(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">ছবিটি মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500">
              <strong>"{assetToDelete.name}"</strong> স্থায়ীভাবে ডিলিট হয়ে যাবে। এটি পুনরুদ্ধার করা সম্ভব নয়।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
