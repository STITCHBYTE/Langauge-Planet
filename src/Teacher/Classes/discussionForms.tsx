import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../Component/Home/Sidebar.tsx';
import Header from '../../Component/Home/Header.tsx';
import Server_url from '../../config.js';
import { toast } from 'react-toastify';
import { FiSend, FiArrowLeft, FiMessageCircle, FiUser, FiClock } from 'react-icons/fi';

interface Reply {
  id: number;
  thread: number;
  parent: number | null;
  author: { username: string };
  message: string;
  created_at: string;
}

interface Thread {
  id: number;
  classroom: string;
  author: { username: string };
  title: string;
  message: string;
  created_at: string;
  replies: Reply[];
}

interface Discussion {
    id: string;
    title: string;
    description: string;
    classroom: string;
}

const DiscussionForum: React.FC = () => {
    const { discussionId } = useParams<{ discussionId: string }>();
    const navigate = useNavigate();
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newReplyContent, setNewReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }
        try {
            const discussionRes = await fetch(`${Server_url}/api/classrooms/discussions/${discussionId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!discussionRes.ok) throw new Error('Failed to fetch discussion details.');
            const discussionData = await discussionRes.json();
            setDiscussion(discussionData);

            const threadsRes = await fetch(`${Server_url}/api/forums/discussion/${discussionId}/threads/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (threadsRes.status === 404) {
                setThreads([]);
            } else if (threadsRes.ok) {
                const threadsData = await threadsRes.json();
                const threadsWithReplies = await Promise.all(threadsData.map(async (thread: Thread) => {
                    const repliesRes = await fetch(`${Server_url}/api/forums/thread/${thread.id}/replies/`, {
                         headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const repliesData = repliesRes.ok ? await repliesRes.json() : [];
                    return { ...thread, replies: repliesData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) };
                }));
                setThreads(threadsWithReplies);
            } else {
                throw new Error('Failed to fetch forum threads.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (discussionId) {
            fetchData();
        }
    }, [discussionId]);

    const handleCreateThread = async (e: FormEvent) => {
        e.preventDefault();
        if (!newThreadContent.trim() || !discussionId) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Server_url}/api/forums/thread/start/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discussion: discussionId,
                    title: discussion?.title ?? "Discussion Thread",
                    message: newThreadContent
                })
            });
            if (!response.ok) throw new Error('Failed to create thread.');
            await fetchData();
            setNewThreadContent('');
            toast.success("Thread created successfully!");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleCreateReply = async (e: FormEvent) => {
        e.preventDefault();
        const mainThread = threads[0];
        if (!newReplyContent.trim() || !mainThread) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Server_url}/api/forums/threads/${mainThread.id}/replies/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newReplyContent })
            });
            if (!response.ok) throw new Error('Failed to post reply.');
            await fetchData();
            setNewReplyContent('');
            toast.success("Reply posted!");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error: {error}</div>;

    const mainThread = threads.length > 0 ? threads[0] : null;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-[17%]">
                <Header />
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 font-medium">
                            <FiArrowLeft />
                            Back to Class Info
                        </button>

                        {mainThread ? (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{mainThread.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-gray-400" />
                                            <span>Posted by <span className="font-semibold text-gray-700">{mainThread.author?.username ?? 'Anonymous'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiClock className="text-gray-400" />
                                            <span>{new Date(mainThread.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                                    {mainThread.message}
                                </div>
                                <div className="p-6 bg-gray-50 rounded-b-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FiMessageCircle />
                                        {mainThread.replies.length} {mainThread.replies.length === 1 ? 'Reply' : 'Replies'}
                                    </h2>
                                    <div className="space-y-5">
                                        {mainThread.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-4">
                                                <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                                    {(reply.author?.username ?? 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="font-semibold text-sm text-gray-800">{reply.author?.username ?? 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1">{reply.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <form onSubmit={handleCreateReply} className="mt-6 pt-6 border-t border-gray-200">
                                        <textarea
                                            placeholder="Add your reply..."
                                            value={newReplyContent}
                                            onChange={e => setNewReplyContent(e.target.value)}
                                            className="w-full border rounded-lg p-3 text-sm mb-3 focus:ring-blue-500 focus:border-blue-500 transition"
                                            rows={3}
                                            required
                                        />
                                        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                                            <FiSend /> Post Reply
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Start the Discussion</h2>
                                <p className="text-sm text-gray-500 mb-4">Post the main topic or question for this discussion. Only one thread can be created.</p>
                                <form onSubmit={handleCreateThread}>
                                    <textarea
                                        placeholder="Enter the main discussion topic here..."
                                        value={newThreadContent}
                                        onChange={e => setNewThreadContent(e.target.value)}
                                        className="w-full border rounded-lg p-3 text-sm mb-3 focus:ring-blue-500 focus:border-blue-500"
                                        rows={5}
                                        required
                                    />
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                                        Create Thread
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DiscussionForum;