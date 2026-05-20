// 캘린더 (월/주 뷰) 렌더링 + 네비게이션
function goToPrevMonth() {
    if (viewMonth === 1) { viewMonth = 12; viewYear--; } else { viewMonth--; }
    currentSelectedWeekNum = 1;
    renderCalendarMaster();
}
function goToNextMonth() {
    if (viewMonth === 12) { viewMonth = 1; viewYear++; } else { viewMonth++; }
    currentSelectedWeekNum = 1;
    renderCalendarMaster();
}
function goToToday() {
    const d = new Date();
    viewYear = d.getFullYear();
    viewMonth = d.getMonth() + 1;
    currentCalendarMode = 'month';
    currentSelectedWeekNum = 1;
    renderCalendarMaster();
}

function renderCalendarMaster() {
    if(currentCalendarMode === 'month') {
        document.getElementById('box-month-view').classList.remove('hidden');
        document.getElementById('box-week-view').classList.add('hidden');
        renderMonthCalendarView();
    } else {
        document.getElementById('box-month-view').classList.add('hidden');
        document.getElementById('box-week-view').classList.remove('hidden');
        renderWeekCalendarView();
    }
    updateCalendarUIButtons();
}

function switchToCalendarMode(mode, weekNum = 1) {
    currentCalendarMode = mode;
    currentSelectedWeekNum = weekNum;
    renderCalendarMaster();
}

function updateCalendarUIButtons() {
    const headerLabel = `${viewYear}년 ${viewMonth}월 캘린더`;
    const titleEl = document.getElementById('calendar-header-title');
    if (titleEl) titleEl.innerText = headerLabel;
    const sideEl = document.getElementById('sidebar-cal-label');
    if (sideEl) sideEl.innerText = `${viewMonth}월 캘린더`;

    const container = document.getElementById('calendar-mode-buttons');
    if (!container) return;
    container.innerHTML = "";

    const inactiveCls = "px-2.5 py-1.5 text-[11px] font-bold rounded-lg text-slate-600 hover:bg-white inline-block";
    const activeCls = "px-3 py-1.5 text-[11px] font-black rounded-lg bg-white text-slate-800 shadow-xs border border-slate-200/50 inline-block";

    const monthBtn = document.createElement('button');
    monthBtn.id = 'btn-mode-month';
    monthBtn.onclick = () => switchToCalendarMode('month');
    monthBtn.innerText = '월 (확대뷰)';
    monthBtn.className = currentCalendarMode === 'month' ? activeCls : inactiveCls;
    container.appendChild(monthBtn);

    const numWeeks = countWeeksInView(viewYear, viewMonth);
    for (let w = 1; w <= numWeeks; w++) {
        const b = document.createElement('button');
        b.id = `btn-mode-w${w}`;
        b.onclick = () => switchToCalendarMode('week', w);
        b.innerText = `${w}주차`;
        b.className = (currentCalendarMode === 'week' && currentSelectedWeekNum === w) ? activeCls : inactiveCls;
        container.appendChild(b);
    }
}

function renderMonthCalendarView() {
    const grid = document.getElementById('month-calendar-grid');
    grid.innerHTML = "";
    const allDays = getMonthDaysInfo(viewYear, viewMonth);

    allDays.forEach(day => {
        const exams = getExamsForDate(day.fullDateStr);
        const isExamDay = exams.length > 0 && day.isCurrentMonth;

        const div = document.createElement('div');
        let baseBg = day.isCurrentMonth ? 'bg-white hover:border-theme-orange' : 'bg-slate-50/70 opacity-40';
        if (isExamDay) baseBg = 'bg-pink-100 hover:border-pink-400 border-pink-200';
        div.className = `p-0.5 sm:p-2 border border-slate-100 rounded-md sm:rounded-xl min-h-[55px] sm:min-h-[90px] flex flex-col justify-between cursor-pointer transition text-left ${baseBg}`;

        if(day.fullDateStr === TODAY_BASE_STR) {
            div.className += " ring-2 ring-red-500 border-red-500";
            if (!isExamDay) div.className += " bg-red-50/30";
        }

        div.onclick = () => selectDateForInlineEditor(day.fullDateStr);

        const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === day.fullDateStr);
        const scheduleTexts = day.isCurrentMonth ? getSchedulesForDate(day.fullDateStr) : [];

        let examRow = "";
        if (isExamDay) {
            examRow = exams.map(c => {
                const dday = calculateDDay(c.exam_date);
                return `<span class="px-0.5 sm:px-1 text-[7px] sm:text-[9px] bg-pink-500 text-white font-black rounded truncate">🎯 ${c.name} ${dday}</span>`;
            }).join('');
        }

        let scheduleRows = "";
        if (scheduleTexts.length > 0) {
            const shown = scheduleTexts.slice(0, 2);
            scheduleRows = shown.map(t =>
                `<span class="px-0.5 sm:px-1 text-[7px] sm:text-[9px] bg-indigo-100 text-indigo-700 font-black rounded truncate">📌 ${t}</span>`
            ).join('');
            if (scheduleTexts.length > 2) {
                scheduleRows += `<span class="px-0.5 sm:px-1 text-[7px] sm:text-[9px] bg-indigo-50 text-indigo-500 font-black rounded truncate">+${scheduleTexts.length - 2}</span>`;
            }
        }

        let badgeRows = "";
        if(log) {
            if (log.study_todos && log.study_todos.length > 0) badgeRows += `<span class="px-0.5 sm:px-1 text-[7px] sm:text-[9px] bg-orange-100 text-theme-orange font-black rounded truncate">📚${log.study_todos.length}</span>`;
            if (log.diet_am_w || log.diet_pm_w) badgeRows += `<span class="px-0.5 sm:px-1 text-[7px] sm:text-[9px] bg-emerald-100 text-emerald-700 font-black rounded truncate">⚖️</span>`;
        }

        div.innerHTML = `
            <span class="text-[10px] sm:text-xs font-black ${isExamDay ? 'text-pink-700' : 'text-slate-700'}">${day.dayNum}</span>
            <div class="flex flex-col gap-0.5 mt-1 overflow-hidden shrink-0">${examRow}${scheduleRows}${badgeRows}</div>
        `;
        grid.appendChild(div);
    });
}

