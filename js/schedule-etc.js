// 그외 일정 통합 관리 탭
function loadEtcScheduleTabMaster() {
    const container = document.getElementById('etc-schedule-tab-master-list');
    container.innerHTML = "";

    // 모든 로그 정보 취합 정렬
    const myLogs = cachedLifeLogs.filter(l => l.user_id === currentActiveUserId && l.schedules && l.schedules.length > 0);

    if(myLogs.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic">등록 처리된 특별 타임 스케줄이 비어있습니다.</p>`;
        return;
    }

    myLogs.forEach(log => {
        if(log.schedules) {
            log.schedules.forEach((s, idx) => {
                const div = document.createElement('div');
                div.className = "flex justify-between items-center bg-slate-50 p-2 border.rounded-xl font-bold text-xs";
                div.innerHTML = `
                    <span>📅 [${log.log_date}] - ${s}</span>
                    <button onclick="deleteEtcScheduleMaster('${log.log_date}', ${idx})" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
                `;
                container.appendChild(div);
            });
        }
    });
}

async function addEtcScheduleFromTab() {
    const dateInput = document.getElementById('input-tab-etc-date');
    const textInput = document.getElementById('input-tab-etc-text');
    const dStr = dateInput.value;
    const text = textInput.value.trim();

    if(!dStr || !text) return;

    const existingLog = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dStr);
    let currentSchedules = existingLog ? existingLog.schedules || [] : [];
    currentSchedules.push(text);

    const payload = {
        user_id: currentActiveUserId,
        log_date: dStr,
        schedules: currentSchedules,
        meals: existingLog ? existingLog.meals : { morning: "", lunch: "", dinner: "" }
    };

    const { error } = await sb.from('daily_life_logs').upsert(payload, { onConflict: 'user_id, log_date' });
    if(error) alert("서버 연동 오류: " + error.message);

    textInput.value = "";
    await refreshAllServerData();
    loadEtcScheduleTabMaster();
}

async function deleteEtcScheduleMaster(dateStr, idx) {
    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dateStr);
    if(!log || !log.schedules) return;

    log.schedules.splice(idx, 1);

    const { error } = await sb.from('daily_life_logs').upsert(log, { onConflict: 'user_id, log_date' });
    if(error) alert("서버 삭제 에러: " + error.message);

    await refreshAllServerData();
    loadEtcScheduleTabMaster();
}
