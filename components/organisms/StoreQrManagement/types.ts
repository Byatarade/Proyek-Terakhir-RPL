export interface StoreQrManagementProps {
  storeName: string;
  storeSlug: string;
  initialBaseUrl?: string;
}

export type QrColorType = "forest" | "black";

export interface QrPreviewTicketProps {
  storeName: string;
  tableLabel: string;
  fullMenuUrl: string;
  qrPngUrl: string;
  isGenerating: boolean;
  showSteps: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export interface QrActionPanelProps {
  fullMenuUrl: string;
  copied: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onDownloadFullCardPng: () => void;
  onDownloadQrOnly: () => void;
  onDownloadSvg: () => void;
}

export interface QrCustomizePanelProps {
  tableLabel: string;
  setTableLabel: (label: string) => void;
  qrColor: QrColorType;
  setQrColor: (color: QrColorType) => void;
  showSteps: boolean;
  setShowSteps: (show: boolean) => void;
}
