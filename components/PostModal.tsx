import React, { useState, useEffect, useCallback } from 'react';
import { Post, Platform, PostType, MediaItem, HashtagGroup } from '../types';
import { PlatformIcons } from './PlatformIcons';
import ImageCropper from './ImageCropper';
import ConnectAccountModal from './ConnectAccountModal';
import CarouselPreview from './CarouselPreview';
import GeminiIcon from './GeminiIcon';
import Tooltip from './Tooltip';
import SuggestionsModal from './SuggestionsModal';
import HashtagModal from './HashtagModal';
import ImageGenerationModal from './ImageGenerationModal';
import LoadingSpinner from './LoadingSpinner';

interface PostModalProps {
  post: Post | null;
  onSave: (post: Post) => void;
  onClose: () => void;
  connectedPlatforms: Platform[];
  onConnectPlatform: (platform: Platform) => void;
  hashtagGroups: HashtagGroup[];
  onSaveHashtagGroup: (group: Omit<HashtagGroup, 'id'>) => boolean;
  onOpenDeleteGroupModal: () => void;
  allowedPlatforms: Platform[];
  canGenerateImages: boolean;
  onUpgradeRequest: (reason: string) => void;
  canGenerateText: boolean;
  incrementAiGenerationCount: () => void;
}

const appendHashtags = (currentContent: string, newHashtags: string): string => {
    const separator = '\n\n.\n.\n.\n\n';
    const contentParts = currentContent.split(separator);
    const newHashtagSet = newHashtags.trim();

    if (contentParts.length > 1) {
        // Hashtags already exist
        const mainContent = contentParts[0].trim();
        const existingHashtags = contentParts.slice(1).join(separator).trim();
        if (existingHashtags) {
            return `${mainContent}${separator}${existingHashtags} ${newHashtagSet}`;
        }
        return `${mainContent}${separator}${newHashtagSet}`;
    } else {
        // No hashtags yet
        const mainContent = currentContent.trim();
        if (mainContent) {
          return `${mainContent}${separator}${newHashtagSet}`;
        }
        return newHashtagSet; // If no content at all, just return the hashtags
    }
};


