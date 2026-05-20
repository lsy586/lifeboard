// 일별 상세 관리 보드 (panel-day-inline-editor) 로직
function selectDateForInlineEditor(dateStr) {
    currentSelectedDateStr = dateStr;
    inlineEditorIsEditMode = false;
    pendingInlineTodos = [];
    document.getElementById('panel-day-inline-editor').classList.remove('hidden');
    document.getElementById('inline-date-title').innerText = dateStr;
    renderInlineEditorForm();
    document.getElementById('panel-day-inline-editor').scrollIntoView({ behavior: 'smooth' });
}

function closeInlineEditor() {
    document.getElementById('panel-day-inline-editor').classList.add('hidden');
    inlineEditorIsEditMode = false;
    pendingInlineTodos = [];
}

function getCurrentDayData() {
    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === currentSelectedDateStr);
    return {
        diet_am_w: log ? log.diet_am_w : null,
        diet_pm_w: log ? log.diet_pm_w : null,
        workouts: log && log.workouts ? log.workouts : [],
        meals: log && log.meals ? log.meals : { morning: "", lunch: "", dinner: "" },
        schedules: log && log.schedules ? log.schedules : [],
        spends: log && log.spends ? log.spends : [],
        study_todos: log && log.study_todos ? log.study_todos : []
    };
}

