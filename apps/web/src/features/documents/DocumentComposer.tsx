import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import type { TemplateDefinition } from '@cetakdocs/core';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentForm } from './DocumentForm';
import { DocumentPreview } from './DocumentPreview';
import { documentsApi, organizationsApi } from '@/lib/api-client';

interface DocumentComposerProps {
  template: TemplateDefinition;
}

export function DocumentComposer({ template }: DocumentComposerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const editingDocId = location.state?.editingDocId;
  const initialData = location.state?.initialData || {};
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [docTitle, setDocTitle] = useState(location.state?.title || `${template.name} Baru`);
  const [templateVersionId, setTemplateVersionId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Load organization and template version info
  useEffect(() => {
    organizationsApi.list().then(orgs => {
      if (orgs.length > 0) setOrgId(orgs[0].id);
    }).catch(() => {});

    // Get template version ID from API
    import('@/lib/api-client').then(({ templatesApi }) => {
      templatesApi.list().then(templates => {
        const apiTpl = templates.find(t => t.id === template.id);
        if (apiTpl?.latestVersionId) {
          setTemplateVersionId(apiTpl.latestVersionId);
        }
      });
    }).catch(() => {});
  }, [template.id]);

  // Bind AI helper context to global window object
  useEffect(() => {
    (window as any).__activeDocumentContext = {
      template,
      formData,
      setFormData
    };
    return () => {
      (window as any).__activeDocumentContext = undefined;
    };
  }, [template, formData]);

  const handleSaveDraft = async () => {
    try {
      const versionId = templateVersionId || `${template.id}_v1`;
      
      if (editingDocId) {
        await documentsApi.update(editingDocId, {
          templateId: template.id,
          templateVersionId: versionId,
          organizationId: orgId || undefined,
          title: docTitle,
          dataJson: JSON.stringify(formData),
        });
      } else {
        await documentsApi.create({
          templateId: template.id,
          templateVersionId: versionId,
          organizationId: orgId || undefined,
          title: docTitle,
          dataJson: JSON.stringify(formData),
        });
      }
      alert('Draf berhasil disimpan!');
      navigate('/documents');
    } catch (e: any) {
      console.error(e);
      alert('Gagal menyimpan draf: ' + (e.message || 'Kesalahan tidak diketahui'));
    }
  };

  const handleDownloadPdf = async () => {
    let docId = editingDocId;
    try {
      const versionId = templateVersionId || `${template.id}_v1`;
      if (docId) {
        await documentsApi.update(docId, {
          templateId: template.id,
          templateVersionId: versionId,
          organizationId: orgId || undefined,
          title: docTitle,
          dataJson: JSON.stringify(formData),
        });
      } else {
        const created = await documentsApi.create({
          templateId: template.id,
          templateVersionId: versionId,
          organizationId: orgId || undefined,
          title: docTitle,
          dataJson: JSON.stringify(formData),
        });
        docId = created.id;
      }
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const downloadUrl = `${API_BASE}/api/documents/${docId}/export/pdf`;
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${docTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e: any) {
      console.error(e);
      alert('Gagal mengunduh PDF: ' + (e.message || 'Kesalahan tidak diketahui'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="print:hidden">
        <DocumentToolbar 
          template={template} 
          onSaveDraft={handleSaveDraft}
          onDownloadPdf={handleDownloadPdf}
          title={docTitle}
          setTitle={setDocTitle}
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row print:overflow-visible">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 lg:w-5/12 border-r border-border overflow-y-auto p-6 bg-bg print:hidden">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Isi Data {template.name}</h2>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('cetakdocs:open-chat'))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/15 border border-accent/20 text-accent rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Isi dengan AI
              </button>
            </div>
            <DocumentForm 
              template={template} 
              data={formData} 
              onChange={setFormData} 
            />
          </div>
        </div>
        
        {/* Right Side: Preview */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-bg-muted overflow-y-auto p-4 md:p-8 flex justify-center print:w-full print:bg-white print:p-0 print:overflow-visible">
          <DocumentPreview template={template} data={formData} />
        </div>
      </div>
    </div>
  );
}