const PostModal: React.FC<PostModalProps> = ({ post, onSave, onClose, connectedPlatforms, onConnectPlatform, hashtagGroups, onSaveHashtagGroup, onOpenDeleteGroupModal, allowedPlatforms, canGenerateImages, onUpgradeRequest, canGenerateText, incrementAiGenerationCount }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [postType, setPostType] = useState<PostType>(PostType.FEED);
  const [croppingItem, setCroppingItem] = useState<MediaItem | null>(null);
  const [postAspectRatio, setPostAspectRatio] = useState<number>(1);
  const [croppingAspectRatio, setCroppingAspectRatio] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledHour, setScheduledHour] = useState('12');
  const [scheduledMinute, setScheduledMinute] = useState('00');
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isHashtagModalOpen, setIsHashtagModalOpen] = useState(false);
  const [isImageGenerationModalOpen, setIsImageGenerationModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [textForAISuggestion, setTextForAISuggestion] = useState('');
  const [aiHashtagsApplied, setAiHashtagsApplied] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const checkImageNeedsCrop = useCallback((imageUrl: string, targetRatio: number): Promise<boolean> => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const imageAspectRatio = img.width / img.height;
            resolve(Math.abs(imageAspectRatio - targetRatio) > 0.01);
        };
        img.src = imageUrl;
    });
  }, []);

  const handleAspectRatioChange = useCallback(async (ratio: number) => {
    setPostAspectRatio(ratio);
    
    if (media.length > 0) {
        const updatedMedia = await Promise.all(media.map(async (item) => {
            if (item.type.startsWith('image/')) {
                const needsCrop = await checkImageNeedsCrop(item.originalUrl, ratio);
                return { ...item, needsCrop, aspectRatio: ratio };
            }
            return item;
        }));
        setMedia(updatedMedia);
    }
  }, [media, checkImageNeedsCrop]);


  useEffect(() => {
    if (post) {
      setContent(post.content);
      setPlatforms(post.platforms);
      setPostType(post.postType);
      
      const postDate = new Date(post.scheduledAt);
      const year = postDate.getFullYear();
      const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
      const day = postDate.getDate().toString().padStart(2, '0');
      
      setScheduledDate(`${year}-${month}-${day}`);
      setScheduledHour(postDate.getHours().toString().padStart(2, '0'));
      setScheduledMinute(postDate.getMinutes().toString().padStart(2, '0'));

      setMedia(post.media);
      if (post.media.length > 0) {
        setPostAspectRatio(post.media[0].aspectRatio);
        setCurrentMediaIndex(0);
      }
    } else {
      // Reset state for new post
      setContent('');
      setPlatforms([]);
      setPostType(PostType.FEED);
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      setScheduledDate(`${year}-${month}-${day}`);
      setScheduledHour(now.getHours().toString().padStart(2, '0'));
      setScheduledMinute((Math.floor(now.getMinutes() / 15) * 15).toString().padStart(2, '0'));
      
      setMedia([]);
      setPostAspectRatio(1);
      setCurrentMediaIndex(0);
    }
    setError(null);
    setAiHashtagsApplied(false); // Reset AI hashtag status for new/edited post
  }, [post]);
  
  useEffect(() => {
    // Automatically adjust aspect ratio when post type changes
    if (postType === PostType.REELS || postType === PostType.STORY) {
        if (postAspectRatio !== 9 / 16) {
          handleAspectRatioChange(9 / 16);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType]);

  const handlePlatformToggle = (platform: Platform) => {
    if (platforms.includes(platform)) {
      // Deselecting is always allowed
      setPlatforms((prev) => prev.filter((p) => p !== platform));
      return;
    }

    // Trying to select. Check if connected.
    if (!connectedPlatforms.includes(platform)) {
      setConnectingPlatform(platform);
    } else {
      setPlatforms((prev) => [...prev, platform]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const spaceAvailable = 10 - media.length;
    if (spaceAvailable <= 0) {
        setError("Você pode adicionar no máximo 10 mídias.");
        return;
    }

    const filesToProcess = files.slice(0, spaceAvailable);
    if (files.length > spaceAvailable) {
        setError(`Limite de 10 mídias atingido. Apenas os ${spaceAvailable} primeiros arquivos foram adicionados.`);
    }

    const newMediaItems: MediaItem[] = [];
    for (const file of filesToProcess) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setError(`O arquivo ${file.name} é muito grande. O limite é 15MB.`);
        continue;
      }
      
      const url = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
      });
      
      let needsCrop = false;
      if (file.type.startsWith('image/')) {
          needsCrop = await checkImageNeedsCrop(url, postAspectRatio);
      }

      newMediaItems.push({ 
        id: crypto.randomUUID(), 
        url, 
        originalUrl: url, 
        type: file.type, 
        aspectRatio: postAspectRatio,
        needsCrop 
      });
    }
    
    setMedia(prev => [...prev, ...newMediaItems]);

    e.target.value = ''; // Reset input
  };
  
  const handleCropSave = (croppedImageUrl: string) => {
    if (croppingItem) {
        setMedia(prev => prev.map(item => 
            item.id === croppingItem.id 
            ? { ...item, url: croppedImageUrl, needsCrop: false, aspectRatio: croppingAspectRatio } 
            : item
        ));
        setCroppingItem(null);
    }
  };

  const removeMediaItem = (idToRemove: string) => {
    setMedia(prev => {
        const newMedia = prev.filter(item => item.id !== idToRemove);
        // Adjust current index if the deleted item was before or was the current one
        if (currentMediaIndex >= newMedia.length) {
            setCurrentMediaIndex(Math.max(0, newMedia.length - 1));
        }
        return newMedia;
    });
  }
  
  const handleEditMedia = (mediaItem: MediaItem) => {
    if (mediaItem.type.startsWith('video/')) {
        setError("A edição de vídeo não é suportada.");
        return;
    }
    // Use the current post aspect ratio for cropping, not the media's old one
    setCroppingAspectRatio(postAspectRatio);
    setCroppingItem(mediaItem);
  }

  const handleHashtagGroupSelect = (groupId: string) => {
    if (!groupId) return;
    const group = hashtagGroups.find(g => g.id === groupId);
    if (group) {
        setContent(prev => appendHashtags(prev, group.hashtags));
    }
  };

  const handleSaveClick = () => {
    setError(null);
    if (platforms.length === 0) {
      setError('Selecione pelo menos uma plataforma.');
      return;
    }
    if (!content.trim() && media.length === 0) {
      setError('O post precisa de conteúdo ou mídia.');
      return;
    }
    if (media.some(item => item.needsCrop)) {
        setError('Uma ou mais imagens precisam ser recortadas para o formato selecionado.');
        return;
    }
    if (!scheduledDate) {
        setError('Por favor, selecione uma data de agendamento.');
        return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledHour}:${scheduledMinute}:00`).toISOString();

    const newPost: Post = {
      id: post?.id || crypto.randomUUID(),
      content,
      media,
      platforms,
      postType,
      status: 'scheduled',
      scheduledAt,
    };
    onSave(newPost);
  };
  
  const handleOpenSuggestions = () => {
    if (!canGenerateText) {
        onUpgradeRequest("ai_text_limit");
        return;
    }
    if (content.trim()) {
        setTextForAISuggestion(content);
        setIsSuggestionsModalOpen(true);
        incrementAiGenerationCount();
    } else {
        setError("Escreva algo no post para obter sugestões da IA.");
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setContent(suggestion);
    setIsSuggestionsModalOpen(false);
  };

  const handleSaveHashtagGroup = (group: Omit<HashtagGroup, 'id'>) => {
    const success = onSaveHashtagGroup(group);
    if (success) {
      setIsHashtagModalOpen(false);
    }
    return success;
  }

  const handleApplyAIHashtags = (hashtagsToApply: string) => {
    setContent(prev => appendHashtags(prev, hashtagsToApply));
    setAiHashtagsApplied(true);
    setIsHashtagModalOpen(false);
  };

  const handleImageGenerated = async (base64Data: string, mimeType: string) => {
    setIsImageGenerationModalOpen(false);
    if (media.length >= 10) {
      setError("Limite de 10 mídias atingido. Não é possível adicionar a imagem gerada.");
      return;
    }
    setIsGeneratingImage(true);
    try {
        const url = `data:${mimeType};base64,${base64Data}`;
        const needsCrop = await checkImageNeedsCrop(url, postAspectRatio);
        const newItem: MediaItem = {
            id: crypto.randomUUID(),
            url,
            originalUrl: url,
            type: mimeType,
            aspectRatio: postAspectRatio,
            needsCrop,
        };
        setMedia(prev => [...prev, newItem]);
        setCurrentMediaIndex(media.length);
    } catch (e) {
        setError("Erro ao processar a imagem gerada.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const isUploadDisabled = media.length >= 10;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b dark:border-dark-border">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{post ? 'Editar Post' : 'Criar Novo Post'}</h2>
          </div>

          <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            {/* Left Column: Media */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col gap-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Mídia</h3>
               {isGeneratingImage ? (
                  <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg text-center p-4">
                      <LoadingSpinner />
                      <p className="text-gray-500 mt-2 animate-pulse">Gerando sua imagem com IA...</p>
                  </div>
               ) : media.length > 0 ? (
                 <>
                    <CarouselPreview 
                      media={media} 
                      aspectRatio={postAspectRatio} 
                      onEdit={handleEditMedia} 
                      onRemove={removeMediaItem}
                      currentIndex={currentMediaIndex}
                      onCurrentIndexChange={setCurrentMediaIndex}
                    />
                    <div className="grid grid-cols-5 gap-2">
                        {media.map((item, index) => (
                            <button 
                                type="button" 
                                key={item.id} 
                                onClick={() => setCurrentMediaIndex(index)}
                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-dark-card
                                    ${currentMediaIndex === index ? 'border-brand-primary' : 'border-transparent hover:border-gray-400'}`
                                }
                            >
                                {item.type.startsWith('image/') ? (
                                    <img src={item.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain bg-gray-200 dark:bg-gray-800" />
                                ) : (
                                    <video src={item.url} className="w-full h-full object-contain bg-black" />
                                )}
                                {item.needsCrop && (
                                     <div className="absolute inset-0 flex items-center justify-center bg-red-900/60" title="Recorte necessário">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                     </div>
                                )}
                            </button>
                        ))}
                    </div>
                 </>
               ) : (
                <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg text-center p-4">
                    <p className="text-gray-500">Arraste e solte ou clique para adicionar imagens e vídeos.</p>
                </div>
               )}
              <div className="flex-shrink-0 flex flex-col gap-2">
                 <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploadDisabled}
                />
                <label htmlFor="file-upload" className={`w-full text-center cursor-pointer bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg block transition-opacity ${isUploadDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Adicionar Mídia ({media.length}/10)
                </label>
                <button
                    type="button"
                    onClick={() => {
                        if (isUploadDisabled) {
                           setError("Limite de 10 mídias atingido.");
                           return;
                        }
                        if (canGenerateImages) {
                            setIsImageGenerationModalOpen(true);
                        } else {
                            onUpgradeRequest('ai_image');
                        }
                    }}
                    title={!canGenerateImages ? "Faça upgrade para gerar imagens com IA" : ""}
                    disabled={isUploadDisabled}
                    className={`w-full text-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity ${(!canGenerateImages || isUploadDisabled) ? 'opacity-60' : ''} ${isUploadDisabled ? 'cursor-not-allowed' : ''}`}
                >
                    <GeminiIcon className="w-5 h-5" />
                    Gerar Imagem com IA
                </button>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col gap-4">
               <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Plataformas</h3>
                    <div className="flex flex-wrap gap-2">
                    {Object.values(Platform).map((platform) => {
                        const isAllowed = allowedPlatforms.includes(platform);
                        return (
                            <button
                            key={platform}
                            onClick={() => {
                                if (!isAllowed) {
                                    onUpgradeRequest('platform');
                                    return;
                                }
                                handlePlatformToggle(platform);
                            }}
                            title={!isAllowed ? "Faça upgrade para usar esta plataforma" : ""}
                            className={`flex items-center gap-2 py-2 px-3 rounded-full border-2 transition-all duration-200 text-sm font-semibold
                                ${platforms.includes(platform) ? 'bg-brand-primary border-brand-primary text-white' : 'bg-transparent border-gray-300 dark:border-dark-border text-gray-500 dark:text-gray-300'}
                                ${isAllowed ? 'hover:border-brand-secondary hover:bg-brand-light dark:hover:bg-brand-primary/10' : 'opacity-50'}
                            `}
                            >
                            {PlatformIcons[platform]}
                            {platform}
                            </button>
                        )
                    })}
                    </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Tipo de Post</h3>
                 <div className="flex flex-wrap gap-2">
                     {Object.values(PostType).map(type => (
                        <button key={type} onClick={() => setPostType(type)} className={`py-2 px-4 rounded-full text-sm font-semibold transition ${postType === type ? 'bg-brand-secondary text-white' : 'bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            {type}
                        </button>
                     ))}
                 </div>
              </div>

               {postType === PostType.FEED && (
                <div>
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Formato</h3>
                  <div className="flex gap-2">
                      <button onClick={() => handleAspectRatioChange(1)} className={`w-12 h-12 rounded-md border-2 transition ${postAspectRatio === 1 ? 'border-brand-primary' : 'border-gray-300 dark:border-dark-border'}`}>1:1</button>
                      <button onClick={() => handleAspectRatioChange(4/5)} className={`w-12 h-12 rounded-md border-2 transition flex items-center justify-center ${postAspectRatio === 4/5 ? 'border-brand-primary' : 'border-gray-300 dark:border-dark-border'}`}><div className="w-8 h-10 bg-gray-300 dark:bg-dark-border rounded-sm"></div></button>
                      <button onClick={() => handleAspectRatioChange(16/9)} className={`w-12 h-12 rounded-md border-2 transition flex items-center justify-center ${Math.abs(postAspectRatio - 16/9) < 0.01 ? 'border-brand-primary' : 'border-gray-300 dark:border-dark-border'}`}><div className="w-10 h-6 bg-gray-300 dark:bg-dark-border rounded-sm"></div></button>
                      <button onClick={() => handleAspectRatioChange(9/16)} className={`w-12 h-12 rounded-md border-2 transition flex items-center justify-center ${postAspectRatio === 9/16 ? 'border-brand-primary' : 'border-gray-300 dark:border-dark-border'}`}><div className="w-6 h-10 bg-gray-300 dark:bg-dark-border rounded-sm"></div></button>
                  </div>
                </div>
              )}
               <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="content" className="font-bold text-gray-700 dark:text-gray-200">Descrição</label>
                    <Tooltip text="Transformar texto em copy profissional">
                        <button 
                            type="button"
                            onClick={handleOpenSuggestions}
                            className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-500 transition-colors"
                        >
                           <GeminiIcon className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition resize-y"
                  placeholder="Escreva sua legenda aqui..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                    <label className="font-bold text-gray-700 dark:text-gray-200">Grupos de Hashtags</label>
                    <button
                        type="button"
                        onClick={onOpenDeleteGroupModal}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Excluir
                    </button>
                </div>
                 <div className="flex gap-2 mt-1">
                     <select 
                        onChange={(e) => {
                            handleHashtagGroupSelect(e.target.value);
                            e.target.value = '';
                        }}
                        className="flex-grow p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                        defaultValue=""
                     >
                        <option value="" disabled>Aplicar um grupo...</option>
                        {hashtagGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
                    <button type="button" onClick={() => setIsHashtagModalOpen(true)} className="py-2 px-4 bg-gray-200 dark:bg-dark-border font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                        Criar Grupo +IA
                    </button>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg border-t dark:border-dark-border">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700"/>
                <select value={scheduledHour} onChange={e => setScheduledHour(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700">
                    {[...Array(24).keys()].map(h => <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>)}
                </select>
                <span>:</span>
                <select value={scheduledMinute} onChange={e => setScheduledMinute(e.target.value)} className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700">
                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-4 w-full sm:w-auto">
                {error && <p className="text-red-500 text-sm font-semibold self-center mr-auto">{error}</p>}
                <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    Cancelar
                </button>
                <button onClick={handleSaveClick} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                    {post ? 'Salvar Alterações' : 'Agendar Post'}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {croppingItem && (
        <ImageCropper 
            imageSrc={croppingItem.originalUrl} 
            aspectRatio={croppingAspectRatio} 
            onSave={handleCropSave} 
            onCancel={() => setCroppingItem(null)}
        />
      )}
      
      {connectingPlatform && (
        <ConnectAccountModal 
          platform={connectingPlatform}
          onClose={() => setConnectingPlatform(null)}
          onConnect={(platform) => {
            onConnectPlatform(platform);
            setPlatforms(prev => [...prev, platform]);
            setConnectingPlatform(null);
          }}
        />
      )}

      {isSuggestionsModalOpen && (
        <SuggestionsModal 
            isOpen={isSuggestionsModalOpen}
            onClose={() => setIsSuggestionsModalOpen(false)}
            originalText={textForAISuggestion}
            onSelectSuggestion={handleSelectSuggestion}
        />
      )}

      {isHashtagModalOpen && (
          <HashtagModal
            onSave={handleSaveHashtagGroup}
            onClose={() => setIsHashtagModalOpen(false)}
            postContent={content}
            onApplyAIHashtags={handleApplyAIHashtags}
            aiHashtagsApplied={aiHashtagsApplied}
            canGenerateText={canGenerateText}
            incrementAiGenerationCount={incrementAiGenerationCount}
            onUpgradeRequest={onUpgradeRequest}
          />
      )}

      {isImageGenerationModalOpen && (
        <ImageGenerationModal
            isOpen={isImageGenerationModalOpen}
            onClose={() => setIsImageGenerationModalOpen(false)}
            onGenerate={handleImageGenerated}
        />
      )}
    </>
  );
};

export default PostModal;