function renderWeekCalendarView() {
    const grid = document.getElementById('week-days-grid');
    grid.innerHTML = "";
    document.getElementById('week-view-title').innerText = `${viewYear}년 ${viewMonth}월 [${currentSelectedWeekNum}주차] 타임라인 스케줄`;

    const allDays = getMonthDaysInfo(viewYear, viewMonth);
    // 일요일 시작 7일 슬라이싱 (월 그리드와 동일한 SUN-start 기준)
    const startIdx = (currentSelectedWeekNum - 1) * 7;
    const targetWeekDays = allDays.slice(startIdx, startIdx + 7);

    targetWeekDays.forEach(day => {
        const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === day.fullDateStr);
        const todos = log ? log.study_todos || [] : [];
        const spends = log ? log.spends || [] : [];
        const workouts = log ? log.workouts || [] : [];
        const meals = log && log.meals ? log.meals : { morning: "", lunch: "", dinner: "" };
        const amW = log ? log.diet_am_w : null;
        const pmW = log ? log.diet_pm_w : null;
        const scheduleTexts = getSchedulesForDate(day.fullDateStr);
        const exams = getExamsForDate(day.fullDateStr);

        // 모바일에서는 글자 작게(text-[8px]) + 2줄 클램프, 데스크탑은 기존(text-[10px]) 유지
        const itemBase = "p-0.5 sm:p-1 rounded text-[8px] sm:text-[10px] font-bold line-clamp-2 break-words leading-tight";
        let listHtml = "";
        exams.forEach(c => {
            const dday = calculateDDay(c.exam_date);
            listHtml += `<div class="bg-pink-100 border-l-2 border-pink-500 text-pink-800 ${itemBase}">🎯 ${c.name} ${dday}</div>`;
        });
        todos.forEach(t => listHtml += `<div class="bg-orange-50 border-l-2 border-orange-500 text-orange-800 ${itemBase}">${t.checked ? '✅' : '📚'} [${t.category}] ${t.label}</div>`);
        if (amW || pmW) listHtml += `<div class="bg-emerald-50 border-l-2 border-emerald-500 text-emerald-800 ${itemBase}">⚖️ ${amW || '-'}/${pmW || '-'}kg</div>`;
        if (meals.morning) listHtml += `<div class="bg-yellow-50 border-l-2 border-yellow-500 text-yellow-800 ${itemBase}">🍱 아 ${meals.morning}</div>`;
        if (meals.lunch) listHtml += `<div class="bg-yellow-50 border-l-2 border-yellow-500 text-yellow-800 ${itemBase}">🍱 점 ${meals.lunch}</div>`;
        if (meals.dinner) listHtml += `<div class="bg-yellow-50 border-l-2 border-yellow-500 text-yellow-800 ${itemBase}">🍱 저 ${meals.dinner}</div>`;
        workouts.forEach(w => listHtml += `<div class="bg-teal-50 border-l-2 border-teal-500 text-teal-800 ${itemBase}">💪 ${w}</div>`);
        scheduleTexts.forEach(t => listHtml += `<div class="bg-indigo-50 border-l-2 border-indigo-500 text-indigo-800 ${itemBase}">📌 ${t}</div>`);
        spends.forEach(s => listHtml += `<div class="bg-rose-50 border-l-2 border-rose-500 text-rose-800 ${itemBase}">💸 ${s.memo || ''} -${(s.cost || 0).toLocaleString()}원</div>`);

        const div = document.createElement('div');
        const isExamDay = exams.length > 0;
        div.className = "p-1 sm:p-3 min-h-[200px] sm:min-h-[300px] space-y-1 sm:space-y-2 cursor-pointer hover:bg-slate-50/50 text-left overflow-hidden";
        div.className += isExamDay ? " bg-pink-50" : " bg-white";
        if(day.fullDateStr === TODAY_BASE_STR) {
            div.className += " ring-2 ring-red-500 ring-inset font-black relative z-10";
            if (!isExamDay) div.className += " bg-red-50/30";
        }

        div.onclick = () => selectDateForInlineEditor(day.fullDateStr);
        div.innerHTML = `
            <div class="border-b pb-0.5 sm:pb-1 flex justify-between items-center">
                <span class="text-[9px] sm:text-xs font-black ${isExamDay ? 'text-pink-700' : 'text-slate-800'} truncate"><span class="sm:hidden">${day.dayNum}</span><span class="hidden sm:inline">${day.dayNum}일 (${day.fullDateStr.slice(5)})</span></span>
            </div>
            <div class="space-y-0.5 sm:space-y-1.5 overflow-y-auto max-h-[180px] sm:max-h-[240px] no-scrollbar">${listHtml}</div>
        `;
        grid.appendChild(div);
    });
}
