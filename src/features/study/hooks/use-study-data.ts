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
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setData(restoreData(raw));
    } catch {
      setNotice(
        "保存データを読み込めませんでした。設定からバックアップを復元できます。",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setNotice(
        "履歴を保存できません。設定からバックアップをダウンロードしてください。",
      );
    }
  }, [data, ready]);
  function bookmark(id: string) {
    setData((d) => ({
      ...d,
      bookmarks: d.bookmarks.includes(id)
        ? d.bookmarks.filter((x) => x !== id)
        : [...d.bookmarks, id],
    }));
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyuyo-study-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      const next = restoreData(await file.text());
      if (
        window.confirm(
          "現在の履歴を、選択したバックアップの内容に置き換えますか？",
        )
      ) {
        setData(next);
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
      setData(emptyData());
      setNotice("学習履歴をリセットしました。");
    }
  }
  function setGoal(goal: number) {
    setData((d) => ({ ...d, goal }));
  }
  return {
    data,
    setData,
    ready,
    notice,
    setNotice,
    bookmark,
    exportData,
    importData,
    reset,
    setGoal,
  };
}
