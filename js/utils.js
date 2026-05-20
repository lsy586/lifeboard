// 공통 헬퍼: 날짜 처리, 모달, 유틸
function shiftDateStr(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function calculateDDay(targetDateStr) {
    if (!targetDateStr) return "";
    const target = new Date(targetDateStr + "T00:00:00");
    const today = new Date(TODAY_BASE_STR + "T00:00:00");
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "D-Day";
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function getMonthDaysInfo(year, month) {
    const days = [];
    const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevDaysInMonth = new Date(year, month - 1, 0).getDate();
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;

    for (let i = firstDow - 1; i >= 0; i--) {
        const dnum = prevDaysInMonth - i;
        days.push({ dayNum: dnum, fullDateStr: `${py}-${pad2(pm)}-${pad2(dnum)}`, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ dayNum: i, fullDateStr: `${year}-${pad2(month)}-${pad2(i)}`, isCurrentMonth: true });
    }
    let nd = 1;
    while (days.length < 42) {
        days.push({ dayNum: nd, fullDateStr: `${ny}-${pad2(nm)}-${pad2(nd)}`, isCurrentMonth: false });
        nd++;
    }
    return days;
}

function countWeeksInView(year, month) {
    const days = getMonthDaysInfo(year, month);
    let count = 0;
    for (let n = 1; n <= 6; n++) {
        const s = (n - 1) * 7;
        const slice = days.slice(s, s + 7);
        if (slice.some(d => d.isCurrentMonth)) count = n;
    }
    return count;
}

// 공통 모달 핸들러
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}
