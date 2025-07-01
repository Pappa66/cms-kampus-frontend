import { notFound } from 'next/navigation';
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';

async function getPostData(postId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(`Gagal mengambil data untuk post ID: ${postId}`, error);
        return null;
    }
}

const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
        if (domNode instanceof Element && domNode.attribs) {
            if (domNode.name === 'figure' && domNode.attribs.class?.includes('media')) {
                const oembed = domNode.children.find(child => child.type === 'tag' && child.name === 'oembed') as Element | undefined;
                if (oembed?.attribs?.url) {
                    const url = oembed.attribs.url;
                    if (url.includes('youtube.com/watch')) {
                        const videoId = new URL(url).searchParams.get('v');
                        if (!videoId) return null;
                        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        return (
                            <div className="aspect-w-16 aspect-h-9 my-6">
                                <iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg" />
                            </div>
                        );
                    }
                }
            }
        }
    },
};

// Fungsi ini untuk mengatur judul tab browser dan deskripsi halaman
export async function generateMetadata({ params }: { params: { postId: string } }) {
    const post = await getPostData(params.postId);
    if (!post) {
        return { title: 'Halaman Tidak Ditemukan' };
    }
    const description = post.content.substring(0, 160).replace(/<[^>]*>?/gm, '');
    return {
        title: `${post.title} - STISIP Syamsul Ulum`,
        description: description,
    };
}

// Komponen Halaman Utama
export default async function PublicPostPage({ params }: { params: { postId: string } }) {
    const post = await getPostData(params.postId);
    if (!post) {
        notFound();
    }
    return (
        <main className="bg-white">
            <div className="container mx-auto py-8 px-4 sm:py-12">
                <article className="prose prose-xl max-w-none">
                    <h1>{post.title}</h1>
                    {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-auto" />}
                    <div>{parse(post.content || '', parserOptions)}</div>
                </article>
            </div>
        </main>
    );
}