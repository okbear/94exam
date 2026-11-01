import { BackupControls } from "./backup-controls";
export function StorageRecovery({
  exportOriginalData,
  importData,
  onReset,
}: {
  exportOriginalData: () => void;
  importData: (file?: File) => Promise<void>;
  onReset: () => void;
}) {
  return (
    <section className="card settings-panel" role="alert">
      <h2>保存データを読み込めませんでした</h2>
      <p>
        元データを保護するため、学習と自動保存を停止しています。まず元データを書き出して保管してください。書き出したファイルは修復用で、そのまま復元できるとは限りません。
      </p>
      <BackupControls
        exportLabel="元データを書き出す"
        exportData={exportOriginalData}
        importData={importData}
      />
      <div className="divider" />
      <p>
        正常なバックアップを復元するか、保存データを削除して学習を再開できます。
      </p>
      <button className="danger-button" onClick={onReset}>
        保存データを削除して再開
      </button>
    </section>
  );
}
