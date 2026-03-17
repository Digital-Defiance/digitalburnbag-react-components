/**
 * VaultPicker — Dropdown selector for vault containers.
 * Shown above the file browser when the user has vault containers.
 * Allows switching between vaults and creating new ones.
 */
import { DigitalBurnbagStrings } from '@brightchain/digitalburnbag-lib';
import { useI18n } from '@digitaldefiance/express-suite-react-components';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import type { IApiVaultContainerSummaryDTO } from '../services/burnbag-api-client';

export interface IVaultPickerProps {
  vaults: IApiVaultContainerSummaryDTO[];
  selectedVaultId: string | null;
  onSelectVault: (vaultId: string) => void;
  onCreateVault: (name: string, description?: string) => Promise<void>;
  loading?: boolean;
}

export function VaultPicker({
  vaults,
  selectedVaultId,
  onSelectVault,
  onCreateVault,
  loading = false,
}: IVaultPickerProps) {
  const { tBranded: t } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreateVault(newName.trim(), newDesc.trim() || undefined);
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
    } finally {
      setCreating(false);
    }
  }, [newName, newDesc, onCreateVault]);

  if (vaults.length === 0 && !loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t(DigitalBurnbagStrings.Vault_Empty)}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 2 }}
        >
          {t(DigitalBurnbagStrings.Vault_EmptyDesc)}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          {t(DigitalBurnbagStrings.Vault_CreateNew)}
        </Button>
        {renderCreateDialog()}
      </Box>
    );
  }

  function renderCreateDialog() {
    return (
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t(DigitalBurnbagStrings.Vault_CreateNew)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t(DigitalBurnbagStrings.Vault_NameLabel)}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating}
          />
          <TextField
            fullWidth
            margin="dense"
            label={t(DigitalBurnbagStrings.Vault_DescriptionLabel)}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            disabled={creating}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            {t(DigitalBurnbagStrings.Vault_Cancel)}
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={creating || !newName.trim()}
          >
            {t(DigitalBurnbagStrings.Vault_Create)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="vault-picker-label">
          {t(DigitalBurnbagStrings.Nav_Vaults)}
        </InputLabel>
        <Select
          labelId="vault-picker-label"
          value={selectedVaultId ?? ''}
          label={t(DigitalBurnbagStrings.Nav_Vaults)}
          onChange={(e) => onSelectVault(e.target.value)}
          disabled={loading}
        >
          {vaults.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {v.state === 'locked' ? (
                  <LockIcon fontSize="small" color="warning" />
                ) : (
                  <Tooltip title={t(DigitalBurnbagStrings.Vault_AllEncrypted)}>
                    <VerifiedUserIcon fontSize="small" color="success" />
                  </Tooltip>
                )}
                {v.name}
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <Chip
                    icon={<LockIcon sx={{ fontSize: 12 }} />}
                    label={t(DigitalBurnbagStrings.Encryption_AES256)}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' } }}
                  />
                  <Chip
                    label={`${v.fileCount} ${t(DigitalBurnbagStrings.Vault_Files)}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => setCreateOpen(true)}
      >
        {t(DigitalBurnbagStrings.Vault_CreateNew)}
      </Button>
      {/* Encryption reassurance banner */}
      {selectedVaultId && (
        <Tooltip title={t(DigitalBurnbagStrings.Vault_AllEncryptedDesc)}>
          <Chip
            icon={<VerifiedUserIcon />}
            label={t(DigitalBurnbagStrings.Vault_AllEncrypted)}
            size="small"
            color="success"
            variant="filled"
            sx={{ ml: 'auto' }}
          />
        </Tooltip>
      )}
      {renderCreateDialog()}
    </Box>
  );
}

export default VaultPicker;
