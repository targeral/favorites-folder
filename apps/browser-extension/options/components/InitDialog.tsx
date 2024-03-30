import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2)
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1)
  }
}))

export type OnGoToSettingPage = (type: "storage-server" | "ai-server") => void;

export type InitType = "all" | "storage-server" | "ai-server" | 'none'

export interface InitDialogProps {
  open: boolean
  onGoToSettingPage?: OnGoToSettingPage;
  type: InitType
}

export const InitDialog = ({ open, onGoToSettingPage, type }: InitDialogProps) => {
  const handleClose: OnGoToSettingPage = (type) => {
    onGoToSettingPage && onGoToSettingPage(type);
  };

  return (
    <BootstrapDialog
      aria-labelledby="customized-dialog-title"
      open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        初始化提示
      </DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          检测到没有进行
          {type === "all"
            ? "【存储设置】和【标签生成模型设置】"
            : type === "storage-server"
              ? "【存储设置】"
              : "【标签生成模型设置】"}
          ，请设置后再进行使用。
        </Typography>
      </DialogContent>
      <DialogActions>
        {type === "all" || type === "storage-server" ? (
          <Button onClick={() => handleClose("storage-server")}>
            配置【存储设置】
          </Button>
        ) : null}
        {type === "all" || type === "ai-server" ? (
          <Button onClick={() => handleClose("ai-server")}>
            配置【标签生成模型】
          </Button>
        ) : null}
      </DialogActions>
    </BootstrapDialog>
  )
}
