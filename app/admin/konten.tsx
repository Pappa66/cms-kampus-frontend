import AdminLayout from "@/components/AdminLayout";
import PostUploadForm from "@/components/PostUploadForm";
import PostListAdmin from "@/components/PostListAdmin";

export default function KontenAdminPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Kelola Konten CMS</h1>
      <PostUploadForm onSuccess={() => window.location.reload()} />
      <PostListAdmin />
    </AdminLayout>
  );
}
