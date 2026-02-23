import type { ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  showAnswers: boolean;
  showSettings: boolean;
  handleNew: () => void;
  handleToggleAnswers: () => void;
  setShowSettings: (fn: (v: boolean) => boolean) => void;
  settingsPanel: ReactNode;
  qrUrl: string;
  children: ReactNode;
}

const ProblemPageLayout = ({
  showAnswers,
  showSettings,
  handleNew,
  handleToggleAnswers,
  setShowSettings,
  settingsPanel,
  qrUrl,
  children,
}: Props) => (
  <>
    <div className="no-print controls">
      <button onClick={handleNew}>新しい問題</button>
      <button onClick={handleToggleAnswers}>
        {showAnswers ? "答えを隠す" : "答え"}
      </button>
      <button onClick={() => setShowSettings((v) => !v)}>設定</button>
    </div>
    {showSettings && settingsPanel}
    {children}
    <div className="qr-section">
      <QRCodeSVG value={qrUrl} size={80} />
      <span className="qr-label">答え</span>
    </div>
  </>
);

export default ProblemPageLayout;
