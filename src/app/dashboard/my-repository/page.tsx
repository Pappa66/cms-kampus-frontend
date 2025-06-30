'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, CheckCircle, Clock, X, UploadCloud, Edit } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

interface RepoItem { id: string; title: string; author: string; year: number; status: 'PUBLISHED' | 'PRIVATE'; }
interface FileToUpload { file: File; alias: string; }

export default function MyRepositoryPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<RepoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);

  const fetchMyItems = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-repository`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Gagal memuat data.');
        const data = await res.json();
        setItems(data);
    } catch(err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchMyItems();
  }, [token, router, fetchMyItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, alias: file.name.split('.').slice(0, -1).join('.') }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  };
  const handleAliasChange = (index: number, newAlias: string) => {
    setFilesToUpload(prev => prev.map((item, i) => i === index ? { ...item, alias: newAlias } : item));
  };
  const handleRemoveFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (filesToUpload.length === 0) { alert('Unggah minimal satu file.'); return; }
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const filesMetadata = filesToUpload.map(f => ({ originalName: f.file.name, alias: f.alias }));
    formData.append('filesMetadata', JSON.stringify(filesMetadata));
    filesToUpload.forEach(f => formData.append('files', f.file));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-repository`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!res.ok) throw new Error('Gagal mengunggah karya ilmiah.');
      alert('Karya ilmiah berhasil diunggah dan sedang menunggu review.');
      setShowUploadModal(false);
      setFilesToUpload([]);
      fetchMyItems();
    } catch (err: any) { alert(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const dataToUpdate = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-repository/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(dataToUpdate)
        });
        if (!res.ok) throw new Error('Gagal memperbarui item.');
        alert('Item berhasil diperbarui.');
        setShowEditModal(false);
        setEditingItem(null);
        fetchMyItems();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container py-12 text-center">Memuat data karya ilmiah Anda...</div>;

  return (
    <>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Karya Ilmiah Saya</h1>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <PlusCircle size={18} /> Unggah Baru
          </button>
        </div>
        <div className="space-y-4">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.author} • {item.year}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {item.status === 'PUBLISHED' ? (
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={16}/> Dipublikasikan</span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600"><Clock size={16}/> Menunggu Review</span>
                  )}
                </div>
                {item.status === 'PRIVATE' && (
                  <button onClick={() => { setEditingItem(item); setShowEditModal(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                    <Edit size={16}/>
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center p-16 bg-white rounded-lg border-dashed border-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400"/>
              <h3 className="mt-4 text-lg font-semibold">Anda Belum Mengunggah Apapun</h3>
              <p className="mt-1 text-gray-500">Klik tombol "Unggah Baru" untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
      
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 text-gray-800">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Unggah Karya Ilmiah Baru</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-4">Informasi Dasar</h3>
                <div className="space-y-4">
                    <input name="title" placeholder="Judul Skripsi/Tesis" required className="w-full p-2 border rounded" />
                    <div className="grid md:grid-cols-3 gap-4">
                        <input name="author" placeholder="Penulis" required className="w-full p-2 border rounded" />
                        <input name="year" type="number" placeholder="Tahun" required className="w-full p-2 border rounded" />
                        <input name="studyProgram" placeholder="Program Studi" required className="w-full p-2 border rounded" />
                    </div>
                    <input name="advisor" placeholder="Dosen Pembimbing" required className="w-full p-2 border rounded" />
                    <textarea name="abstract" placeholder="Abstrak" rows={5} className="w-full p-2 border rounded" />
                    <input name="keywords" placeholder="Kata Kunci (pisahkan dengan koma)" className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">Unggah File</h3>
                <p className="text-xs text-gray-500 mb-4">Anda bisa mengunggah beberapa file (misal: Cover, Bab 1, dll). Beri nama alias yang jelas.</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <label htmlFor="file-upload" className="mt-2 block font-semibold text-blue-600 cursor-pointer">Pilih file PDF</label>
                    <input id="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="application/pdf" />
                </div>
                {filesToUpload.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {filesToUpload.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
                                <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />
                                <div className="flex-grow">
                                    <label className="text-xs font-medium">Alias File (Nama yang Tampil)</label>
                                    <input type="text" value={item.alias} onChange={(e) => handleAliasChange(index, e.target.value)} className="w-full p-1 border rounded text-sm"/>
                                </div>
                                <p className="text-xs text-gray-500 flex-shrink-0">{Math.round(item.file.size / 1024)} KB</p>
                                <button type="button" onClick={() => handleRemoveFile(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><X size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded border bg-white hover:bg-gray-100">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400">
                  {isSubmitting ? <Spinner /> : 'Kirim untuk Direview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 text-gray-800">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Karya Ilmiah</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-4">Informasi Dasar</h3>
                <div className="space-y-4">
                    <input name="title" defaultValue={editingItem.title} required className="w-full p-2 border rounded" />
                    <div className="grid md:grid-cols-3 gap-4">
                        <input name="author" defaultValue={editingItem.author} required className="w-full p-2 border rounded" />
                        <input name="year" type="number" defaultValue={editingItem.year} required className="w-full p-2 border rounded" />
                        <input name="studyProgram" defaultValue={editingItem.studyProgram} required className="w-full p-2 border rounded" />
                    </div>
                    <input name="advisor" defaultValue={editingItem.advisor} required className="w-full p-2 border rounded" />
                    <textarea name="abstract" defaultValue={editingItem.abstract} placeholder="Abstrak" rows={5} className="w-full p-2 border rounded" />
                    <input name="keywords" defaultValue={editingItem.keywords} placeholder="Kata Kunci (pisahkan dengan koma)" className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded border bg-white hover:bg-gray-100">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400">
                  {isSubmitting ? <Spinner /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
