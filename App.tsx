import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Post, View, Platform, HashtagGroup, UserData, PaymentData, Subscription, StaffMember } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import usePostsStorage from './hooks/usePostsStorage';
import { useUsageTracker } from './hooks/useUsageTracker';
import PostModal from './components/PostModal';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import AuthPage from './components/AuthPage';
import ConnectAccountsPage from './components/ConnectAccountsPage';
import PostDetailModal from './components/PostDetailModal';
import ConfirmationModal from './components/ConfirmationModal';
import ProfileModal from './components/ProfileModal';
import DeleteHashtagGroupModal from './components/DeleteHashtagGroupModal';
import UpgradePage from './components/UpgradePage';
import UpgradeModal from './components/UpgradeModal';
import LoadingSpinner from './components/LoadingSpinner';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const StaffManagementModal = lazy(() => import('./components/admin/StaffManagementModal'));

const App: React.FC = () => {
  const [posts, setPosts] = usePostsStorage('social-scheduler-posts', []);
  const [hashtagGroups, setHashtagGroups] = useLocalStorage<HashtagGroup[]>('social-scheduler-hashtags', []);
  const [view, setView] = useState<View>(View.CALENDAR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [groupToDeleteId, setGroupToDeleteId] = useState<string | null>(null);
  
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);


  const [currentUser, setCurrentUser] = useLocalStorage<UserData | null>('social-scheduler-current-user', null);
  const [, setStaff] = useLocalStorage<StaffMember[]>('admin-staff-list', []);
  const [hasSkippedConnectionStep, setHasSkippedConnectionStep] = useLocalStorage('social-scheduler-skipped-connection', false);
  const [connectedPlatforms, setConnectedPlatforms] = useLocalStorage<Platform[]>('social-scheduler-connected-platforms', []);
  const [paymentData, setPaymentData] = useLocalStorage<PaymentData>('social-scheduler-payment-data', {
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    cardNumber: '',
  });
  const [subscription, setSubscription] = useLocalStorage<Subscription | null>('social-scheduler-subscription', null);

  const { canCreatePost, canGenerateText, canGenerateImages, incrementPostCount, incrementAiGenerationCount, incrementImageGenerationCount, usage, isFreemiumPlan } = useUsageTracker(subscription);

  const handleUpgradeRequest = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setIsUpgradeModalOpen(true);
  }, []);

  const getPermissions = useCallback(() => {
    const currentSubscription = subscription || { package: 0, hasAiAddon: false };
    
    let allowedPlatforms: Platform[] = [];
    switch(currentSubscription.package) {
      case 0: // Freemium
        allowedPlatforms = [Platform.INSTAGRAM, Platform.FACEBOOK];
        break;
      case 1:
        allowedPlatforms = [Platform.INSTAGRAM, Platform.FACEBOOK];
        break;
      case 2:
        allowedPlatforms = [Platform.INSTAGRAM, Platform.FACEBOOK, Platform.TIKTOK];
        break;
      case 3:
      case 4: // Pro
        allowedPlatforms = [Platform.INSTAGRAM, Platform.FACEBOOK, Platform.TIKTOK, Platform.YOUTUBE];
        break;
      default:
        allowedPlatforms = [];
    }
    
    return {
      allowedPlatforms,
    };
  }, [subscription]);

  const permissions = getPermissions();


  const handleOpenModal = useCallback((post: Post | null) => {
    setEditingPost(post);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingPost(null);
    setIsModalOpen(false);
  }, []);

  const handleSavePost = (postData: Post) => {
    const isExistingPost = posts.some(p => p.id === postData.id);
    
    if (isExistingPost) {
      // This is a true edit of an existing post.
      setPosts(prevPosts =>
        prevPosts.map(p => (p.id === postData.id ? postData : p))
      );
    } else {
      // This is a new post (either from scratch or a clone).
      if (!canCreatePost) {
        handleUpgradeRequest("post_limit");
        return;
      }
      incrementPostCount();
      setPosts(prevPosts => [...prevPosts, postData]);
    }
    handleCloseModal();
  };
  
  const handleSaveHashtagGroup = useCallback((group: Omit<HashtagGroup, 'id'>) => {
    const newGroup = { ...group, id: crypto.randomUUID() };
    setHashtagGroups(prev => [...prev, newGroup]);
    return true; // Indicate success
  }, [setHashtagGroups]);

  const handleDeletePost = (id: string) => {
    setPostToDeleteId(id);
  };
  
  const handleDeleteHashtagGroup = (id: string) => {
    setIsDeleteGroupModalOpen(false);
    setGroupToDeleteId(id);
  };

  const handleClonePost = (postToClone: Post) => {
    if (!canCreatePost) {
        handleUpgradeRequest("post_limit");
        return;
    }

    const clonedPost = {
      ...postToClone,
      id: crypto.randomUUID(),
      status: 'scheduled' as const,
    };
    
    handleOpenModal(clonedPost);
  };
  
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
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'financeiro')) {
        setStaff(prevStaff => {
            return prevStaff.map(member => {
                if (member.email === currentUser.email) {
                    const lastLogIndex = member.accessLogs.length - 1;
                    if (lastLogIndex >= 0 && !member.accessLogs[lastLogIndex].logoutTime) {
                        const updatedLogs = [...member.accessLogs];
                        updatedLogs[lastLogIndex] = {
                            ...updatedLogs[lastLogIndex],
                            logoutTime: new Date().toISOString()
                        };
                        return { ...member, accessLogs: updatedLogs };
                    }
                }
                return member;
            });
        });
    }

    setCurrentUser(null);
    setHasSkippedConnectionStep(false);
    setConnectedPlatforms([]);
    setPosts([]);
    setSubscription(null);
    setPaymentData({ cpf: '', cep: '', address: '', number: '', complement: '', district: '', city: '', state: '', cardNumber: '' });
    localStorage.removeItem('social-scheduler-user-data');
    localStorage.removeItem('social-scheduler-usage');
  }
  
  const handleLoginSuccess = (user: UserData, newSubscription: Subscription) => {
    setCurrentUser(user);
    setSubscription(newSubscription);
  };

  const handleAdminLogin = (email: string, role: 'admin' | 'financeiro') => {
     setCurrentUser({
        fullName: role === 'admin' ? 'Admin Master' : 'Usuário Financeiro',
        email: email,
        birthDate: '',
        role: role,
    });
     setStaff(prevStaff => {
        return prevStaff.map(member => {
            if (member.email === email) {
                const newLog = { loginTime: new Date().toISOString() };
                return { ...member, accessLogs: [...member.accessLogs, newLog] };
            }
            return member;
        });
    });
  };

  const handleTestUserLogin = () => {
    setCurrentUser({
        fullName: 'Usuário de Teste',
        email: 'teste@gmail.com',
        birthDate: '2000-01-01',
        role: 'user',
    });
    setPaymentData({
        cpf: '123.456.789-00',
        cep: '90210-000',
        address: 'Avenida dos Testes',
        number: '123',
        complement: 'Sala 42',
        district: 'Bairro Beta',
        city: 'Porto Alegre',
        state: 'RS',
        cardNumber: '4242424242424242',
    });
    setSubscription({
        package: 3,
        hasAiAddon: true,
    });
    setConnectedPlatforms(Object.values(Platform));
    setHasSkippedConnectionStep(true);
  };

  const handleConfirmUpgrade = () => {
    setIsUpgradeModalOpen(false);
    setIsUpgrading(true);
  };
  
  let pageContent;

  if (isUpgrading) {
    pageContent = <UpgradePage onUpgradeSuccess={(newSub) => {
        setSubscription(newSub);
        setIsUpgrading(false);
    }} />;
  } else if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'financeiro')) {
    pageContent = (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
          <LoadingSpinner />
        </div>
      }>
        <AdminPanel userRole={currentUser.role} onLogout={handleLogout} onOpenSettings={() => setIsStaffModalOpen(true)} />
      </Suspense>
    );
  } else if (!currentUser) {
    pageContent = <AuthPage 
        onLoginSuccess={handleLoginSuccess} 
        onAdminLoginSuccess={handleAdminLogin}
        onTestUserLogin={handleTestUserLogin} 
    />;
  } else if (!hasSkippedConnectionStep) {
    pageContent = <ConnectAccountsPage 
      onContinue={() => setHasSkippedConnectionStep(true)} 
      connectedPlatforms={connectedPlatforms}
      setConnectedPlatforms={setConnectedPlatforms}
      allowedPlatforms={permissions.allowedPlatforms}
      onUpgradeRequest={() => handleUpgradeRequest('platform')}
    />;
  } else {
    pageContent = (
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            allowedPlatforms={permissions.allowedPlatforms}
            canGenerateImages={canGenerateImages}
            onUpgradeRequest={handleUpgradeRequest}
            canGenerateText={canGenerateText}
            incrementAiGenerationCount={incrementAiGenerationCount}
            incrementImageGenerationCount={incrementImageGenerationCount}
            userApiKey={currentUser?.geminiApiKey}
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

        {isProfileModalOpen && currentUser && (
          <ProfileModal 
            initialUserData={currentUser}
            initialPaymentData={paymentData}
            initialSubscription={subscription || { package: 0, hasAiAddon: false }}
            usageData={usage}
            isFreemium={isFreemiumPlan}
            onSave={(newUserData, newPaymentData, newSubscription) => {
              setCurrentUser(newUserData);
              setPaymentData(newPaymentData);
              if(newSubscription) setSubscription(newSubscription);
            }}
            onClose={() => setIsProfileModalOpen(false)}
            onUpgradePlan={() => {
              setIsProfileModalOpen(false);
              setIsUpgrading(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {pageContent}

      {isUpgradeModalOpen && (
        <UpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
            onUpgrade={handleConfirmUpgrade}
            reason={upgradeReason}
        />
      )}
      {isStaffModalOpen && (
         <Suspense fallback={<div />}>
            <StaffManagementModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
            />
         </Suspense>
      )}
    </>
  );
};

export default App;
