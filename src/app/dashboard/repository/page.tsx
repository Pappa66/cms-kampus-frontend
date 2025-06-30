'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { Edit, Trash2, Plus, Search, Eye, UploadCloud, X, File as FileIcon } from 'lucide-react';

interface RepoItem { id: string; title: string; author: string; studyProgram: string; status: 'PUBLISHED' | 'PRIVATE'; publishedAt: string | null; }
interface FileToUpload { file: File; alias: string; }

export default function RepoManagementPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [items, setItems] = useState<RepoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [year, setYear] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<'PRIVATE' | 'PUBLISHED'>('PRIVATE');
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);

  const fetchAdminItems = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repository-items/admin`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal memuat data.');
        const data = await res.json();
        setItems(data);
    } catch(err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) router.replace('/login');
    else fetchAdminItems();
  }, [token, router, fetchAdminItems]);
  
  const resetForm = () => {
      setTitle(''); setAuthor(''); setAdvisor(''); setYear(''); 
      setStudyProgram(''); setAbstract(''); setKeywords(''); 
      setStatus('PRIVATE'); setFilesToUpload([]);
  };

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
    if (filesToUpload.length === 0) { alert('Silakan unggah minimal satu file.'); return; }
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('advisor', advisor);
    formData.append('year', year);
    formData.append('studyProgram', studyProgram);
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('status', status);
    
    const filesMetadata = filesToUpload.map(f => ({ originalName: f.file.name, alias: f.alias }));
    formData.append('filesMetadata', JSON.stringify(filesMetadata));
    filesToUpload.forEach(f => { formData.append('files', f.file); });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repository-items`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!res.ok) throw new Error('Gagal menambah item.');
      alert('Item baru berhasil dibuat!');
      setShowCreateModal(false);
      resetForm();
      fetchAdminItems();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repository-items/${itemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Item berhasil dihapus.');
        fetchAdminItems();
    } catch (err) {
        alert('Gagal menghapus item.');
    }
  };

  if (isLoading) return <div className="text-center py-12">Memuat data repositori...</div>;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Repository</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Plus size={18} /> Tambah
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-gray-600">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Judul</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Status: {item.status}</div>
                  </td>
                  <td className="px-6 py-4">{item.studyProgram}</td>
                  <td className="px-6 py-4">{item.author}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/repository/${item.id}`} target="_blank" className="p-2 text-gray-600 hover:bg-gray-100 rounded-md" title="Lihat Halaman Publik"><Eye size={16} /></Link>
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && !isLoading && (
            <div className="text-center p-16 text-gray-500">
              <h3 className="text-lg font-semibold">Belum Ada Data Repository</h3>
              <p className="mt-2">Silakan klik tombol "Tambah" untuk mulai mengisi konten.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Tambah Item Repository Baru</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Dasar</h3>
                <div className="space-y-4">
                  <div><label className="font-medium">Judul Karya Ilmiah</label><input value={title} onChange={e => setTitle(e.target.value)} required className="w-full mt-1 p-2 border rounded"/></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="font-medium">Penulis Utama</label><input value={author} onChange={e => setAuthor(e.target.value)} required className="w-full mt-1 p-2 border rounded"/></div>
                    <div><label className="font-medium">Dosen Pembimbing</label><input value={advisor} onChange={e => setAdvisor(e.target.value)} className="w-full mt-1 p-2 border rounded"/></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="font-medium">Program Studi</label><input value={studyProgram} onChange={e => setStudyProgram(e.target.value)} required className="w-full mt-1 p-2 border rounded"/></div>
                    <div><label className="font-medium">Tahun Terbit</label><input value={year} onChange={e => setYear(e.target.value)} type="number" required className="w-full mt-1 p-2 border rounded"/></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Abstrak & Kata Kunci</h3>
                <div className="space-y-4">
                   <div><label className="font-medium">Abstrak</label><textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={6} className="w-full mt-1 p-2 border rounded"/></div>
                   <div><label className="font-medium">Kata Kunci (pisahkan dengan koma)</label><input value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full mt-1 p-2 border rounded"/></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unggah File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <label htmlFor="file-upload" className="mt-2 block font-semibold text-brand-blue cursor-pointer">Pilih file untuk diunggah</label>
                    <input id="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="application/pdf" />
                </div>
                {filesToUpload.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold">File yang akan diunggah:</h3>
                    {filesToUpload.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                            <div className="flex-grow"><label className="text-sm font-medium">Alias File (Nama yang Tampil)</label><input type="text" value={item.alias} onChange={(e) => handleAliasChange(index, e.target.value)} className="w-full p-1 border rounded text-sm"/></div>
                            <p className="text-xs text-gray-500 flex-shrink-0">{Math.round(item.file.size / 1024)} KB</p>
                            <button type="button" onClick={() => handleRemoveFile(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><X size={16}/></button>
                        </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Publikasi</h3>
                <div>
                  <label className="font-medium">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full mt-1 p-2 border rounded">
                    <option value="PRIVATE">Private (Simpan sebagai Draf)</option>
                    <option value="PUBLISHED">Published (Tampilkan untuk publik)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded border">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                  {isSubmitting ? <Spinner /> : 'Simpan Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
