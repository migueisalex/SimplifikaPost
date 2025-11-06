import React, { useState, useCallback } from 'react';
import { Post, View, Platform, HashtagGroup, UserData, PaymentData } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import PostModal from './components/PostModal';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import AuthPage from './components/AuthPage';
import ConnectAccountsPage from './components/ConnectAccountsPage';
import PostDetailModal from './components/PostDetailModal';
import ConfirmationModal from './components/ConfirmationModal';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/admin/AdminPanel';
import DeleteHashtagGroupModal from './components/DeleteHashtagGroupModal';


const App: React.FC = () => {
  const [posts, setPosts] = useLocalStorage<Post[]>('social-scheduler-posts', []);
  const [hashtagGroups, setHashtagGroups] = useLocalStorage<HashtagGroup[]>('social-scheduler-hashtags', []);
  const [view, setView] = useState<View>(View.CALENDAR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [groupToDeleteId, setGroupToDeleteId] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('social-scheduler-auth', false);
  const [isAdmin, setIsAdmin] = useLocalStorage('social-scheduler-is-admin', false);
  const [hasSkippedConnectionStep, setHasSkippedConnectionStep] = useLocalStorage('social-scheduler-skipped-connection', false);
  const [connectedPlatforms, setConnectedPlatforms] = useLocalStorage<Platform[]>('social-scheduler-connected-platforms', []);
  const [userData, setUserData] = useLocalStorage<UserData>('social-scheduler-user-data', {
    fullName: '',
    email: 'usuario@simplifika.post', // Mock email as it would be set on sign-up
    birthDate: '',
  });
  const [paymentData, setPaymentData] = useLocalStorage<PaymentData>('social-scheduler-payment-data', {
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
  });

  const handleOpenModal = (post: Post | null) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setEditingPost(null);
    setIsModalOpen(false);
  }, []);

  const handleSavePost = useCallback((post: Post) => {
    setPosts(prevPosts => {
      const postExists = prevPosts.some(p => p.id === post.id);
      if (postExists) {
        return prevPosts.map(p => (p.id === post.id ? post : p));
      }
      return [...prevPosts, post];
    });
    setView(View.CALENDAR);
    handleCloseModal();
  }, [handleCloseModal, setPosts]);
  
  const handleSaveHashtagGroup = useCallback((group: Omit<HashtagGroup, 'id'>) => {
    const newGroup = { ...group, id: crypto.randomUUID() };
    setHashtagGroups(prev => [...prev, newGroup]);
    return true; // Indicate success
  }, [setHashtagGroups]);

  const handleDeletePost = (id: string) => {
    setPostToDeleteId(id);
  };
  
  const handleDeleteHashtagGroup = (id: string) => {
    setIsDeleteGroupModalOpen(false); // Close list modal
    setGroupToDeleteId(id); // Set ID to trigger confirmation modal
  };

  const handleClonePost = useCallback((postToClone: Post) => {
    const clonedPost = {
      ...postToClone,
      id: crypto.randomUUID(), // New ID makes it a new post
      status: 'scheduled' as const,
      // Set date to now, forcing user to pick a new future date
      scheduledAt: new Date().toISOString(), 
    };
    handleOpenModal(clonedPost);
  }, []);
  
  const handleEditPostFromDetail = (post: Post) => {
    setViewingPost(null);
    handleOpenModal(post);
  };

  const handleClonePostFromDetail = (post: Post) => {
    setViewingPost(null);
    handleClonePost(post);
  };

  const handleDeletePostFromDetail = (id: string) => {
    setPostToDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (postToDeleteId) {
      setPosts(prevPosts => prevPosts.filter((p) => p.id !== postToDeleteId));
      if (viewingPost?.id === postToDeleteId) {
        setViewingPost(null);
      }
      setPostToDeleteId(null);
    }
  };
  
  const handleConfirmDeleteGroup = () => {
    if (groupToDeleteId) {
      setHashtagGroups(prevGroups => prevGroups.filter((g) => g.id !== groupToDeleteId));
      setGroupToDeleteId(null);
    }
  };

  const handleStatusChange = useCallback((id: string, status: 'scheduled' | 'published') => {
    setPosts(prevPosts => prevPosts.map(p => p.id === id ? {...p, status} : p));
  }, [setPosts]);
  
  const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasSkippedConnectionStep(false);
    setConnectedPlatforms([]);
    setPosts([]); // Clear posts on logout
    setIsAdmin(false);
  }

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true); // Admin is also an authenticated user
  };
  
  if (isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} onAdminLoginSuccess={handleAdminLogin} />;
  }
  
  if (!hasSkippedConnectionStep) {
    return <ConnectAccountsPage 
      onContinue={() => setHasSkippedConnectionStep(true)} 
      connectedPlatforms={connectedPlatforms}
      setConnectedPlatforms={setConnectedPlatforms}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-dark-card shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white font-exo2 uppercase tracking-wider">
            Simplifika Post
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border p-2 rounded-full transition-colors duration-200"
              aria-label="Abrir Perfil"
              title="Perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={() => handleOpenModal(null)}
              className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Novo Post</span>
            </button>
             <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center"
              aria-label="Sair"
              title="Sair"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-center sm:justify-start bg-gray-200 dark:bg-dark-card p-1 rounded-lg shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setView(View.CALENDAR)}
            className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${view === View.CALENDAR ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-border'}`}
          >
            Calendário
          </button>
          <button
            onClick={() => setView(View.LIST)}
            className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${view === View.LIST ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-border'}`}
          >
            Lista
          </button>
        </div>

        <div>
          {view === View.CALENDAR ? (
            <CalendarView posts={posts} onSelectPost={setViewingPost} />
          ) : (
            <ListView posts={sortedPosts} onEdit={handleOpenModal} onDelete={handleDeletePost} onStatusChange={handleStatusChange} onClone={handleClonePost} />
          )}
        </div>
      </main>

      {isModalOpen && (
        <PostModal
          post={editingPost}
          onSave={handleSavePost}
          onClose={handleCloseModal}
          connectedPlatforms={connectedPlatforms}
          onConnectPlatform={(platform) => {
              if (!connectedPlatforms.includes(platform)) {
                  setConnectedPlatforms([...connectedPlatforms, platform]);
              }
          }}
          hashtagGroups={hashtagGroups}
          onSaveHashtagGroup={handleSaveHashtagGroup}
          onOpenDeleteGroupModal={() => setIsDeleteGroupModalOpen(true)}
        />
      )}
      
      {viewingPost && (
        <PostDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onEdit={handleEditPostFromDetail}
          onClone={handleClonePostFromDetail}
          onDelete={handleDeletePostFromDetail}
        />
      )}

      {isDeleteGroupModalOpen && (
        <DeleteHashtagGroupModal
          isOpen={isDeleteGroupModalOpen}
          onClose={() => setIsDeleteGroupModalOpen(false)}
          hashtagGroups={hashtagGroups}
          onDelete={handleDeleteHashtagGroup}
        />
      )}

      <ConfirmationModal
        isOpen={postToDeleteId !== null}
        onClose={() => setPostToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Post"
        message="Você tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmButtonText="Excluir Definitivamente"
      />

      <ConfirmationModal
        isOpen={groupToDeleteId !== null}
        onClose={() => setGroupToDeleteId(null)}
        onConfirm={handleConfirmDeleteGroup}
        title="Excluir Grupo de Hashtags"
        message="Você tem certeza que deseja excluir este grupo de hashtags? Esta ação não pode ser desfeita."
        confirmButtonText="Excluir Definitivamente"
      />

      {isProfileModalOpen && (
        <ProfileModal 
          initialUserData={userData}
          initialPaymentData={paymentData}
          onSave={(newUserData, newPaymentData) => {
            setUserData(newUserData);
            setPaymentData(newPaymentData);
          }}
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;