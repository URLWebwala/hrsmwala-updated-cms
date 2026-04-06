import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { Volume2, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

type SoundType = 'start' | 'pause' | 'resume' | 'stop' | 'clock_in' | 'clock_out' | 'notification';

interface SoundRow {
  type: SoundType;
  file_path?: string | null;
  is_active: boolean;
  volume: number;
}

interface Props {
  auth?: any;
}

const SOUND_TYPES: SoundType[] = ['start', 'pause', 'resume', 'stop', 'clock_in', 'clock_out', 'notification'];

export default function SoundSettings({ auth }: Props) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<SoundRow[]>([]);
  const [uploadingType, setUploadingType] = useState<SoundType | null>(null);
  const [savingType, setSavingType] = useState<SoundType | null>(null);
  const [fileMap, setFileMap] = useState<Record<string, File | null>>({});

  const canEdit = useMemo(
    () => ['superadmin', 'super admin'].includes((auth?.user?.type || '').toLowerCase()),
    [auth?.user?.type]
  );

  const loadData = async () => {
    try {
      const res = await fetch(route('web.sound-settings.index'), {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) return;
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      const mapped: SoundRow[] = SOUND_TYPES.map((type) => {
        const existing = list.find((x: any) => x.type === type);
        return {
          type,
          file_path: existing?.file_path ?? null,
          is_active: Boolean(existing?.is_active ?? true),
          volume: Number(existing?.volume ?? 1),
        };
      });
      setRows(mapped);
    } catch {
      // Ignore.
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateLocal = (type: SoundType, patch: Partial<SoundRow>) => {
    setRows((prev) => prev.map((row) => (row.type === type ? { ...row, ...patch } : row)));
  };

  const saveRow = async (type: SoundType) => {
    const row = rows.find((r) => r.type === type);
    if (!row) return;
    setSavingType(type);
    try {
      const selectedFile = fileMap[type];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', selectedFile);
        formData.append('is_active', row.is_active ? '1' : '0');
        formData.append('volume', String(row.volume));

        const uploadRes = await fetch(route('web.sound-settings.upload'), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('upload-failed');
        setFileMap((prev) => ({ ...prev, [type]: null }));
      }

      const res = await fetch(route('web.sound-settings.update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          type: row.type,
          is_active: row.is_active,
          volume: row.volume,
        }),
      });
      if (!res.ok) throw new Error('failed');
      toast.success(selectedFile ? t('Sound uploaded and updated') : t('Sound setting updated'));
      await loadData();
    } catch {
      toast.error(t('Failed to update sound setting'));
    } finally {
      setSavingType(null);
    }
  };

  const uploadFile = async (type: SoundType) => {
    const file = fileMap[type];
    if (!file) return;
    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);
      const row = rows.find((r) => r.type === type);
      formData.append('is_active', row?.is_active ? '1' : '0');
      formData.append('volume', String(row?.volume ?? 1));

      const res = await fetch(route('web.sound-settings.upload'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      });
      if (!res.ok) throw new Error('failed');
      setFileMap((prev) => ({ ...prev, [type]: null }));
      toast.success(t('Sound uploaded successfully'));
      await loadData();
    } catch {
      toast.error(t('Failed to upload sound'));
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <Card id="sound-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {t('Sound Settings')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canEdit ? (
          <p className="text-sm text-muted-foreground">{t('Only Super Admin can update sound settings.')}</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.type} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium capitalize">{row.type.replace('_', ' ')}</h4>
                    <p className="text-xs text-muted-foreground">
                      {row.file_path ? `/storage/${row.file_path}` : t('No file uploaded')}
                    </p>
                  </div>
                  <Switch checked={row.is_active} onCheckedChange={(val) => updateLocal(row.type, { is_active: val })} />
                </div>
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <Label>{t('Upload sound (.mp3/.wav)')}</Label>
                    <Input
                      type="file"
                      accept=".mp3,.wav,audio/mpeg,audio/wav"
                      onChange={(e) =>
                        setFileMap((prev) => ({ ...prev, [row.type]: e.target.files?.[0] ?? null }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => uploadFile(row.type)}
                    disabled={!fileMap[row.type] || uploadingType === row.type}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingType === row.type ? t('Uploading...') : t('Upload')}
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <Label>{t('Volume (0 - 1)')}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={row.volume}
                      onChange={(e) => updateLocal(row.type, { volume: Number(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={() => saveRow(row.type)} disabled={savingType === row.type || uploadingType === row.type}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingType === row.type ? t('Saving...') : fileMap[row.type] ? t('Save (Upload + Update)') : t('Save')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

