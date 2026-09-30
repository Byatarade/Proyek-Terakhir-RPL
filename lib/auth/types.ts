export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
  requiresEmailVerification?: boolean;
}

export interface SlugCheckResult {
  available: boolean;
  message?: string;
}
