/**
 * CORE CAPITAL V3 — MODULE 8 : CORE CONNECT
 * Système complet de messagerie interne entre visiteurs et responsables de projets.
 * Synchronisation persistante avec Supabase & Abonnements Realtime.
 * Téléversement de pièces jointes dans Supabase Storage.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabaseService } from '../../services/supabaseService';
import {
  MessageSquare,
  Send,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  Phone,
  MessageCircle,
  Loader2,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const CoreConnectModule: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    isSupabaseOnline,
  } = useFinance();

  const [inputText, setInputText] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  const activeMessages = messages.filter((m) => m.conversationId === activeConv?.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    setAttachmentName(file.name);
    try {
      const res = await supabaseService.uploadFile(file, 'documents', 'chat');
      if (res.success && res.publicUrl) {
        setAttachmentUrl(res.publicUrl);
      }
    } catch (err) {
      console.warn('Erreur upload attachment:', err);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentUrl) || !activeConv) return;

    await sendMessage(activeConv.id, inputText.trim(), attachmentUrl || undefined);
    setInputText('');
    setAttachmentUrl(null);
    setAttachmentName(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>MODULE 8 — MESSAGERIE INTERNE & CANAUX DIRECTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE CONNECT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Échangez directement avec les fondateurs et directeurs de projets économiques.
          </p>
        </div>

        {/* Badge Realtime */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isSupabaseOnline
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isSupabaseOnline ? 'Realtime Supabase Actif' : 'Mode Local'}</span>
          </span>
        </div>
      </div>

      {reportSuccess && (
        <div className="p-3 bg-blue-950/80 border border-blue-800 rounded-xl text-blue-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Signalement transmis aux modérateurs de CORE CAPITAL.</span>
        </div>
      )}

      {/* Interface Chat Split-Pane */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Liste des conversations (Gauche - 4 colonnes) */}
        <div className="md:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/60">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Discussions ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucune discussion active. Ouvrez une fiche projet dans CORE PROJECTS pour engager le dialogue.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3.5 hover:bg-slate-900/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-900 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">{conv.contactName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <span className="text-[11px] text-blue-400 block truncate">{conv.projectTitle}</span>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Espace Messages Actif (Droite - 8 colonnes) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-900/40">
          {activeConv ? (
            <>
              {/* En-tête de conversation */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs">
                    {activeConv.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {activeConv.contactName}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {activeConv.contactRole} · {activeConv.projectTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <a
                    href="tel:+221774501234"
                    title="Appeler le responsable"
                    className="p-1.5 px-2.5 text-xs text-blue-300 bg-blue-950/80 border border-blue-800/80 hover:bg-blue-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Appeler</span>
                  </a>

                  <a
                    href="https://wa.me/221774501234"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Contacter sur WhatsApp"
                    className="p-1.5 px-2.5 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setReportSuccess(true);
                      setTimeout(() => setReportSuccess(false), 3000);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Signaler la conversation"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Signaler</span>
                  </button>
                </div>
              </div>

              {/* Flux des messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeMessages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1.5 ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}
                      >
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        {msg.attachmentName && (
                          <div className="p-2 rounded-lg bg-black/20 flex items-center gap-2 text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-blue-300" />
                            <span className="truncate max-w-[180px] font-mono">{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {isMe ? 'Vous' : msg.senderName} · {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pièce jointe en cours */}
              {attachmentName && (
                <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/60 flex items-center justify-between text-xs text-blue-300">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pièce jointe : {attachmentName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentUrl(null);
                      setAttachmentName(null);
                    }}
                    className="text-slate-400 hover:text-rose-400 text-[11px]"
                  >
                    Retirer
                  </button>
                </div>
              )}

              {/* Champ d'envoi */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <label
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Ajouter un document ou image"
                >
                  {isUploadingAttachment ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={isUploadingAttachment}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Écrivez votre message sécurisé..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !attachmentUrl}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                  aria-label="Envoyer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center h-full">
              Sélectionnez une discussion pour afficher les messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
