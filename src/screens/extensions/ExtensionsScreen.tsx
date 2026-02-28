import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Puzzle, Upload, MoreVertical, CheckCircle2, AlertCircle, Trash2, Power } from 'lucide-react';
import { Extension } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

import JSZip from 'jszip';

export const ExtensionsScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchExtensions();
    }
  }, [user, authLoading]);

  const fetchExtensions = async () => {
    const userId = user?.uid || 'guest';
    try {
      const res = await fetch(`/api/users/${userId}/extensions`);
      const data = await res.json();
      console.log('Extensions fetched:', data);
      const formattedData = data.map((ext: any) => ({
        ...ext,
        isActive: !!ext.isActive
      }));
      setExtensions(formattedData);
    } catch (error) {
      console.error('Error fetching extensions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type);

    // Validate format
    const isZip = file.name.endsWith('.zip');
    const isCrx = file.name.endsWith('.crx');
    
    if (!isZip && !isCrx) {
      alert('Formato inválido! Apenas arquivos .zip ou .crx são permitidos.');
      return;
    }

    setIsProcessing(true);
    try {
      let fileData: ArrayBuffer = await file.arrayBuffer();
      
      // Basic CRX header stripping (CRX is ZIP with a header)
      if (isCrx) {
        const view = new Uint8Array(fileData);
        // Look for ZIP signature: PK\x03\x04 (0x50 0x4B 0x03 0x04)
        let zipStart = -1;
        for (let i = 0; i < view.length - 4; i++) {
          if (view[i] === 0x50 && view[i+1] === 0x4B && view[i+2] === 0x03 && view[i+3] === 0x04) {
            zipStart = i;
            break;
          }
        }
        if (zipStart !== -1) {
          console.log('CRX header stripped, ZIP starts at:', zipStart);
          fileData = fileData.slice(zipStart);
        }
      }

      const zip = new JSZip();
      const contents = await zip.loadAsync(fileData);
      console.log('ZIP/CRX loaded successfully');
      
      let manifest: any = {};
      const scripts: { [key: string]: string } = {};
      let iconData = 'https://picsum.photos/seed/ext/128';

      // Try to find manifest.json (could be in a subdirectory)
      let manifestFile = contents.file('manifest.json');
      if (!manifestFile) {
        // Look for it in any subdirectory
        const manifestPath = Object.keys(contents.files).find(path => path.endsWith('manifest.json'));
        if (manifestPath) {
          manifestFile = contents.file(manifestPath);
        }
      }

      if (manifestFile) {
        try {
          let manifestText = await manifestFile.async('text');
          // Strip comments from JSON if any
          manifestText = manifestText.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
          
          // Remove control characters
          manifestText = manifestText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

          // Remove trailing commas
          manifestText = manifestText.replace(/,(\s*[}\]])/g, '$1');

          try {
            manifest = JSON.parse(manifestText);
          } catch (parseError) {
            console.warn('JSON parse failed, trying regex fallback...', parseError);
            // Regex fallback for basic fields if JSON is totally broken
            const nameMatch = manifestText.match(/"name"\s*:\s*"([^"]+)"/);
            const versionMatch = manifestText.match(/"version"\s*:\s*"([^"]+)"/);
            const descMatch = manifestText.match(/"description"\s*:\s*"([^"]+)"/);
            
            if (nameMatch) manifest.name = nameMatch[1];
            if (versionMatch) manifest.version = versionMatch[1];
            if (descMatch) manifest.description = descMatch[1];

            // Try to find icons object with regex
            const iconsMatch = manifestText.match(/"icons"\s*:\s*{([^}]+)}/);
            if (iconsMatch) {
              const iconPaths = iconsMatch[1].match(/"[^"]+"\s*:\s*"([^"]+)"/g);
              if (iconPaths) {
                manifest.icons = {};
                iconPaths.forEach(p => {
                  const parts = p.split(':');
                  const key = parts[0].replace(/"/g, '').trim();
                  const val = parts[1].replace(/"/g, '').trim();
                  manifest.icons[key] = val;
                });
              }
            }
          }
          
          console.log('Manifest processed:', manifest);
          
          // Try to extract icon from manifest
          if (manifest.icons) {
            const iconPath = manifest.icons["128"] || manifest.icons["48"] || manifest.icons["16"] || Object.values(manifest.icons)[0] as string;
            if (iconPath) {
              // Get manifest directory to resolve relative paths
              const manifestDir = manifestFile.name.substring(0, manifestFile.name.lastIndexOf('/') + 1);
              const fullIconPath = iconPath.startsWith('/') ? iconPath.substring(1) : manifestDir + iconPath.replace(/^\.\//, '');
              
              let iconFile = contents.file(fullIconPath) || contents.file(iconPath);
              
              if (!iconFile) {
                // Last resort: search by filename
                const iconFileName = iconPath.split('/').pop();
                const foundIconPath = Object.keys(contents.files).find(p => p.endsWith(iconFileName!));
                if (foundIconPath) iconFile = contents.file(foundIconPath);
              }

              if (iconFile) {
                const iconBlob = await iconFile.async('blob');
                iconData = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(iconBlob);
                });
              }
            }
          }
        } catch (e) {
          console.error('Error processing manifest:', e);
        }
      }

      // Extract all .js files
      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (path.endsWith('.js') && !zipEntry.dir) {
          const scriptContent = await zipEntry.async('text');
          scripts[path] = scriptContent;
        }
      }

      const userId = user?.uid || 'guest';
      const extensionName = manifest.name || file.name.replace(/\.(zip|crx)$/, '');
      
      const newExt = {
        id: 'ext_' + Math.random().toString(36).substr(2, 9),
        name: extensionName,
        version: manifest.version || '1.0.0',
        description: manifest.description || 'Módulo instalado manualmente',
        category: extensionName.toLowerCase().includes('extension') ? 'Required Module' : 'User Extension',
        icon: iconData,
        isActive: true,
        userId: userId,
        scripts: JSON.stringify(scripts)
      };

      await fetch('/api/extensions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExt),
      });
      
      await fetchExtensions();
      alert('Extensão instalada e scripts processados com sucesso!');
    } catch (error) {
      console.error('Error processing extension:', error);
      alert('Erro ao processar o arquivo da extensão.');
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const toggleExtension = async (id: string, currentStatus: boolean) => {
    await fetch('/api/extensions/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !currentStatus }),
    });
    fetchExtensions();
  };

  const deleteExtension = async (id: string) => {
    await fetch(`/api/extensions/${id}`, {
      method: 'DELETE',
    });
    fetchExtensions();
    setActiveMenu(null);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-bg-main no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-1">Extensões</h1>
          <p className="text-text-muted text-sm">{extensions.length} módulos ativos</p>
        </div>
        <label className={`bg-primary text-white p-3 rounded-2xl cursor-pointer hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}>
          {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={20} />}
          <input type="file" accept=".zip,.crx" className="hidden" onChange={handleUpload} disabled={isProcessing} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {extensions.map((ext) => (
            <motion.div
              key={ext.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-bg-card border border-border-subtle rounded-3xl p-5 flex items-start gap-4 relative transition-all duration-300 ${!ext.isActive ? 'opacity-60 grayscale' : 'shadow-xl shadow-black/10'}`}
            >
              <img src={ext.icon} alt={ext.name} className="w-16 h-16 rounded-2xl shadow-md shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-text-primary text-base truncate">{ext.name}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{ext.category}</p>
                  </div>
                  <button 
                    onClick={() => setActiveMenu(activeMenu === ext.id ? null : ext.id)}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-text-faint"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                {ext.description && (
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-3">{ext.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                  <span className="text-[10px] text-text-faint font-bold">Versão {ext.version}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${ext.isActive ? 'text-primary' : 'text-text-faint'}`}>
                      {ext.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <button 
                      onClick={() => toggleExtension(ext.id, ext.isActive)}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${ext.isActive ? 'bg-primary' : 'bg-bg-card-2 border border-border-subtle'}`}
                    >
                      <motion.div 
                        animate={{ x: ext.isActive ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Context Menu */}
              {activeMenu === ext.id && (
                <>
                  <div className="fixed inset-0 z-[1000]" onClick={() => setActiveMenu(null)} />
                  <div className="absolute right-4 top-14 bg-bg-card-2 border border-border-subtle rounded-2xl shadow-2xl z-[1001] py-2 min-w-[180px] overflow-hidden">
                    <button 
                      onClick={() => toggleExtension(ext.id, ext.isActive)}
                      className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <Power size={16} className={ext.isActive ? 'text-danger' : 'text-primary'} />
                      {ext.isActive ? 'Desativar Módulo' : 'Ativar Módulo'}
                    </button>
                    <button 
                      onClick={() => deleteExtension(ext.id)}
                      className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-3 hover:bg-white/5 transition-colors text-danger"
                    >
                      <Trash2 size={16} />
                      Remover do Sistema
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {extensions.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
          <Puzzle size={64} className="mb-4" />
          <h3 className="text-lg font-bold">Sem extensões</h3>
        </div>
      )}
    </div>
  );
};
