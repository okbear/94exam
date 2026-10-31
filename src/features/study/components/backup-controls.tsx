import { useRef } from "react";
import { Download, Upload } from "lucide-react";
export function BackupControls({
  exportData,
  importData,
}: {
  exportData: () => void;
  importData: (file?: File) => Promise<void>;
}) {
  const upload = useRef<HTMLInputElement>(null);
  async function handleImport(file?: File) {
    await importData(file);
    if (upload.current) upload.current.value = "";
  }
  return (
    <>
      {" "}
      <h3>学習データのバックアップ</h3>
      <p>
        履歴はこのブラウザに保存されます。端末を変えるときは、データを書き出して復元できます。
      </p>
      <div className="button-row">
        <button className="secondary" onClick={exportData}>
          <Download size={16} />
          書き出す
        </button>
        <button className="secondary" onClick={() => upload.current?.click()}>
          <Upload size={16} />
          復元する
        </button>
        <input
          ref={upload}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void handleImport(e.target.files?.[0])}
        />
      </div>
    </>
  );
}
