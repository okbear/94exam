import type { ReferenceMaterial } from "../../../lib/questions";

export function ReferenceMaterials({ materials }: { materials: ReferenceMaterial[] }) {
  return (
    <div className="reference-materials">
      <p>別資料を開き、問題文の条件と照合してください。</p>
      {materials.map((material, index) => (
        <details className="reference-material" key={`${index}-${material.title}`}>
          <summary>別資料{index + 1}：{material.title}</summary>
          <p>{material.note}</p>
          <div className="reference-table-scroll" role="region" aria-label={material.title} tabIndex={0}>
            <table>
              <caption>{material.title}</caption>
              <thead><tr>{material.columns.map((column, i) => <th scope="col" key={i}>{column}</th>)}</tr></thead>
              <tbody>{material.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => j === 0
                  ? <th scope="row" key={j}>{cell}</th>
                  : <td key={j}>{cell}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
          {material.source && <a className="source-link" href={material.source} target="_blank" rel="noreferrer">資料の公的出典を確認する ↗</a>}
        </details>
      ))}
    </div>
  );
}
