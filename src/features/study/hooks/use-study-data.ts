import { readBackupFile } from "../../../lib/study-backup";
import {
  changeTargetDate,
  reconcileTargetSchedule,
} from "../../../lib/target-schedule";
import { useEffect, useState } from "react";
import {
  dayKey,
  emptyData,
  restoreData,
  storageKey,
  type StudyData,
} from "../../../lib/study";

export function useStudyData() {
  const [data, setData] = useState<StudyData>(emptyData);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [recoveryRequired, setRecoveryRequired] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) setData(reconcileTargetSchedule(restoreData(raw)));
    } catch {
      setRecoveryRequired(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || recoveryRequired) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setNotice(
        "履歴を保存できません。設定からバックアップをダウンロードしてください。",
      );
    }
  }, [data, ready, recoveryRequired]);
  function bookmark(id: string) {
    setData((d) => ({
      ...d,
      bookmarks: d.bookmarks.includes(id)
        ? d.bookmarks.filter((x) => x !== id)
        : [...d.bookmarks, id],
    }));
  }
  function download(raw: string, filename: string) {
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportData() {
    download(JSON.stringify(data, null, 2), `kyuyo-study-${dayKey()}.json`);
  }
  function exportOriginalData() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) throw new Error("保存データが見つかりません。");
      download(raw, `kyuyo-study-recovery-${dayKey()}.json`);
    } catch {
      setNotice(
        "元データを書き出せませんでした。ブラウザの保存設定を確認してください。",
      );
    }
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      const next = reconcileTargetSchedule(await readBackupFile(file));
      if (
        window.confirm(
          "現在の履歴を、選択したバックアップの内容に置き換えますか？",
        )
      ) {
        setData(next);
        setRecoveryRequired(false);
        setNotice("学習データを復元しました。");
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "復元できませんでした。");
    }
  }
  function reset() {
    if (
      window.confirm("学習履歴をすべて削除しますか？この操作は取り消せません。")
    ) {
      setData((current) => ({
        ...emptyData(),
        goal: current.goal,
        targetDate: current.targetDate,
      }));
      setRecoveryRequired(false);
      setNotice("学習履歴をリセットしました。");
    }
  }
  function setGoal(goal: number) {
    setData((d) => ({ ...d, goal }));
  }
  function setTargetDate(targetDate: string | null): boolean {
    try {
      const next = changeTargetDate(data, targetDate);
      setData(next);
      setNotice(
        targetDate
          ? "目標期日を保存し、復習予定を調整しました。"
          : "目標期日を解除しました。今後の回答は通常の復習間隔で記録します。",
      );
      return true;
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "目標期日を保存できませんでした。",
      );
      return false;
    }
  }
  return {
    data,
    setData,
    ready,
    recoveryRequired,
    exportOriginalData,
    notice,
    setNotice,
    bookmark,
    exportData,
    importData,
    reset,
    setGoal,
    setTargetDate,
  };
}
