import { PILLAR } from "../lib/floorPlans";

// seatsByNumber: { [seatNumber]: { student_id, name, fee_paid, vacating, ... } | undefined }
export function SeatGrid({ plan, seatsByNumber, onSeatClick, onlyVacant, selectedSeat }) {
  return (
    <div style={{ minWidth: 760, overflowX: "auto" }}>
      {plan.roomLabel && <RoomLabel text={plan.roomLabel} wide />}
      <SeatRow cells={plan.topStrip} seatsByNumber={seatsByNumber} onSeatClick={onSeatClick} onlyVacant={onlyVacant} selectedSeat={selectedSeat} align="flex-end" />
      <div style={{ display: "flex", gap: 22, marginTop: 10, alignItems: "flex-start" }}>
        {plan.columns.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {col.blocks.map((blk, bi) => (
              <div key={bi}>
                {blk.note && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 2 }}>{blk.note}</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {blk.rows.map((row, ri) => (
                    <SeatRow key={ri} cells={row} seatsByNumber={seatsByNumber} onSeatClick={onSeatClick} onlyVacant={onlyVacant} selectedSeat={selectedSeat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {plan.bottomRooms && (
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {plan.bottomRooms.map((r, i) => (
            <RoomLabel key={i} text={r} grow />
          ))}
        </div>
      )}
    </div>
  );
}

function SeatRow({ cells, seatsByNumber, onSeatClick, onlyVacant, selectedSeat, align }) {
  return (
    <div style={{ display: "flex", gap: 3, justifyContent: align || "flex-start" }}>
      {cells.map((cell, i) => {
        if (cell == null) return <div key={i} style={{ width: 34, height: 30 }} />;
        if (cell === PILLAR) {
          return <div key={i} title="Pillar" style={{ width: 34, height: 30, background: "var(--pillar)", borderRadius: 4 }} />;
        }
        const num = cell;
        const occ = seatsByNumber[num];
        const isVacant = !occ || !occ.student_id;

        if (onlyVacant && !isVacant) {
          return <div key={i} style={{ width: 34, height: 30 }} />; // hide occupied seats entirely in picker mode
        }

        let bg = "var(--parchment-deep)", txt = "var(--ink-soft)";
        if (occ && occ.vacating) { bg = "var(--plum)"; txt = "#fff"; }
        else if (occ && occ.student_id) { bg = occ.fee_paid ? "var(--sage)" : "var(--rust)"; txt = "#fff"; }
        else if (occ && occ.pending_application_id) { bg = "var(--pending)"; txt = "#fff"; }
        const isSelected = String(selectedSeat) === String(num);

        return (
          <button
            key={i}
            onClick={() => onSeatClick && onSeatClick(num)}
            title={
              occ && occ.student_id ? `${occ.name}${occ.vacating ? " (vacating)" : ""}`
              : occ && occ.pending_application_id ? `${occ.pending_name} — awaiting confirmation`
              : `Seat ${num} — vacant`
            }
            style={{
              width: 34, height: 30, background: bg,
              border: isSelected ? "2px solid var(--ink)" : "1px solid var(--line)",
              borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: 0,
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: txt, lineHeight: 1 }}>{num}</div>
            {occ && occ.student_id && (
              <div style={{ fontSize: 7, color: txt, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 32 }}>
                {occ.name.split(" ")[0]}
              </div>
            )}
            {occ && !occ.student_id && occ.pending_application_id && (
              <div style={{ fontSize: 7, color: txt, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 32 }}>
                {occ.pending_name.split(" ")[0]}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RoomLabel({ text, wide, grow }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)", borderRadius: 6, padding: "10px 14px",
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brass-deep)",
        textTransform: "uppercase", textAlign: "center", background: "rgba(192,138,62,0.08)",
        marginBottom: wide ? 8 : 0, width: wide ? "100%" : "auto", flex: grow ? 1 : "none",
      }}
    >
      {text}
    </div>
  );
}
