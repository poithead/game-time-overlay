import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface LogoPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function LogoPicker({ label, value, onChange, disabled = false }: LogoPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadLogos = async () => {
    const { data, error } = await supabase.storage.from('logos').list();
    if (error) {
      console.error('fetch logos failed', error);
      return;
    }
    const urls = data.map(f => supabase.storage.from('logos').getPublicUrl(f.name).data.publicUrl);
    setAvailable(urls);
  };

  useEffect(() => {
    loadLogos();
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (error) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
    onChange(publicUrl);
    toast.success('Logo uploaded');
    // refresh list
    await loadLogos();
    setUploading(false);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 items-center relative overflow-visible">
        {value && <img src={value} alt={label.toLowerCase()} className="h-8 w-8 rounded object-contain bg-muted drop-shadow" />}

        <label className="cursor-pointer">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded px-2 py-1.5 hover:bg-secondary transition-colors">
            <Upload className="h-3 w-3" />
            {uploading ? 'Uploading...' : `Upload ${label}`}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading || disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        <button
          type="button"
          className="text-xs text-primary underline"
          disabled={disabled}
          onClick={() => setPickerOpen((o) => !o)}
        >
          Choose existing
        </button>

        {pickerOpen && (
          <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-16 overflow-x-auto overflow-y-hidden bg-card border border-border rounded shadow-lg p-2">
            {available.length === 0 ? (
              <div className="text-xs text-muted-foreground">No logos</div>
            ) : (
              <div className="flex gap-2">
                {available.map((u) => (
                  <img
                    key={u}
                    src={u}
                    alt="logo"
                    className="h-8 w-8 rounded object-contain cursor-pointer hover:opacity-80"
                    onClick={() => {
                      onChange(u);
                      setPickerOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