function renderInlineEditorForm() {
    const container = document.getElementById('inline-editor-main-form');
    const toggleZone = document.getElementById('editor-mode-toggle-buttons');
    const data = getCurrentDayData();

    if (!inlineEditorIsEditMode) {
        toggleZone.innerHTML = `
            <button onclick="toggleEditorMode(true)" class="px-3 py-1 bg-slate-800 text-white font-bold rounded-lg text-xs hover:opacity-90 transition">내용 직접 기입/수정</button>
            <button onclick="closeInlineEditor()" class="px-2.5 py-1 bg-slate-200 text-slate-600 font-bold rounded-lg text-xs">닫기</button>
        `;

        let studyRows = "";
        if (data.study_todos.length === 0) {
            studyRows = `<p class="text-xs italic text-slate-400">등록된 과제가 없습니다.</p>`;
        } else {
            data.study_todos.forEach(t => {
                studyRows += `
                    <label class="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100/50">
                        <input type="checkbox" ${t.checked ? 'checked' : ''} onchange="toggleStudyTodoInline(${t.id}, this.checked)" class="w-3.5 h-3.5 accent-theme-orange">
                        <span class="text-xs font-bold ${t.checked ? 'text-slate-400 line-through' : 'text-slate-700'}">[${t.category}] ${t.label}</span>
                    </label>
                `;
            });
        }

        const workoutRows = data.workouts.map(w => `<span class="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-1 rounded-md border border-emerald-100">💪 ${w}</span>`).join(' ') || `<span class="text-xs text-slate-400 italic">미기입</span>`;
        const scheduleRows = data.schedules.map(s => `<span class="inline-block bg-indigo-50 text-indigo-800 text-[11px] font-bold px-2 py-1 rounded-md border border-indigo-100">📌 ${s}</span>`).join(' ') || `<span class="text-xs text-slate-400 italic">미기입</span>`;

        let spendRows = "";
        if (data.spends.length === 0) {
            spendRows = `<span class="text-xs text-slate-400 italic">지출 없음</span>`;
        } else {
            const total = data.spends.reduce((acc, c) => acc + (c.cost || 0), 0);
            spendRows = `<div class="text-xs font-bold text-rose-600 mb-1">총합: -${total.toLocaleString()}원</div><div class="flex flex-wrap gap-1">` +
                data.spends.map(s => `<span class="bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-100">${s.memo || ''} (${(s.cost || 0).toLocaleString()}원)</span>`).join('') + `</div>`;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <h4 class="text-xs font-black text-slate-500 uppercase tracking-wider">📖 공부 과제 체크보드</h4>
                    <div class="space-y-1">${studyRows}</div>
                </div>
                <div class="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                        <h4 class="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">⚖️ 체중 정보</h4>
                        <p class="text-xs font-bold text-slate-700">공복(오전): <span class="text-theme-orange">${data.diet_am_w || '- '}kg</span> / 저녁(오후): <span class="text-theme-orange">${data.diet_pm_w || '- '}kg</span></p>
                    </div>
                    <div>
                        <h4 class="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">🍱 식단 로그</h4>
                        <div class="text-[11px] space-y-0.5 font-semibold text-slate-600">
                            <div>• 아침: ${data.meals.morning || '미기입'}</div>
                            <div>• 점심: ${data.meals.lunch || '미기입'}</div>
                            <div>• 저녁: ${data.meals.dinner || '미기입'}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <h4 class="text-xs font-black text-slate-400 mb-1">🏋️ 피트니스 활동</h4>
                    <div>${workoutRows}</div>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <h4 class="text-xs font-black text-slate-400 mb-1">📅 지정 스케줄</h4>
                    <div>${scheduleRows}</div>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <h4 class="text-xs font-black text-slate-400 mb-1">💸 장부 지출 연동</h4>
                    <div>${spendRows}</div>
                </div>
            </div>
        `;
    } else {
        toggleZone.innerHTML = `
            <button onclick="saveInlineEditorData()" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:opacity-90 transition">저장 적용</button>
            <button onclick="toggleEditorMode(false)" class="px-2.5 py-1 bg-slate-200 text-slate-600 font-bold rounded-lg text-xs">변경 취소</button>
        `;

        const cats = cachedStudyCategories.filter(c => c.user_id === currentActiveUserId);
        const selectOptions = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

        const todoFormHtml = `
            <div class="bg-white p-2 rounded-lg border border-slate-200/60 space-y-1.5">
                <div class="flex gap-1">
                    <select id="form-todo-cat" class="p-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold focus:outline-none">${selectOptions || '<option value="">카테고리 없음</option>'}</select>
                    <input type="text" id="form-todo-text" placeholder="새 공부 할일 텍스트" class="flex-1 p-1 border border-slate-200 rounded text-[11px] font-bold focus:outline-none">
                    <button type="button" onclick="addStudyTodoFromInlineForm()" class="px-2 bg-slate-900 text-white rounded text-[10px] font-black shrink-0">추가</button>
                </div>
                <div id="form-todo-list-preview" class="space-y-1 max-h-24 overflow-y-auto pt-1 border-t border-dashed border-slate-100"></div>
            </div>
        `;

        container.innerHTML = `
            <form id="inline-edit-form-node" onsubmit="event.preventDefault();" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                        <h4 class="text-xs font-black text-slate-700">📖 당일 공부 과제 라인업 제어</h4>
                        ${todoFormHtml}
                    </div>

                    <div class="space-y-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
                        <h4 class="text-xs font-black text-slate-700">⚖️ 체중 및 식단 폼 필드</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 block mb-0.5">오전 공복 체중 (kg)</label>
                                <input type="number" step="0.1" id="form-weight-am" value="${data.diet_am_w||''}" placeholder="예: 71.5" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-white">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 block mb-0.5">오후 저녁 체중 (kg)</label>
                                <input type="number" step="0.1" id="form-weight-pm" value="${data.diet_pm_w||''}" placeholder="예: 72.3" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-white">
                            </div>
                        </div>
                        <div class="space-y-1.5 text-xs font-bold">
                            <input type="text" id="form-meal-m" value="${data.meals.morning||''}" placeholder="아침 식단 내용" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                            <input type="text" id="form-meal-l" value="${data.meals.lunch||''}" placeholder="점심 식단 내용" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                            <input type="text" id="form-meal-d" value="${data.meals.dinner||''}" placeholder="저녁 식단 내용" class="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs">
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div class="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/50 space-y-1.5">
                        <h4 class="text-xs font-black text-slate-700">🏋️ 피트니스 및 운동</h4>
                        <div class="flex gap-1">
                            <input type="text" id="form-workout-text" placeholder="예: 벤치프레스 5세트" class="flex-1 p-1 border border-slate-200 rounded text-[11px] font-bold focus:outline-none bg-white">
                            <button type="button" onclick="addInlineWorkout()" class="px-2 bg-slate-900 text-white rounded text-[10px] font-black shrink-0">추가</button>
                        </div>
                        <div id="form-workouts-preview" class="space-y-1 max-h-24 overflow-y-auto pt-1 border-t border-dashed border-slate-100"></div>
                    </div>
                    <div class="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/50 space-y-1.5">
                        <h4 class="text-xs font-black text-slate-700">📅 개별 스케줄 기입</h4>
                        <div class="flex gap-1">
                            <input type="text" id="form-schedule-text" placeholder="예: 저녁 외식 약속" class="flex-1 p-1 border border-slate-200 rounded text-[11px] font-bold focus:outline-none bg-white">
                            <button type="button" onclick="addInlineSchedule()" class="px-2 bg-slate-900 text-white rounded text-[10px] font-black shrink-0">추가</button>
                        </div>
                        <div id="form-schedules-preview" class="space-y-1 max-h-24 overflow-y-auto pt-1 border-t border-dashed border-slate-100"></div>
                    </div>
                    <div class="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/50 space-y-1.5">
                        <h4 class="text-xs font-black text-slate-700">💸 장부 지출 연동</h4>
                        <div class="flex gap-1">
                            <input type="text" id="form-spend-memo" placeholder="내역" class="flex-1 p-1 border border-slate-200 rounded text-[11px] font-bold focus:outline-none bg-white">
                            <input type="number" id="form-spend-cost" placeholder="금액" class="w-20 p-1 border border-slate-200 rounded text-[11px] font-bold focus:outline-none bg-white">
                            <button type="button" onclick="addInlineSpend()" class="px-2 bg-slate-900 text-white rounded text-[10px] font-black shrink-0">추가</button>
                        </div>
                        <div id="form-spends-preview" class="space-y-1 max-h-24 overflow-y-auto pt-1 border-t border-dashed border-slate-100"></div>
                    </div>
                </div>
            </form>
        `;
        renderInlineFormTodoListPreview();
        renderInlineFormWorkoutsPreview();
        renderInlineFormSchedulesPreview();
        renderInlineFormSpendsPreview();
    }
}

function toggleEditorMode(isEdit) {
    if (isEdit) {
        const d = getCurrentDayData();
        pendingInlineTodos = JSON.parse(JSON.stringify(d.study_todos));
        pendingInlineSchedules = [...d.schedules];
        pendingInlineWorkouts = [...d.workouts];
        pendingInlineSpends = JSON.parse(JSON.stringify(d.spends));
    } else {
        pendingInlineTodos = [];
        pendingInlineSchedules = [];
        pendingInlineWorkouts = [];
        pendingInlineSpends = [];
    }
    inlineEditorIsEditMode = isEdit;
    renderInlineEditorForm();
}

function renderInlineFormTodoListPreview() {
    const previewBox = document.getElementById('form-todo-list-preview');
    if (!previewBox) return;
    previewBox.innerHTML = "";
    if (pendingInlineTodos.length === 0) {
        previewBox.innerHTML = `<span class="text-[10px] text-slate-400 italic">추가된 대기 과제 없음</span>`;
        return;
    }
    pendingInlineTodos.forEach(t => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700";
        div.innerHTML = `
            <span class="truncate">${t.checked ? '✅' : '⬜'} [${t.category}] ${t.label}</span>
            <button type="button" onclick="deleteStudyTodoFromInlineForm(${t.id})" class="text-rose-500 hover:text-rose-700 font-bold px-1">✕</button>
        `;
        previewBox.appendChild(div);
    });
}

function addStudyTodoFromInlineForm() {
    const catInput = document.getElementById('form-todo-cat');
    const textInput = document.getElementById('form-todo-text');
    if (!catInput || !textInput || textInput.value.trim() === "") return;
    const newId = Date.now() + Math.floor(Math.random() * 100);
    pendingInlineTodos.push({
        id: newId,
        category: catInput.value,
        label: textInput.value.trim(),
        checked: false
    });
    textInput.value = "";
    renderInlineFormTodoListPreview();
}

function deleteStudyTodoFromInlineForm(id) {
    pendingInlineTodos = pendingInlineTodos.filter(t => t.id !== id);
    renderInlineFormTodoListPreview();
}

function renderInlineFormWorkoutsPreview() {
    const box = document.getElementById('form-workouts-preview');
    if (!box) return;
    box.innerHTML = "";
    if (pendingInlineWorkouts.length === 0) {
        box.innerHTML = `<span class="text-[10px] text-slate-400 italic">추가된 운동 없음</span>`;
        return;
    }
    pendingInlineWorkouts.forEach((w, i) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700";
        div.innerHTML = `<span class="truncate">💪 ${w}</span><button type="button" onclick="deleteInlineWorkout(${i})" class="text-rose-500 hover:text-rose-700 font-bold px-1">✕</button>`;
        box.appendChild(div);
    });
}

function addInlineWorkout() {
    const inp = document.getElementById('form-workout-text');
    if (!inp || inp.value.trim() === "") return;
    pendingInlineWorkouts.push(inp.value.trim());
    inp.value = "";
    renderInlineFormWorkoutsPreview();
}

function deleteInlineWorkout(idx) {
    pendingInlineWorkouts.splice(idx, 1);
    renderInlineFormWorkoutsPreview();
}

function renderInlineFormSchedulesPreview() {
    const box = document.getElementById('form-schedules-preview');
    if (!box) return;
    box.innerHTML = "";
    if (pendingInlineSchedules.length === 0) {
        box.innerHTML = `<span class="text-[10px] text-slate-400 italic">추가된 스케줄 없음</span>`;
        return;
    }
    pendingInlineSchedules.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700";
        div.innerHTML = `<span class="truncate">📌 ${s}</span><button type="button" onclick="deleteInlineSchedule(${i})" class="text-rose-500 hover:text-rose-700 font-bold px-1">✕</button>`;
        box.appendChild(div);
    });
}

function addInlineSchedule() {
    const inp = document.getElementById('form-schedule-text');
    if (!inp || inp.value.trim() === "") return;
    pendingInlineSchedules.push(inp.value.trim());
    inp.value = "";
    renderInlineFormSchedulesPreview();
}

function deleteInlineSchedule(idx) {
    pendingInlineSchedules.splice(idx, 1);
    renderInlineFormSchedulesPreview();
}

function renderInlineFormSpendsPreview() {
    const box = document.getElementById('form-spends-preview');
    if (!box) return;
    box.innerHTML = "";
    if (pendingInlineSpends.length === 0) {
        box.innerHTML = `<span class="text-[10px] text-slate-400 italic">추가된 지출 없음</span>`;
        return;
    }
    pendingInlineSpends.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700";
        div.innerHTML = `<span class="truncate">💸 ${s.memo} -${(s.cost || 0).toLocaleString()}원</span><button type="button" onclick="deleteInlineSpend(${i})" class="text-rose-500 hover:text-rose-700 font-bold px-1">✕</button>`;
        box.appendChild(div);
    });
}

function addInlineSpend() {
    const memo = document.getElementById('form-spend-memo');
    const cost = document.getElementById('form-spend-cost');
    if (!memo || !cost || memo.value.trim() === "" || !cost.value) return;
    pendingInlineSpends.push({ memo: memo.value.trim(), cost: parseInt(cost.value) || 0 });
    memo.value = "";
    cost.value = "";
    renderInlineFormSpendsPreview();
}

function deleteInlineSpend(idx) {
    pendingInlineSpends.splice(idx, 1);
    renderInlineFormSpendsPreview();
}

async function toggleStudyTodoInline(todoId, isChecked) {
    const data = getCurrentDayData();
    const updatedTodos = data.study_todos.map(t => t.id === todoId ? { ...t, checked: isChecked } : t);
    const payload = {
        user_id: currentActiveUserId,
        log_date: currentSelectedDateStr,
        diet_am_w: data.diet_am_w,
        diet_pm_w: data.diet_pm_w,
        meals: data.meals,
        workouts: data.workouts,
        schedules: data.schedules,
        spends: data.spends,
        study_todos: updatedTodos
    };
    const { error } = await sb.from('daily_life_logs').upsert(payload, { onConflict: 'user_id, log_date' });
    if (error) { alert("체크 상태 저장 실패: " + error.message); return; }
    await refreshAllServerData();
    renderCalendarMaster();
    renderInlineEditorForm();
}

async function saveInlineEditorData() {
    const amVal = parseFloat(document.getElementById('form-weight-am').value) || null;
    const pmVal = parseFloat(document.getElementById('form-weight-pm').value) || null;
    const morning = document.getElementById('form-meal-m').value.trim();
    const lunch = document.getElementById('form-meal-l').value.trim();
    const dinner = document.getElementById('form-meal-d').value.trim();

    const payload = {
        user_id: currentActiveUserId,
        log_date: currentSelectedDateStr,
        diet_am_w: amVal,
        diet_pm_w: pmVal,
        meals: { morning, lunch, dinner },
        workouts: pendingInlineWorkouts,
        schedules: pendingInlineSchedules,
        spends: pendingInlineSpends,
        study_todos: pendingInlineTodos
    };

    const { error } = await sb.from('daily_life_logs').upsert(payload, { onConflict: 'user_id, log_date' });
    if (error) { alert("인라인 편집 데이터 백엔드 동기화 실패: " + error.message); return; }

    inlineEditorIsEditMode = false;
    pendingInlineTodos = [];
    pendingInlineSchedules = [];
    pendingInlineWorkouts = [];
    pendingInlineSpends = [];
    await refreshAllServerData();
    renderCalendarMaster();
    renderInlineEditorForm();
}
