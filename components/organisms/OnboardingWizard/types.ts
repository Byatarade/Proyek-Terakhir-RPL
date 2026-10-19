import { StoreOnboardingData } from "@/lib/stores/actions";

export interface OnboardingWizardProps {
  initialStore: StoreOnboardingData;
}

export type WizardStep = 1 | 2 | 3;
export type HasQrisChoice = "yes" | "no" | null;

export interface WizardStepIndicatorProps {
  step: WizardStep;
  onSetStep: (step: WizardStep) => void;
}

export interface Step1StoreIdentityProps {
  store: StoreOnboardingData;
  copiedLink: boolean;
  onCopyPublicUrl: () => void;
  onNext: () => void;
}

export interface Step2QrisPaymentProps {
  store: StoreOnboardingData;
  hasQris: HasQrisChoice;
  setHasQris: (val: HasQrisChoice) => void;
  actionError: string | null;
  setActionError: (err: string | null) => void;
  isScanning: boolean;
  scanError: string | null;
  setScanError: (err: string | null) => void;
  rawPayload: string | null;
  merchantName: string;
  merchantCity: string;
  nmid: string;
  qrisPreviewUrl: string | null;
  isMerchantConfirmed: boolean;
  setIsMerchantConfirmed: (confirmed: boolean) => void;
  acceptCashAlso: boolean;
  setAcceptCashAlso: (accept: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onUseDemoQris: () => void;
  isPending: boolean;
  onBack: () => void;
  onSave: () => void;
}

export interface Step3CompletionProps {
  store: StoreOnboardingData;
}
